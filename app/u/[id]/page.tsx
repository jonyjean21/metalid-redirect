import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import HubPage from './HubPage'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()

  const { data: member } = await supabase
    .from('members')
    .select('id, type, profiles(molkky_name, bio_short)')
    .eq('id', params.id)
    .single()

  if (!member) {
    return { title: 'ユーザーが見つかりません - METALID' }
  }

  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
  const name = profile?.molkky_name || `会員 #${member.id}`
  const bio = profile?.bio_short || 'METALIDプロフィールページ'

  return {
    title: `${name} - METALID`,
    description: bio,
  }
}

export default async function UserPage({ params }: Props) {
  const supabase = createClient()

  const { data: member } = await supabase
    .from('members')
    .select(`
      id, type, status, redirect_url,
      profiles(molkky_name, avatar_url, bio_short, team_name),
      links(id, platform, label, url, display_order)
    `)
    .eq('id', params.id)
    .single()

  if (!member || member.status !== 'active') {
    notFound()
  }

  // リダイレクト型
  if (member.type === 'redirect' && member.redirect_url) {
    redirect(member.redirect_url)
  }

  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
  const links = Array.isArray(member.links)
    ? [...member.links].sort((a, b) => a.display_order - b.display_order)
    : []

  return (
    <HubPage
      memberId={member.id}
      profile={profile ?? null}
      links={links}
    />
  )
}
