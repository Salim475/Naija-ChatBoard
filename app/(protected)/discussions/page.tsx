import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const TAGS = ['All', 'General', 'Politics', 'Tech', 'Music', 'Sports', 'Education', 'Business', 'Diaspora', 'Food & Fun']

const TAG_COLORS: Record<string, string> = {
  Politics:    'bg-red-500/10 text-red-400',
  Tech:        'bg-blue-500/10 text-blue-400',
  'Food & Fun':'bg-orange-500/10 text-orange-400',
  Music:       'bg-purple-500/10 text-purple-400',
  Business:    'bg-yellow-500/10 text-yellow-400',
  Education:   'bg-cyan-500/10 text-cyan-400',
  Diaspora:    'bg-pink-500/10 text-pink-400',
  Sports:      'bg-green-500/10 text-green-400',
  General:     'bg-white/10 text-[#6B6B6B]',
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60)   return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400)return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default async function DiscussionsPage({
  searchParams,
}: {
  searchParams: { tag?: string }
}) {
  const supabase = await createClient()
  const activeTag = searchParams.tag || 'All'

  let query = supabase
    .from('discussions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (activeTag !== 'All') {
    query = query.eq('tag', activeTag)
  }

  const { data: discussions, error } = await query

  return (
    <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#F5F5F0]">
            Discussions
          </h1>
          <p className="text-[#6B6B6B] text-sm mt-1">
            Start a conversation, share your thoughts.
          </p>
        </div>
        <Link
          href="/discussions/new"
          className="flex items-center gap-2 bg-[#008751] hover:bg-[#00a862] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors font-display flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
      </div>

      {/* Tag filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TAGS.map((tag) => (
          <Link
            key={tag}
            href={tag === 'All' ? '/discussions' : `/discussions?tag=${encodeURIComponent(tag)}`}
            className={`flex-shrink-0 text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
              activeTag === tag
                ? 'bg-[#008751]/15 text-[#008751] border-[#008751]/30'
                : 'bg-[#1A1A1A] text-[#6B6B6B] border-white/5 hover:border-white/10 hover:text-[#F5F5F0]'
            }`}
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Posts list */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">Failed to load discussions. Please refresh.</p>
        </div>
      )}

      {!error && discussions?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-[#4A4A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#F5F5F0] mb-1">No discussions yet</p>
          <p className="text-xs text-[#6B6B6B] mb-4">
            {activeTag !== 'All' ? `No posts tagged "${activeTag}" yet.` : 'Be the first to start a conversation.'}
          </p>
          <Link
            href="/discussions/new"
            className="text-xs text-[#008751] hover:text-[#00a862] font-medium transition-colors"
          >
            Start the first discussion →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {discussions?.map((post) => (
          <Link
            key={post.id}
            href={`/discussions/${post.id}`}
            className="group block bg-[#1A1A1A] hover:bg-[#1E1E1E] border border-white/5 hover:border-[#008751]/20 rounded-2xl px-5 py-4 transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Tag */}
                <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-2 ${TAG_COLORS[post.tag] ?? TAG_COLORS['General']}`}>
                  {post.tag}
                </span>

                {/* Title */}
                <h2 className="text-sm font-semibold text-[#D0D0D0] group-hover:text-white transition-colors leading-snug mb-2">
                  {post.title}
                </h2>

                {/* Body preview */}
                <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed mb-3">
                  {post.body}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#4A4A4A]">@{post.username}</span>
                  <span className="text-[10px] text-[#3D3D3D]">·</span>
                  <span className="text-[10px] text-[#4A4A4A]">{timeAgo(post.created_at)}</span>
                </div>
              </div>

              {/* Reply count */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center bg-[#111111] border border-white/5 rounded-xl px-3 py-2 min-w-[52px]">
                <svg className="w-3.5 h-3.5 text-[#4A4A4A] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs font-semibold text-[#F5F5F0]">{post.reply_count}</span>
                <span className="text-[9px] text-[#4A4A4A]">replies</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}