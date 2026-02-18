import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { PrivacySettings } from '@/types/database'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `プロフィール #${params.id} - METALID`,
  }
}

export default async function ProfileDetailPage({ params }: Props) {
  const supabase = createClient()

  const { data: member } = await supabase
    .from('members')
    .select(`
      id, status,
      profiles(molkky_name, avatar_url, bio_short, bio_long, team_name, region, career_start, privacy_settings),
      links(id, platform, label, url, display_order)
    `)
    .eq('id', params.id)
    .single()

  if (!member || member.status !== 'active') {
    notFound()
  }

  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
  const privacy: PrivacySettings = (profile?.privacy_settings as PrivacySettings) ?? {
    team_name: true, region: true, career_start: true,
    bio_long: true, tournaments: true, stats: true,
  }

  const name = profile?.molkky_name || `会員 #${member.id}`
  const initial = name.charAt(0).toUpperCase()

  function formatCareerStart(date: string | null) {
    if (!date) return null
    const d = new Date(date)
    return `${d.getFullYear()}年${d.getMonth() + 1}月〜`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 py-8">
      <div className="max-w-lg mx-auto space-y-4">
        {/* ← ハブページへ戻る */}
        <Link
          href={`/u/${member.id}`}
          className="inline-flex items-center gap-1 text-purple-200 hover:text-white text-sm transition-colors"
        >
          ← ハブページに戻る
        </Link>

        {/* プロフィールカード */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 h-16" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-8 mb-4">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={name}
                  className="w-16 h-16 rounded-full border-4 border-white shadow object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border-4 border-white shadow bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {initial}
                </div>
              )}
              <div className="pb-1">
                <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                <p className="text-xs text-gray-400">#{member.id}</p>
              </div>
            </div>

            {/* 基本情報 */}
            <div className="space-y-2 text-sm">
              {privacy.team_name && profile?.team_name && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-20 flex-shrink-0">チーム</span>
                  <span className="text-gray-700">{profile.team_name}</span>
                </div>
              )}
              {privacy.region && profile?.region && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-20 flex-shrink-0">活動地域</span>
                  <span className="text-gray-700">{profile.region}</span>
                </div>
              )}
              {privacy.career_start && profile?.career_start && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-20 flex-shrink-0">モルック歴</span>
                  <span className="text-gray-700">{formatCareerStart(profile.career_start)}</span>
                </div>
              )}
            </div>

            {/* 詳細自己紹介 */}
            {privacy.bio_long && profile?.bio_long && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {profile.bio_long}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 大会記録（Phase2で追加） */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-base font-bold text-gray-800 mb-3">📊 大会・戦績</h2>
          <p className="text-sm text-gray-400 text-center py-4">
            大会記録機能は近日実装予定です
          </p>
        </div>

        {/* フッター */}
        <p className="text-center text-purple-300 text-xs pt-2">Powered by METALID</p>
      </div>
    </div>
  )
}
