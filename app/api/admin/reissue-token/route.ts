import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { data: me } = await supabase
    .from('members').select('is_admin').eq('auth_user_id', user.id).single()

  if (!me?.is_admin) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
  }

  const { memberId } = await request.json()

  if (!memberId) {
    return NextResponse.json({ error: '会員IDが必要です' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // 既存の未使用トークンを失効させる
  const expiredAt = new Date().toISOString()
  await adminClient
    .from('invite_tokens')
    .update({ expires_at: expiredAt })
    .eq('member_id', memberId)
    .is('used_at', null)

  // 新しいトークンを発行
  const { data: tokenData, error: tokenError } = await adminClient
    .from('invite_tokens')
    .insert({ member_id: memberId })
    .select('token')
    .single()

  if (tokenError || !tokenData) {
    return NextResponse.json({ error: 'トークンの発行に失敗しました' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = `${appUrl}/register?token=${tokenData.token}`

  return NextResponse.json({ inviteUrl })
}
