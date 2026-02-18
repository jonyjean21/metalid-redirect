import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

// Supabase メール認証後のコールバック
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/my/edit'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 認証成功 → プロフィール設定ページへ
      return NextResponse.redirect(
        new URL(next, process.env.NEXT_PUBLIC_APP_URL ?? request.url)
      )
    }
  }

  // 認証失敗 → エラーページへ
  return NextResponse.redirect(
    new URL('/login?error=auth_failed', process.env.NEXT_PUBLIC_APP_URL ?? request.url)
  )
}
