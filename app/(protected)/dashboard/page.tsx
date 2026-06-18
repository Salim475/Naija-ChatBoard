import { createClient } from '@/lib/supabase/server'
import DotGrid from '@/app/(protected)/components/DotGrid'

// ── Helpers ────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Static seed data ───────────────────────────────────────
const TRENDING_ROOMS = [
  {
    id: 1,
    name: 'Naija Politics 🗳️',
    description: 'Hot takes, real talk on Nigerian politics',
    members: 1284,
    active: true,
    tag: 'Politics',
  },
  {
    id: 2,
    name: 'Tech in Lagos 💻',
    description: 'Startups, jobs, dev gist for Lagos techies',
    members: 892,
    active: true,
    tag: 'Tech',
  },
  {
    id: 3,
    name: 'Jollof War Zone 🍛',
    description: 'Nigeria vs Ghana. The debate never dies.',
    members: 3471,
    active: true,
    tag: 'Food & Fun',
  },
]

const RECENT_DISCUSSIONS = [
  {
    id: 1,
    title: 'Is Lagos traffic actually getting worse or are we just more aware of it?',
    author: 'lagosboy99',
    replies: 47,
    timeAgo: '12m ago',
    tag: 'Lagos Life',
  },
  {
    id: 2,
    title: 'Best universities in Nigeria 2024 — let us settle this once and for all',
    author: 'unilag_rep',
    replies: 112,
    timeAgo: '34m ago',
    tag: 'Education',
  },
  {
    id: 3,
    title: 'Afrobeats or Afropop? Why does the name even matter?',
    author: 'afroking',
    replies: 28,
    timeAgo: '1h ago',
    tag: 'Music',
  },
  {
    id: 4,
    title: 'Remote work from Nigeria — who is actually doing it and how?',
    author: 'wfh_naija',
    replies: 64,
    timeAgo: '2h ago',
    tag: 'Work',
  },
]

const FEATURED_POLL = {
  question: 'Which city has the best Suya in Nigeria?',
  options: [
    { label: 'Abuja', votes: 412 },
    { label: 'Lagos', votes: 339 },
    { label: 'Kano', votes: 287 },
    { label: 'Port Harcourt', votes: 164 },
  ],
  totalVotes: 1202,
}

// ── Component ──────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const username =
    user?.user_metadata?.username || user?.email?.split('@')[0] || 'Naija'

  const greeting = getGreeting()
  const totalPollVotes = FEATURED_POLL.totalVotes

  return (
    <div className="relative min-h-screen">

      {/* ── DotGrid background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotGrid
          dotSize={4}
          gap={22}
          baseColor="#1A1A1A"
          activeColor="#008751"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      {/* ── Page content ── */}
      <div className="relative z-10 px-4 md:px-8 py-8 max-w-4xl mx-auto">

        {/* Greeting */}
        <div className="mb-10">
          <p className="text-[#6B6B6B] text-sm mb-1">{greeting},</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#F5F5F0]">
            {username} 👋
          </h1>
          <p className="text-[#6B6B6B] text-sm mt-1">
            Here's what's happening on the board today.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: 'Active rooms', value: '24' },
            { label: 'Discussions today', value: '138' },
            { label: 'Members online', value: '2.4k' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-4"
            >
              <p className="font-display text-xl font-bold text-[#F5F5F0]">{stat.value}</p>
              <p className="text-[#6B6B6B] text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Trending Rooms */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-[#F5F5F0]">
              Trending Rooms
            </h2>
            <a href="/chat" className="text-xs text-[#008751] hover:text-[#00a862] transition-colors">
              See all →
            </a>
          </div>

          <div className="space-y-3">
            {TRENDING_ROOMS.map((room) => (
              <a
                key={room.id}
                href="/chat"
                className="group flex items-center gap-4 bg-[#1A1A1A] hover:bg-[#202020] border border-white/5 hover:border-[#008751]/20 rounded-xl px-4 py-4 transition-all duration-150"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#008751]/10 border border-[#008751]/20 flex items-center justify-center relative">
                  <svg className="w-4 h-4 text-[#008751]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {room.active && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#008751] pulse-dot" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F5F5F0] group-hover:text-white transition-colors truncate">
                    {room.name}
                  </p>
                  <p className="text-xs text-[#6B6B6B] truncate mt-0.5">{room.description}</p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-medium text-[#F5F5F0]">
                    {room.members.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#6B6B6B]">members</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Two-column: Discussions + Poll */}
        <div className="grid md:grid-cols-5 gap-6">

          {/* Recent Discussions */}
          <section className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-[#F5F5F0]">
                Recent Discussions
              </h2>
              <a href="/discussions" className="text-xs text-[#008751] hover:text-[#00a862] transition-colors">
                See all →
              </a>
            </div>

            <div className="space-y-2">
              {RECENT_DISCUSSIONS.map((post) => (
                <a
                  key={post.id}
                  href="/discussions"
                  className="group block bg-[#1A1A1A] hover:bg-[#202020] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3.5 transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block text-[10px] font-medium text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-full mb-1.5">
                        {post.tag}
                      </span>
                      <p className="text-sm text-[#D0D0D0] group-hover:text-[#F5F5F0] transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-[#4A4A4A]">@{post.author}</span>
                        <span className="text-[10px] text-[#4A4A4A]">{post.timeAgo}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right pt-1">
                      <p className="text-xs font-medium text-[#6B6B6B]">{post.replies}</p>
                      <p className="text-[10px] text-[#4A4A4A]">replies</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Featured Poll */}
          <section className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-[#F5F5F0]">
                Featured Poll
              </h2>
              <a href="/polls" className="text-xs text-[#008751] hover:text-[#00a862] transition-colors">
                All polls →
              </a>
            </div>

            <div className="bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-5">
              <p className="text-sm font-medium text-[#F5F5F0] mb-4 leading-snug">
                {FEATURED_POLL.question}
              </p>

              <div className="space-y-2.5">
                {FEATURED_POLL.options.map((opt) => {
                  const pct = Math.round((opt.votes / totalPollVotes) * 100)
                  const isLeading = opt.votes === Math.max(...FEATURED_POLL.options.map((o) => o.votes))
                  return (
                    <div key={opt.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${isLeading ? 'text-[#008751]' : 'text-[#6B6B6B]'}`}>
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-[#4A4A4A]">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isLeading ? 'bg-[#008751]' : 'bg-[#3A3A3A]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-[10px] text-[#4A4A4A] mt-4">
                {totalPollVotes.toLocaleString()} votes · Poll closes in 2 days
              </p>

              <a
                href="/polls"
                className="mt-4 block w-full text-center text-xs font-semibold text-[#008751] hover:text-[#00a862] border border-[#008751]/30 hover:border-[#008751]/60 rounded-lg py-2 transition-all"
              >
                Vote now
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}