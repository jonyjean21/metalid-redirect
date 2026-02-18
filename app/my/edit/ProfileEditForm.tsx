'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Link as MLink } from '@/types/database'
import { PLATFORM_LABELS, REGIONS, DEFAULT_PRIVACY } from '@/types/database'

interface Props {
  memberId: string
  profile: Profile | null
  links: MLink[]
}

const PLATFORMS = ['x', 'instagram', 'facebook', 'youtube', 'website'] as const

export default function ProfileEditForm({ memberId, profile, links: initialLinks }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // プロフィールフィールド
  const [molkkyName, setMolkkyName] = useState(profile?.molkky_name ?? '')
  const [bioShort, setBioShort] = useState(profile?.bio_short ?? '')
  const [bioLong, setBioLong] = useState(profile?.bio_long ?? '')
  const [teamName, setTeamName] = useState(profile?.team_name ?? '')
  const [region, setRegion] = useState(profile?.region ?? '')
  const [careerStart, setCareerStart] = useState(
    profile?.career_start ? profile.career_start.slice(0, 7) : ''
  )

  // 公開設定
  const privacy = profile?.privacy_settings ?? DEFAULT_PRIVACY
  const [privacyTeam, setPrivacyTeam] = useState(privacy.team_name)
  const [privacyRegion, setPrivacyRegion] = useState(privacy.region)
  const [privacyCareer, setPrivacyCareer] = useState(privacy.career_start)
  const [privacyBioLong, setPrivacyBioLong] = useState(privacy.bio_long)

  // リンク
  const [links, setLinks] = useState<Omit<MLink, 'id' | 'member_id'>[]>(
    Array.from({ length: 5 }, (_, i) => ({
      platform: initialLinks[i]?.platform ?? 'website',
      label: initialLinks[i]?.label ?? '',
      url: initialLinks[i]?.url ?? '',
      display_order: i,
    }))
  )

  function updateLink(index: number, field: keyof typeof links[0], value: string) {
    setLinks(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    if (!molkkyName.trim()) {
      setMessage({ type: 'error', text: 'モルックネームは必須です' })
      setSaving(false)
      return
    }

    const supabase = createClient()

    // プロフィールをupsert
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        member_id: memberId,
        molkky_name: molkkyName.trim(),
        bio_short: bioShort.trim() || null,
        bio_long: bioLong.trim() || null,
        team_name: teamName.trim() || null,
        region: region || null,
        career_start: careerStart ? `${careerStart}-01` : null,
        privacy_settings: {
          team_name: privacyTeam,
          region: privacyRegion,
          career_start: privacyCareer,
          bio_long: privacyBioLong,
          tournaments: true,
          stats: true,
        },
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      setMessage({ type: 'error', text: 'プロフィールの保存に失敗しました' })
      setSaving(false)
      return
    }

    // リンクを全削除して再挿入
    await supabase.from('links').delete().eq('member_id', memberId)

    const validLinks = links.filter(l => l.label.trim() && l.url.trim())
    if (validLinks.length > 0) {
      const { error: linksError } = await supabase.from('links').insert(
        validLinks.map((l, i) => ({
          member_id: memberId,
          platform: l.platform,
          label: l.label.trim(),
          url: l.url.trim(),
          display_order: i,
        }))
      )
      if (linksError) {
        setMessage({ type: 'error', text: 'リンクの保存に失敗しました' })
        setSaving(false)
        return
      }
    }

    setMessage({ type: 'success', text: '保存しました！' })
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`rounded-lg p-3 text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* 基本情報 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="font-bold text-gray-800">基本情報</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            モルックネーム <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={50}
            value={molkkyName}
            onChange={e => setMolkkyName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            placeholder="表示名（ニックネーム）"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            一言自己紹介 <span className="text-gray-400 font-normal">（{bioShort.length}/100文字）</span>
          </label>
          <input
            type="text"
            maxLength={100}
            value={bioShort}
            onChange={e => setBioShort(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            placeholder="ハブページに表示される短いひとこと"
          />
        </div>

        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
            <span>所属チーム</span>
            <PublicToggle value={privacyTeam} onChange={setPrivacyTeam} />
          </label>
          <input
            type="text"
            maxLength={100}
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            placeholder="チーム名"
          />
        </div>

        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
            <span>活動地域</span>
            <PublicToggle value={privacyRegion} onChange={setPrivacyRegion} />
          </label>
          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
          >
            <option value="">選択してください</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
            <span>モルック開始年月</span>
            <PublicToggle value={privacyCareer} onChange={setPrivacyCareer} />
          </label>
          <input
            type="month"
            value={careerStart}
            onChange={e => setCareerStart(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
      </div>

      {/* 詳細自己紹介 */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <label className="flex items-center justify-between text-sm font-bold text-gray-800 mb-2">
          <span>詳細自己紹介</span>
          <PublicToggle value={privacyBioLong} onChange={setPrivacyBioLong} />
        </label>
        <textarea
          rows={5}
          value={bioLong}
          onChange={e => setBioLong(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
          placeholder="詳細プロフィールページに表示される自己紹介文"
        />
      </div>

      {/* SNSリンク */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="font-bold text-gray-800 mb-4">SNSリンク（最大5件）</h2>
        <div className="space-y-4">
          {links.map((link, i) => (
            <div key={i} className="flex flex-col gap-2 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                <select
                  value={link.platform}
                  onChange={e => updateLink(i, 'platform', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {PLATFORMS.map(p => (
                    <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                maxLength={50}
                value={link.label}
                onChange={e => updateLink(i, 'label', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="表示ラベル（例: X（個人）、YouTube）"
              />
              <input
                type="url"
                value={link.url}
                onChange={e => updateLink(i, 'url', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 保存ボタン */}
      <button
        type="submit"
        disabled={saving}
        className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg"
      >
        {saving ? '保存中...' : '保存する'}
      </button>

      <div className="text-center">
        <a href="/my" className="text-purple-200 hover:text-white text-sm transition-colors">
          ← マイページに戻る
        </a>
      </div>
    </form>
  )
}

function PublicToggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
        value
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {value ? '公開' : '非公開'}
    </button>
  )
}
