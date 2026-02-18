import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminMembersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('members').select('is_admin').eq('auth_user_id', user.id).single()
  if (!me?.is_admin) redirect('/my')

  const { data: members } = await supabase
    .from('members')
    .select(`
      id, type, status, email, is_admin, created_at,
      profiles(molkky_name),
      invite_tokens(token, expires_at, used_at, created_at)
    `)
    .order('id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-purple-200 hover:text-white text-sm">
              ← ダッシュボード
            </Link>
            <h1 className="text-2xl font-bold text-white mt-1">会員一覧</h1>
          </div>
          <Link
            href="/admin/members/new"
            className="bg-white text-purple-700 font-bold px-4 py-2 rounded-xl shadow hover:shadow-md transition text-sm"
          >
            ＋ 新規作成
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {!members || members.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              まだ会員が登録されていません
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">会員番号</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">名前</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">状態</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">種別</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
                  const token = Array.isArray(m.invite_tokens)
                    ? m.invite_tokens.find(t => !t.used_at && new Date(t.expires_at) > new Date())
                    : null

                  return (
                    <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-medium text-purple-700">
                        #{m.id}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {profile?.molkky_name || (
                          <span className="text-gray-400 italic">未設定</span>
                        )}
                        {m.is_admin && (
                          <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                            管理者
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {m.type}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/members/${m.id}`}
                          className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                        >
                          詳細 →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    active:  { label: 'アクティブ', className: 'bg-green-100 text-green-700' },
    pending: { label: '未登録',     className: 'bg-amber-100 text-amber-700' },
  }[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
