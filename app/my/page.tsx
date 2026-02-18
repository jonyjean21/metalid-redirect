import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('members')
    .select('id, is_admin, profiles(molkky_name)')
    .eq('auth_user_id', user.id)
    .single()

  if (!member) redirect('/login')

  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
  const name = profile?.molkky_name || `会員 #${member.id}`

  async function handleLogout() {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 py-8">
      <div className="max-w-sm mx-auto space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-white">マイページ</h1>
          <p className="text-purple-200 text-sm mt-1">{name}</p>
        </div>

        {/* メニュー */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <Link
            href={`/u/${member.id}`}
            className="flex items-center gap-3 px-5 py-4 hover:bg-purple-50 border-b border-gray-100 transition-colors"
          >
            <span className="text-xl">🏅</span>
            <div>
              <p className="font-medium text-gray-800">自分のページを見る</p>
              <p className="text-xs text-gray-400">metalid.jp/u/{member.id}</p>
            </div>
            <span className="ml-auto text-gray-300">›</span>
          </Link>

          <Link
            href="/my/edit"
            className="flex items-center gap-3 px-5 py-4 hover:bg-purple-50 border-b border-gray-100 transition-colors"
          >
            <span className="text-xl">✏️</span>
            <div>
              <p className="font-medium text-gray-800">プロフィール編集</p>
              <p className="text-xs text-gray-400">名前・bio・SNSリンクを編集</p>
            </div>
            <span className="ml-auto text-gray-300">›</span>
          </Link>

          {member.is_admin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-5 py-4 hover:bg-purple-50 border-b border-gray-100 transition-colors"
            >
              <span className="text-xl">🛠</span>
              <div>
                <p className="font-medium text-gray-800">管理者ダッシュボード</p>
                <p className="text-xs text-gray-400">会員管理・招待URL発行</p>
              </div>
              <span className="ml-auto text-gray-300">›</span>
            </Link>
          )}
        </div>

        {/* ログアウト */}
        <form action={handleLogout}>
          <button
            type="submit"
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-medium"
          >
            ログアウト
          </button>
        </form>
      </div>
    </div>
  )
}
