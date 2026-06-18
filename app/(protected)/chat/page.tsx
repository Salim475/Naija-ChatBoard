import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'


// Static rooms — will be replaced with DB query once rooms table is set up
const ROOMS = [
  {
    id: 'naija-politics',
    name: 'Naija Politics 🗳️',
    description: 'Hot takes and real talk on Nigerian politics, government, and policy.',
    members: 1284,
    category: 'Politics',
    active: true,
  },
  {
    id: 'tech-lagos',
    name: 'Tech in Lagos 💻',
    description: 'Startups, developer gist, remote work, and tech jobs in Nigeria.',
    members: 892,
    category: 'Tech',
    active: true,
  },
  {
    id: 'jollof-war',
    name: 'Jollof War Zone 🍛',
    description: 'Nigeria vs Ghana. The debate never dies. Come settle it.',
    members: 3471,
    category: 'Food & Fun',
    active: true,
  },
  {
    id: 'naija-music',
    name: 'Naija Music 🎵',
    description: 'Afrobeats, Afropop, Amapiano, Fuji — all the vibes.',
    members: 2108,
    category: 'Music',
    active: true,
  },
  {
    id: 'hustle-corner',
    name: 'Hustle Corner 💼',
    description: 'Business ideas, side hustles, SME talk, and entrepreneurship.',
    members: 764,
    category: 'Business',
    active: false,
  },
  {
    id: 'edu-talks',
    name: 'Edu Talks 🎓',
    description: 'JAMB, WAEC, university gist, scholarships, and career advice.',
    members: 1630,
    category: 'Education',
    active: false,
  },
  {
    id: 'diaspora-connect',
    name: 'Diaspora Connect ✈️',
    description: 'For Nigerians abroad — visa, relocation tips, and home gist.',
    members: 531,
    category: 'Diaspora',
    active: true,
  },
  {
    id: 'sports-arena',
    name: 'Sports Arena ⚽',
    description: 'Super Eagles, NPFL, Premier League, and every sport Nigerians love.',
    members: 2890,
    category: 'Sports',
    active: true,
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Politics:   'bg-red-500/10 text-red-400',
  Tech:       'bg-blue-500/10 text-blue-400',
  'Food & Fun': 'bg-orange-500/10 text-orange-400',
  Music:      'bg-purple-500/10 text-purple-400',
  Business:   'bg-yellow-500/10 text-yellow-400',
  Education:  'bg-cyan-500/10 text-cyan-400',
  Diaspora:   'bg-pink-500/10 text-pink-400',
  Sports:     'bg-green-500/10 text-green-400',
}

export default async function ChatRoomsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const username =
    user?.user_metadata?.username || user?.email?.split('@')[0] || 'Naija'

  return (
    <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[#F5F5F0]">
          Chat Rooms
        </h1>
        <p className="text-[#6B6B6B] text-sm mt-1">
          Pick a room, jump in, and join the conversation.
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A4A]"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search rooms…"
            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Active', 'Tech', 'Politics', 'Sports'].map((filter) => (
            <button
              key={filter}
              className={`flex-shrink-0 text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                filter === 'All'
                  ? 'bg-[#008751]/15 text-[#008751] border-[#008751]/30'
                  : 'bg-[#1A1A1A] text-[#6B6B6B] border-white/5 hover:border-white/10 hover:text-[#F5F5F0]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Room grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {ROOMS.map((room) => (
          <Link
            key={room.id}
            href={`/chat/${room.id}`}
            className="group relative bg-[#1A1A1A] hover:bg-[#1E1E1E] border border-white/5 hover:border-[#008751]/25 rounded-2xl p-5 transition-all duration-150 flex flex-col gap-3"
          >
            {/* Active pulse */}
            {room.active && (
              <span className="absolute top-4 right-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008751] pulse-dot" />
                <span className="text-[10px] text-[#008751]">Live</span>
              </span>
            )}

            <div>
              <h3 className="font-display text-sm font-semibold text-[#F5F5F0] group-hover:text-white transition-colors pr-12">
                {room.name}
              </h3>
              <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed line-clamp-2">
                {room.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[room.category]}`}>
                {room.category}
              </span>
              <span className="text-[10px] text-[#4A4A4A]">
                {room.members.toLocaleString()} members
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Create room CTA */}
      <div className="mt-8 bg-[#1A1A1A] border border-dashed border-white/10 rounded-2xl px-6 py-8 text-center">
        <p className="font-display text-sm font-semibold text-[#F5F5F0] mb-1">
          Don't see your topic?
        </p>
        <p className="text-xs text-[#6B6B6B] mb-4">
          Create a new room and start the conversation yourself.
        </p>
        <button className="inline-flex items-center gap-2 bg-[#008751] hover:bg-[#00a862] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors font-display">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create a Room
        </button>
      </div>

    </div>
  )
}