import { createAdminClient } from '@/lib/supabase/server'
import RegisterForm from './RegisterForm'
import { notFound } from 'next/navigation'

interface Props {
  searchParams: { token?: string }
}

export default async function RegisterPage({ searchParams }: Props) {
  const token = searchParams.token

  if (!token) {
    notFound()
  }

  // トークンの有効性を検証（Service Role で invite_tokens を直接参照）
  const supabase = createAdminClient()
  const { data: tokenData } = await supabase
    .from('invite_tokens')
    .select('token, member_id, expires_at, used_at, members(id, status, type)')
    .eq('token', token)
    .single()

  if (!tokenData || tokenData.used_at) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">招待リンクが無効です</h2>
          <p className="text-gray-500 text-sm">
            このURLはすでに使用済みか、有効期限が切れています。<br />
            管理者に再発行を依頼してください。
          </p>
        </div>
      </div>
    )
  }

  if (new Date(tokenData.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">招待リンクの有効期限切れ</h2>
          <p className="text-gray-500 text-sm">
            招待リンクの有効期限（30日）が切れています。<br />
            管理者に再発行を依頼してください。
          </p>
        </div>
      </div>
    )
  }

  const member = Array.isArray(tokenData.members) ? tokenData.members[0] : tokenData.members
  const memberId = member?.id ?? tokenData.member_id

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-wider">METALID</h1>
          <p className="text-purple-200 mt-1 text-sm">モルックコミュニティ</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🏅</div>
            <h2 className="text-xl font-bold text-purple-900">会員登録</h2>
            <p className="text-sm text-gray-500 mt-1">会員番号: {memberId}</p>
          </div>

          <RegisterForm token={token} memberId={memberId} />
        </div>

        <p className="text-center text-purple-200 text-xs mt-6">
          登録後、確認メールをクリックしてアカウントを有効化してください
        </p>
      </div>
    </div>
  )
}
