export type Database = {
  public: {
    Tables: {
      members: {
        Row: Member
        Insert: Omit<Member, 'created_at'> & { created_at?: string }
        Update: Partial<Member>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'updated_at'> & { updated_at?: string }
        Update: Partial<Profile>
      }
      links: {
        Row: Link
        Insert: Omit<Link, 'id'>
        Update: Partial<Link>
      }
      invite_tokens: {
        Row: InviteToken
        Insert: Omit<InviteToken, 'created_at'> & { created_at?: string }
        Update: Partial<InviteToken>
      }
    }
  }
}

export interface Member {
  id: string                  // 会員番号 "000001"
  auth_user_id: string | null // Supabase auth user ID
  email: string | null
  type: 'profile' | 'redirect'
  status: 'pending' | 'active'
  redirect_url: string | null
  is_admin: boolean
  created_at: string
  last_login_at: string | null
}

export interface Profile {
  member_id: string
  molkky_name: string
  avatar_url: string | null
  bio_short: string | null    // 一言自己紹介（ハブページ用、100文字以内）
  bio_long: string | null     // 詳細自己紹介（プロフィールページ用）
  team_name: string | null
  region: string | null
  career_start: string | null // date
  privacy_settings: PrivacySettings
  updated_at: string
}

export interface PrivacySettings {
  team_name: boolean
  region: boolean
  career_start: boolean
  bio_long: boolean
  tournaments: boolean
  stats: boolean
}

export interface Link {
  id: string
  member_id: string
  platform: 'x' | 'instagram' | 'facebook' | 'youtube' | 'website'
  label: string
  url: string
  display_order: number
}

export interface InviteToken {
  token: string
  member_id: string
  expires_at: string
  used_at: string | null
  created_at: string
}

export const PLATFORM_LABELS: Record<Link['platform'], string> = {
  x: 'X（旧Twitter）',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  website: 'ホームページ',
}

export const PLATFORM_EMOJIS: Record<Link['platform'], string> = {
  x: '𝕏',
  instagram: '📷',
  facebook: '👤',
  youtube: '▶️',
  website: '🌐',
}

export const DEFAULT_PRIVACY: PrivacySettings = {
  team_name: true,
  region: true,
  career_start: true,
  bio_long: true,
  tournaments: true,
  stats: true,
}

export const REGIONS = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]
