-- ======================================================
-- METALID データベーススキーマ
-- Supabaseのダッシュボード > SQL Editor に貼り付けて実行する
-- ======================================================

-- UUID拡張を有効化
create extension if not exists "uuid-ossp";

-- ======================================================
-- テーブル作成
-- ======================================================

-- 会員基本情報
create table public.members (
  id           varchar(6) primary key,          -- 会員番号 "000001"
  auth_user_id uuid references auth.users(id) on delete set null,
  email        varchar(255),
  type         varchar(10) not null default 'profile'
                 check (type in ('profile', 'redirect')),
  status       varchar(10) not null default 'pending'
                 check (status in ('pending', 'active')),
  redirect_url text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now(),
  last_login_at timestamptz
);

-- プロフィール情報
create table public.profiles (
  member_id       varchar(6) primary key references public.members(id) on delete cascade,
  molkky_name     varchar(50) not null default '',
  avatar_url      text,
  bio_short       varchar(100),
  bio_long        text,
  team_name       varchar(100),
  region          varchar(20),
  career_start    date,
  privacy_settings jsonb not null default '{
    "team_name": true,
    "region": true,
    "career_start": true,
    "bio_long": true,
    "tournaments": true,
    "stats": true
  }'::jsonb,
  updated_at      timestamptz not null default now()
);

-- SNSリンク（最大5件）
create table public.links (
  id            uuid primary key default uuid_generate_v4(),
  member_id     varchar(6) not null references public.members(id) on delete cascade,
  platform      varchar(20) not null
                  check (platform in ('x', 'instagram', 'facebook', 'youtube', 'website')),
  label         varchar(50) not null,
  url           text not null,
  display_order int not null default 0,
  unique (member_id, display_order)
);

-- 招待トークン
create table public.invite_tokens (
  token      uuid primary key default uuid_generate_v4(),
  member_id  varchar(6) not null references public.members(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '30 days'),
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ======================================================
-- Row Level Security (RLS)
-- ======================================================

alter table public.members       enable row level security;
alter table public.profiles      enable row level security;
alter table public.links         enable row level security;
alter table public.invite_tokens enable row level security;

-- members: 誰でも読める / 自分のレコードのみ更新可
create policy "members_select_all" on public.members
  for select using (true);

create policy "members_update_own" on public.members
  for update using (auth.uid() = auth_user_id);

-- profiles: 誰でも読める / 自分のプロフィールのみ書き込み可
create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_insert_own" on public.profiles
  for insert with check (
    auth.uid() = (select auth_user_id from public.members where id = member_id)
  );

create policy "profiles_update_own" on public.profiles
  for update using (
    auth.uid() = (select auth_user_id from public.members where id = member_id)
  );

-- links: 誰でも読める / 自分のリンクのみ書き込み可
create policy "links_select_all" on public.links
  for select using (true);

create policy "links_all_own" on public.links
  for all using (
    auth.uid() = (select auth_user_id from public.members where id = member_id)
  );

-- invite_tokens: Service Role のみ操作（管理者API経由）
-- anon/authenticated ユーザーはアクセス不可
create policy "invite_tokens_no_access" on public.invite_tokens
  for all using (false);

-- ======================================================
-- トリガー: 新規ユーザー登録時にメンバーと紐付け
-- ======================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  v_token    text;
  v_member_id varchar(6);
begin
  -- auth.signUp() 時に渡した invite_token メタデータを取得
  v_token := new.raw_user_meta_data->>'invite_token';

  if v_token is not null then
    -- 有効なトークンからメンバーIDを取得
    select member_id into v_member_id
    from public.invite_tokens
    where token = v_token::uuid
      and used_at is null
      and expires_at > now();

    if v_member_id is not null then
      -- メンバーレコードを auth user と紐付け、status を active に
      update public.members
      set auth_user_id = new.id,
          email        = new.email,
          status       = 'active'
      where id = v_member_id;

      -- トークンを使用済みにする
      update public.invite_tokens
      set used_at = now()
      where token = v_token::uuid;

      -- プロフィールの初期レコードを作成
      insert into public.profiles (member_id, molkky_name)
      values (v_member_id, split_part(new.email, '@', 1))
      on conflict (member_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

-- auth.users に INSERT された直後にトリガー実行
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ======================================================
-- ヘルパー関数: 現在のログインユーザーのメンバーIDを返す
-- ======================================================

create or replace function public.my_member_id()
returns varchar(6)
language sql
stable
as $$
  select id from public.members where auth_user_id = auth.uid() limit 1;
$$;

-- ======================================================
-- 初期管理者設定の手順
-- ======================================================
-- 1. 管理者本人のメールアドレスで Supabase Auth > Users からユーザーを手動作成
-- 2. 以下のSQLで管理者フラグを立てる（メールアドレスを書き換えて実行）
--
-- UPDATE public.members
-- SET is_admin = true
-- WHERE email = 'admin@example.com';
--
-- ※ 管理者メンバーレコードは別途 INSERT が必要:
-- INSERT INTO public.members (id, email, type, status, is_admin)
-- VALUES ('000000', 'admin@example.com', 'profile', 'active', true);
