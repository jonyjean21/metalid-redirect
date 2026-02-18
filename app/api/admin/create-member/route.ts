import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  // 認証チェック
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

  const body = await request.json()
  const { id, type, redirect_url } = body

  if (!id || !/^\d{6}$/.test(id)) {
    return NextResponse.json({ error: '会員番号は6桁の数字で指定してください' }, { status: 400 })
  }

  if (type === 'redirect' && !redirect_url) {
    return NextResponse.json({ error: 'リダイレクト先URLが必要です' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // 重複チェック
  const { data: existing } = await adminClient
    .from('members').select('id').eq('id', id).single()

  if (existing) {
    return NextResponse.json({ error: `会員番号 ${id} はすでに使用されています` }, { status: 409 })
  }

  // 会員レコードを作成
  const { error: memberError } = await adminClient
    .from('members')
    .insert({ id, type, status: 'pending', redirect_url: redirect_url ?? null })

  if (memberError) {
    return NextResponse.json({ error: '会員の作成に失敗しました' }, { status: 500 })
  }

  // 招待トークンを発行
  const { data: tokenData, error: tokenError } = await adminClient
    .from('invite_tokens')
    .insert({ member_id: id })
    .select('token')
    .single()

  if (tokenError || !tokenData) {
    return NextResponse.json({ error: '招待トークンの発行に失敗しました' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = `${appUrl}/register?token=${tokenData.token}`

  return NextResponse.json({ memberId: id, inviteUrl })
}
