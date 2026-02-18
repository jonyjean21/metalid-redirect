import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import InviteUrlSection from './InviteUrlSection'

interface Props {
  params: { id: string }
}

export default async function MemberDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('members').select('is_admin').eq('auth_user_id', user.id).single()
  if (!me?.is_admin) redirect('/my')

  const adminClient = createAdminClient()
  const { data: member } = await adminClient
    .from('members')
    .select(`
      id, email, type, status, redirect_url, is_admin, created_at,
      profiles(molkky_name, bio_short, team_name, region),
      invite_tokens(token, expires_at, used_at, created_at)
    `)
    .eq('id', params.id)
    .single()

  if (!member) redirect('/admin/members')

  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
  const tokens = Array.isArray(member.invite_tokens) ? member.invite_tokens : []
  const activeToken = tokens.find(t => !t.used_at && new Date(t.expires_at) > new Date())

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = activeToken ? `${appUrl}/register?token=${activeToken.token}` : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 py-8">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="mb-2">
          <Link href="/admin/members" className="text-purple-200 hover:text-white text-sm">
            ← 会員一覧
          </Link>
          <h1 className="text-2xl font-bold text-white mt-1">会員 #{member.id}</h1>
        </div>

        {/* 基本情報 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="font-bold text-gray-800 mb-4">基本情報</h2>
          <dl className="space-y-2 text-sm">
            <Row label="会員番号" value={`#${member.id}`} />
            <Row label="状態" value={member.status === 'active' ? '✅ アクティブ' : '⏳ 未登録'} />
            <Row label="種別" value={member.type} />
            <Row label="メール" value={member.email ?? '（未登録）'} />
            <Row label="モルックネーム" value={profile?.molkky_name ?? '（未設定）'} />
            <Row label="チーム" value={profile?.team_name ?? '（未設定）'} />
            <Row label="作成日" value={new Date(member.created_at).toLocaleDateString('ja-JP')} />
          </dl>
        </div>

        {/* 招待URL */}
        <InviteUrlSection
          memberId={member.id}
          inviteUrl={inviteUrl}
          memberStatus={member.status}
        />

        {/* プロフィールページリンク */}
        {member.status === 'active' && (
          <Link
            href={`/u/${member.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-purple-700 rounded-xl font-medium hover:bg-purple-50 transition shadow"
          >
            プロフィールページを見る →
          </Link>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 text-gray-400 flex-shrink-0">{label}</dt>
      <dd className="text-gray-700">{value}</dd>
    </div>
  )
}
