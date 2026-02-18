import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileEditForm from './ProfileEditForm'
import type { Profile, Link as MLink } from '@/types/database'

export default async function ProfileEditPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('members')
    .select(`
      id,
      profiles(molkky_name, avatar_url, bio_short, bio_long, team_name, region, career_start, privacy_settings),
      links(id, platform, label, url, display_order)
    `)
    .eq('auth_user_id', user.id)
    .single()

  if (!member) redirect('/login')

  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
  const links = Array.isArray(member.links)
    ? [...member.links].sort((a, b) => a.display_order - b.display_order)
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">プロフィール編集</h1>
          <p className="text-purple-200 text-sm mt-1">会員番号: {member.id}</p>
        </div>

        <ProfileEditForm
          memberId={member.id}
          profile={profile as Profile | null}
          links={links as MLink[]}
        />
      </div>
    </div>
  )
}
