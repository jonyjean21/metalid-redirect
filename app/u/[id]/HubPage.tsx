import Link from 'next/link'
import type { Profile, Link as MLink } from '@/types/database'
import { PLATFORM_EMOJIS } from '@/types/database'

interface Props {
  memberId: string
  profile: Pick<Profile, 'molkky_name' | 'avatar_url' | 'bio_short' | 'team_name'> | null
  links: Pick<MLink, 'id' | 'platform' | 'label' | 'url'>[]
}

export default function HubPage({ memberId, profile, links }: Props) {
  const name = profile?.molkky_name || `会員 #${memberId}`
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* プロフィールカード */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 h-20" />

          <div className="px-6 pb-6">
            {/* アバター */}
            <div className="flex justify-center -mt-10 mb-4">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={name}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {initial}
                </div>
              )}
            </div>

            {/* 名前・情報 */}
            <div className="text-center mb-5">
              <h1 className="text-xl font-bold text-gray-900">{name}</h1>
              {profile?.team_name && (
                <p className="text-sm text-purple-600 mt-0.5">{profile.team_name}</p>
              )}
              {profile?.bio_short && (
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{profile.bio_short}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">#{memberId}</p>
            </div>

            {/* SNSリンク */}
            {links.length > 0 && (
              <div className="space-y-2.5">
                {links.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="text-lg leading-none w-6 text-center flex-shrink-0">
                      {PLATFORM_EMOJIS[link.platform]}
                    </span>
                    <span className="text-sm font-medium text-purple-900 truncate">
                      {link.label}
                    </span>
                  </a>
                ))}
              </div>
            )}

            {links.length === 0 && !profile?.bio_short && (
              <p className="text-center text-gray-400 text-sm py-4">
                まだプロフィールが設定されていません
              </p>
            )}

            {/* 詳細プロフィールリンク */}
            <Link
              href={`/u/${memberId}/profile`}
              className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium text-sm"
            >
              <span>📊</span>
              <span>詳細プロフィール・戦績を見る</span>
            </Link>
          </div>
        </div>

        {/* フッター */}
        <p className="text-center text-purple-300 text-xs">Powered by METALID</p>
      </div>
    </div>
  )
}
