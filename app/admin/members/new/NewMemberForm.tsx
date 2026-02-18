'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface Props {
  suggestedId: string
}

interface CreatedMember {
  memberId: string
  inviteUrl: string
}

export default function NewMemberForm({ suggestedId }: Props) {
  const [memberId, setMemberId] = useState(suggestedId)
  const [memberType, setMemberType] = useState<'profile' | 'redirect'>('profile')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<CreatedMember | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/admin/create-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: memberId,
        type: memberType,
        redirect_url: memberType === 'redirect' ? redirectUrl : null,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? '作成に失敗しました')
      return
    }

    setCreated({ memberId: data.memberId, inviteUrl: data.inviteUrl })
  }

  if (created) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-xl font-bold text-gray-800">会員 #{created.memberId} を作成しました</h2>
        </div>

        {/* QRコード */}
        <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm font-medium text-gray-600">招待用QRコード（印刷してメタルカードと一緒に渡す）</p>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <QRCodeSVG
              value={created.inviteUrl}
              size={200}
              level="M"
            />
          </div>
          <p className="text-xs text-gray-400 text-center break-all">{created.inviteUrl}</p>
        </div>

        {/* コピーボタン */}
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(created.inviteUrl)}
          className="w-full py-2.5 border border-purple-300 text-purple-700 rounded-xl hover:bg-purple-50 transition text-sm font-medium"
        >
          招待URLをコピー
        </button>

        {/* 印刷ボタン */}
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition text-sm font-medium"
        >
          印刷する
        </button>

        <div className="flex gap-3 text-sm">
          <a
            href="/admin/members/new"
            className="flex-1 py-2.5 text-center border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition"
          >
            次の会員を作成
          </a>
          <a
            href="/admin/members"
            className="flex-1 py-2.5 text-center border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition"
          >
            会員一覧へ
          </a>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="font-bold text-gray-800">会員情報</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            会員番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            pattern="[0-9]{1,6}"
            title="数字1〜6桁"
            value={memberId}
            onChange={e => setMemberId(e.target.value.padStart(6, '0').slice(-6))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
            placeholder="000001"
          />
          <p className="text-xs text-gray-400 mt-1">6桁の数字。重複不可。</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カード種別
          </label>
          <div className="flex gap-3">
            {(['profile', 'redirect'] as const).map(type => (
              <label
                key={type}
                className={`flex-1 flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition ${
                  memberType === type
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={memberType === type}
                  onChange={() => setMemberType(type)}
                  className="accent-purple-600"
                />
                <div>
                  <p className="font-medium text-sm">
                    {type === 'profile' ? 'プロフィール' : 'リダイレクト'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {type === 'profile' ? 'ハブページを表示' : '別URLへ転送'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {memberType === 'redirect' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              転送先URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={redirectUrl}
              onChange={e => setRedirectUrl(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              placeholder="https://"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg"
      >
        {loading ? '作成中...' : '会員を作成して招待URLを発行'}
      </button>
    </form>
  )
}
