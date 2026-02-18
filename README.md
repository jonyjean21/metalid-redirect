# 🎴 METALID

モルックコミュニティ向けの**金属製IDカードシステム**。
カードに印刷されたQRコードをスキャンすると、各メンバーのプロフィールハブページが開きます。

---

## 📖 このプロジェクトについて

METALIDは以下の機能を提供します：

- **メンバーハブページ** (`/u/{会員番号}`) — 公開プロフィール、SNSリンク、チーム情報など
- **詳細プロフィールページ** (`/u/{会員番号}/profile`) — 試合記録、統計（Phase 2以降）
- **メンバー登録フロー** — 招待トークン制（管理者が発行したQRを経由して登録）
- **管理者ダッシュボード** (`/admin`) — 会員管理、招待URL発行、QRコード表示

---

## 🏗️ 技術スタック

| カテゴリ | 技術 |
|--------|------|
| フレームワーク | Next.js 14 (App Router) |
| スタイリング | Tailwind CSS |
| データベース | Supabase (PostgreSQL) |
| 認証 | Supabase Auth (メール認証) |
| ストレージ | Supabase Storage |
| ホスティング | Vercel |
| QRコード | qrcode.react |

---

## 🚀 セットアップ手順

### 前提条件

- Node.js 18以上がインストールされていること
- [Supabase](https://supabase.com) アカウント（無料プランでOK）
- [Vercel](https://vercel.com) アカウント（デプロイ用、無料プランでOK）

---

### Step 1: リポジトリのクローン

```bash
git clone <リポジトリURL>
cd metalid-redirect
npm install
```

---

### Step 2: Supabaseプロジェクトを作成する

1. [supabase.com](https://supabase.com) にアクセスしてログイン
2. **New project** をクリック
3. プロジェクト名・パスワード・リージョン（Northeast Asia推奨）を設定して作成
4. プロジェクトが起動するまで1〜2分待つ

---

### Step 3: データベーススキーマをセットアップする

1. Supabaseの左メニューから **SQL Editor** を開く
2. `supabase/schema.sql` の内容をすべてコピーして貼り付ける
3. **Run**（または `⌘↵`）をクリックして実行する
4. 「Success」が表示されればOK

---

### Step 4: 環境変数を設定する

```bash
cp .env.local.example .env.local
```

`.env.local` を開いて以下を設定：

| 変数名 | 場所 | 説明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL | SupabaseプロジェクトのURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon key | 公開APIキー |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role key | 管理者用キー（サーバーサイドのみ） |
| `NEXT_PUBLIC_APP_URL` | — | 本番URLまたは `http://localhost:3000` |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` はサーバーサイドのみで使用し、公開しないでください。

---

### Step 5: 開発サーバーを起動する

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認します。

---

### Step 6: 最初の管理者アカウントを作成する

1. Supabaseダッシュボードの **Authentication → Users → Add user** から管理者メールアドレスでユーザーを作成
2. **SQL Editor** で以下を実行して管理者権限を付与：

```sql
INSERT INTO public.members (id, type, status, is_admin)
VALUES ('000001', 'profile', 'active', true);

UPDATE public.members
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'あなたのメールアドレス')
WHERE id = '000001';
```

3. `/login` でログインして `/admin` にアクセスし、ダッシュボードが表示されればOK

---

### Step 7: 新しい会員を追加する

1. 管理者として `/admin/members/new` にアクセス
2. 会員番号・カード種別を入力して**会員を作成して招待URLを発行**をクリック
3. 表示されたQRコードを印刷して金属カードと一緒に渡す
4. 会員はQRをスキャンして招待URLにアクセス → メールアドレス登録 → 認証メール確認

---

## 📁 ディレクトリ構成

```
metalid-redirect/
├── app/
│   ├── api/admin/          # APIルート（会員作成・トークン再発行）
│   ├── auth/callback/      # メール認証コールバック
│   ├── login/              # ログインページ
│   ├── register/           # 会員登録ページ（招待トークン認証）
│   ├── my/                 # マイページ・プロフィール編集
│   ├── u/[id]/             # 公開ハブページ
│   └── admin/              # 管理者ダッシュボード
├── lib/supabase/
│   ├── client.ts           # ブラウザ用Supabaseクライアント
│   └── server.ts           # サーバー用クライアント（管理者クライアント含む）
├── middleware.ts            # 認証ルート保護（/my, /admin）
├── supabase/
│   └── schema.sql          # DBスキーマ定義・RLSポリシー・トリガー
├── types/
│   └── database.ts         # TypeScript型定義
└── .env.local.example      # 環境変数テンプレート
```

---

## 🔐 認証フロー

```
管理者が招待URL発行（30日有効）
        ↓
会員がQRコードをスキャン
        ↓
/register?token=xxx にアクセス
        ↓
メールアドレス + パスワードを入力
        ↓
Supabase Auth が確認メール送信
        ↓
リンクをクリックして認証完了
        ↓
DBトリガーが auth_user_id を member に紐付け
        ↓
/my/edit でプロフィール編集
```

---

## 🗄️ データベース構成

| テーブル | 説明 |
|--------|------|
| `members` | 会員基本情報（ID・種別・ステータス・管理者フラグ） |
| `profiles` | プロフィール詳細（モルックネーム・チーム・SNS等） |
| `links` | SNSリンク（各会員最大5件） |
| `invite_tokens` | 招待トークン（30日有効・使用済み管理） |

すべてのテーブルにRow Level Security (RLS)が設定されています。

---

## 🚢 Vercelへのデプロイ

1. GitHubにpushする
2. [vercel.com](https://vercel.com) で **New Project** → GitHubリポジトリを選択
3. **Environment Variables** に `.env.local` と同じ値を設定
4. **Deploy** をクリック
5. デプロイ後、`NEXT_PUBLIC_APP_URL` を本番URLに更新する

---

## 💡 開発ロードマップ

| Phase | 内容 | 状態 |
|-------|------|------|
| Phase 1 | 基盤（認証・ハブページ・管理） | ✅ 完成 |
| Phase 2 | 記録（試合・大会記録） | 🔜 次フェーズ |
| Phase 3 | 収集（カードコレクション） | 📋 計画中 |
| Phase 4 | 実績（バッジ・統計） | 📋 計画中 |

---

## 🛠️ よくあるトラブル

### ページが「404」になる
→ `members` テーブルに該当IDのレコードがあるか、`status = 'active'` かを確認

### 招待URLが「無効」と表示される
→ トークンの有効期限（30日）が切れている可能性。管理者ページで再発行する

### ログインできない
→ Supabase Dashboard の Authentication → Users でユーザーが存在するか確認

### 管理者ページにアクセスできない
→ `members` テーブルで `is_admin = true` が設定されているか確認

---

## 📄 関連ドキュメント

- [REQUIREMENTS.md](./REQUIREMENTS.md) — 詳細な要件定義書（日本語）
- [supabase/schema.sql](./supabase/schema.sql) — データベーススキーマ
- [public/guide.html](./public/guide.html) — システム概要ガイド（ブラウザで表示可能）
