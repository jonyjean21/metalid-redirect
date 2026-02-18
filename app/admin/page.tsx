import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('members')
    .select('id, is_admin')
    .eq('auth_user_id', user.id)
    .single()

  if (!member?.is_admin) redirect('/my')

  // 統計
  const { count: totalCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })

  const { count: activeCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: pendingCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">管理者ダッシュボード</h1>
          <Link href="/my" className="text-purple-200 hover:text-white text-sm">
            ← マイページ
          </Link>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '総会員数', value: totalCount ?? 0, color: 'text-purple-600' },
            { label: 'アクティブ', value: activeCount ?? 0, color: 'text-green-600' },
            { label: '未登録', value: pendingCount ?? 0, color: 'text-amber-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl shadow p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* メニュー */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <Link
            href="/admin/members/new"
            className="flex items-center gap-3 px-5 py-4 hover:bg-purple-50 border-b border-gray-100 transition-colors"
          >
            <span className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">➕</span>
            <div>
              <p className="font-medium text-gray-800">新規会員を作成</p>
              <p className="text-xs text-gray-400">会員番号の割り当てと招待URL発行</p>
            </div>
            <span className="ml-auto text-gray-300">›</span>
          </Link>

          <Link
            href="/admin/members"
            className="flex items-center gap-3 px-5 py-4 hover:bg-purple-50 transition-colors"
          >
            <span className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">👥</span>
            <div>
              <p className="font-medium text-gray-800">会員一覧</p>
              <p className="text-xs text-gray-400">登録状況の確認・管理</p>
            </div>
            <span className="ml-auto text-gray-300">›</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
