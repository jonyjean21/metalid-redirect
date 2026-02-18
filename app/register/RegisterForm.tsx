'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  token: string
  memberId: string
}

export default function RegisterForm({ token, memberId }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      return
    }
    if (password !== confirm) {
      setError('パスワードが一致しません')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { invite_token: token },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/my/edit`,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message === 'User already registered'
        ? 'このメールアドレスはすでに登録されています'
        : '登録に失敗しました。もう一度お試しください'
      )
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-4">📧</div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">確認メールを送信しました</h3>
        <p className="text-sm text-gray-500">
          <strong>{email}</strong> に確認メールを送りました。<br />
          メール内のリンクをクリックして登録を完了してください。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          パスワード <span className="text-gray-400 font-normal">（8文字以上）</span>
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          パスワード（確認）
        </label>
        <input
          type="password"
          required
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '登録中...' : 'アカウントを作成'}
      </button>
    </form>
  )
}
