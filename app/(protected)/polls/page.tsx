import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const TAGS = ['All', 'General', 'Politics', 'Tech', 'Music', 'Sports', 'Education', 'Business', 'Food & Fun']

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
  if (seconds < 60)    return `${seconds}s ago`
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function isExpired(closesAt: string | null) {
  if (!closesAt) return false
  return new Date(closesAt) < new Date()
}

export default async function PollsPage({
  searchParams,
}: {
  searchParams: { tag?: string }
}) {
  const supabase = await createClient()
  const activeTag = searchParams.tag || 'All'

  // Fetch polls with their options
  let query = supabase
    .from('polls')
    .select('*, poll_options(id, label, vote_count, position)')
    .order('created_at', { ascending: false })
    .limit(40)

  if (activeTag !== 'All') {
    query = query.eq('tag', activeTag)
  }

  const { data: polls } = await query

  // Get current user's votes
  const { data: { user } } = await supabase.auth.getUser()
  const { data: myVotes } = await supabase
    .from('poll_votes')
    .select('poll_id, option_id')
    .eq('user_id', user?.id ?? '')

  const votedPollIds = new Set(myVotes?.map((v) => v.poll_id) ?? [])

  return (
    <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#F5F5F0]">Polls</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">Vote, see what Naija thinks.</p>
        </div>
        <Link
          href="/polls/new"
          className="flex items-center gap-2 bg-[#008751] hover:bg-[#00a862] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors font-display flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Poll
        </Link>
      </div>

      {/* Tag filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {TAGS.map((tag) => (
          <Link
            key={tag}
            href={tag === 'All' ? '/polls' : `/polls?tag=${encodeURIComponent(tag)}`}
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

      {/* Empty state */}
      {polls?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-[#4A4A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#F5F5F0] mb-1">No polls yet</p>
          <p className="text-xs text-[#6B6B6B] mb-4">Be the first to ask Naija something.</p>
          <Link href="/polls/new" className="text-xs text-[#008751] hover:text-[#00a862] font-medium">
            Create the first poll →
          </Link>
        </div>
      )}

      {/* Poll cards */}
      <div className="space-y-4">
        {polls?.map((poll) => {
          const options = [...(poll.poll_options ?? [])].sort((a: any, b: any) => a.position - b.position)
          const hasVoted = votedPollIds.has(poll.id)
          const expired  = isExpired(poll.closes_at)
          const total    = poll.total_votes || 0
          const myVote   = myVotes?.find((v) => v.poll_id === poll.id)
          const showResults = hasVoted || expired

          return (
            <Link
              key={poll.id}
              href={`/polls/${poll.id}`}
              className="group block bg-[#1A1A1A] hover:bg-[#1E1E1E] border border-white/5 hover:border-[#008751]/20 rounded-2xl px-5 py-5 transition-all duration-150"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[poll.tag] ?? TAG_COLORS['General']}`}>
                    {poll.tag}
                  </span>
                  {expired && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-[#4A4A4A]">
                      Closed
                    </span>
                  )}
                  {hasVoted && !expired && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#008751]/10 text-[#008751]">
                      Voted
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#4A4A4A] flex-shrink-0">{timeAgo(poll.created_at)}</span>
              </div>

              {/* Question */}
              <p className="text-sm font-semibold text-[#D0D0D0] group-hover:text-white transition-colors mb-4 leading-snug">
                {poll.question}
              </p>

              {/* Options — show bars if voted, buttons if not */}
              <div className="space-y-2">
                {options.slice(0, 4).map((opt: any) => {
                  const pct     = total > 0 ? Math.round((opt.vote_count / total) * 100) : 0
                  const isMyPick = myVote?.option_id === opt.id
                  const isLeading = opt.vote_count === Math.max(...options.map((o: any) => o.vote_count)) && total > 0

                  if (showResults) {
                    return (
                      <div key={opt.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium flex items-center gap-1.5 ${isMyPick ? 'text-[#008751]' : 'text-[#6B6B6B]'}`}>
                            {isMyPick && (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-[#4A4A4A]">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isLeading && isMyPick ? 'bg-[#008751]' : isLeading ? 'bg-[#008751]/60' : 'bg-[#3A3A3A]'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={opt.id}
                      className="text-xs text-[#6B6B6B] bg-[#111111] border border-white/5 rounded-lg px-3 py-2 truncate"
                    >
                      {opt.label}
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <span className="text-[10px] text-[#4A4A4A]">@{poll.username}</span>
                <span className="text-[10px] text-[#4A4A4A]">
                  {total.toLocaleString()} {total === 1 ? 'vote' : 'votes'}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}