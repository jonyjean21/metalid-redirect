'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface Props {
  memberId: string
  inviteUrl: string | null
  memberStatus: string
}

export default function InviteUrlSection({ memberId, inviteUrl, memberStatus }: Props) {
  const [currentUrl, setCurrentUrl] = useState(inviteUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function reissueToken() {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/reissue-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? '再発行に失敗しました')
      return
    }

    setCurrentUrl(data.inviteUrl)
  }

  if (memberStatus === 'active') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="font-bold text-gray-800 mb-2">招待URL</h2>
        <p className="text-sm text-green-600">✅ 登録済みのため招待URLは不要です</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="font-bold text-gray-800">招待URL</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {currentUrl ? (
        <>
          <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <QRCodeSVG value={currentUrl} size={160} level="M" />
            </div>
            <p className="text-xs text-gray-400 text-center break-all">{currentUrl}</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(currentUrl)}
              className="flex-1 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 text-sm font-medium transition"
            >
              URLをコピー
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 text-sm font-medium transition"
            >
              印刷
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
          ⚠️ 有効な招待URLがありません。再発行してください。
        </p>
      )}

      <button
        type="button"
        onClick={reissueToken}
        disabled={loading}
        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition disabled:opacity-60"
      >
        {loading ? '発行中...' : '招待URLを再発行'}
      </button>
    </div>
  )
}
