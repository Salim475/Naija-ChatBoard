import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Consistent avatar bg colors (same logic as sidebar/chat)
const AVATAR_COLORS = [
  { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  { bg: 'bg-blue-500/20',   border: 'border-blue-500/30',   text: 'text-blue-400'   },
  { bg: 'bg-pink-500/20',   border: 'border-pink-500/30',   text: 'text-pink-400'   },
  { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  { bg: 'bg-cyan-500/20',   border: 'border-cyan-500/30',   text: 'text-cyan-400'   },
  { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
]

function getAvatarColor(username: string) {
  let hash = 0
  for (const c of username) hash = (hash + c.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[hash]
}

function formatJoinDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile from DB
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch message count
  const { count: messageCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const username = profile?.username || user.email?.split('@')[0] || 'Naija'
  const displayName = profile?.display_name || username
  const avatar = getAvatarColor(username)
  const initial = username.charAt(0).toUpperCase()

  return (
    <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[#F5F5F0]">
          My Profile
        </h1>
        <Link
          href="/profile/edit"
          className="flex items-center gap-2 text-xs font-semibold text-[#008751] hover:text-[#00a862] border border-[#008751]/30 hover:border-[#008751]/60 px-3 py-2 rounded-xl transition-all font-display"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </Link>
      </div>

      {/* Profile card */}
      <div className="relative bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden mb-6">

        {/* Green accent stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#008751]" />

        {/* Cover strip */}
        <div className="h-20 bg-gradient-to-r from-[#008751]/20 via-[#008751]/5 to-transparent" />

        {/* Avatar + name */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className={`w-20 h-20 rounded-2xl ${avatar.bg} border-2 ${avatar.border} flex items-center justify-center shadow-xl`}>
              <span className={`font-display text-3xl font-bold ${avatar.text}`}>
                {initial}
              </span>
            </div>
            <span className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008751] pulse-dot" />
              <span className="text-[10px] text-[#008751]">Active</span>
            </span>
          </div>

          <h2 className="font-display text-xl font-bold text-[#F5F5F0]">{displayName}</h2>
          <p className="text-sm text-[#6B6B6B]">@{username}</p>

          {profile?.bio ? (
            <p className="text-sm text-[#D0D0D0] mt-3 leading-relaxed">{profile.bio}</p>
          ) : (
            <p className="text-sm text-[#3D3D3D] mt-3 italic">
              No bio yet.{' '}
              <Link href="/profile/edit" className="text-[#008751] hover:text-[#00a862] not-italic">
                Add one →
              </Link>
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {profile?.location && (
              <span className="flex items-center gap-1.5 text-xs text-[#6B6B6B]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location}
              </span>
            )}
            {profile?.created_at && (
              <span className="flex items-center gap-1.5 text-xs text-[#6B6B6B]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Joined {formatJoinDate(profile.created_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Messages sent', value: (messageCount ?? 0).toString() },
          { label: 'Rooms joined',  value: '—' },
          { label: 'Discussions',   value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-4 text-center">
            <p className="font-display text-xl font-bold text-[#F5F5F0]">{stat.value}</p>
            <p className="text-[10px] text-[#6B6B6B] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Account info */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-5">
        <h3 className="font-display text-sm font-semibold text-[#F5F5F0] mb-4">Account</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-xs text-[#6B6B6B]">Email</span>
            <span className="text-xs text-[#D0D0D0]">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-xs text-[#6B6B6B]">Username</span>
            <span className="text-xs text-[#D0D0D0]">@{username}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-[#6B6B6B]">Account status</span>
            <span className="text-[10px] font-medium text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}