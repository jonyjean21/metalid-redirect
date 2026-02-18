import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewMemberForm from './NewMemberForm'

export default async function NewMemberPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('members').select('is_admin').eq('auth_user_id', user.id).single()
  if (!me?.is_admin) redirect('/my')

  // 次の会員番号を提案（最大番号 + 1）
  const adminClient = createAdminClient()
  const { data: lastMember } = await adminClient
    .from('members')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single()

  const nextId = lastMember
    ? String(parseInt(lastMember.id) + 1).padStart(6, '0')
    : '000001'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <a href="/admin/members" className="text-purple-200 hover:text-white text-sm">
            ← 会員一覧
          </a>
          <h1 className="text-2xl font-bold text-white mt-1">新規会員作成</h1>
        </div>

        <NewMemberForm suggestedId={nextId} />
      </div>
    </div>
  )
}
