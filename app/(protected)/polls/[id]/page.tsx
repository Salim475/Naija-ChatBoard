'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Poll {
  id: string
  user_id: string
  username: string
  question: string
  tag: string
  total_votes: number
  closes_at: string | null
  created_at: string
}

interface PollOption {
  id: string
  poll_id: string
  label: string
  vote_count: number
  position: number
}

interface Props {
  params: { id: string }
}

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

function timeLeft(closesAt: string | null) {
  if (!closesAt) return null
  const ms = new Date(closesAt).getTime() - Date.now()
  if (ms <= 0) return 'Closed'
  const hours = Math.floor(ms / 3600000)
  const days  = Math.floor(hours / 24)
  if (days > 0) return `${days}d left`
  if (hours > 0) return `${hours}h left`
  return 'Closing soon'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function PollPage({ params }: Props) {
  const { id } = params
  const router = useRouter()
  const supabase = createClient()

  const [poll, setPoll]           = useState<Poll | null>(null)
  const [options, setOptions]     = useState<PollOption[]>([])
  const [myVoteId, setMyVoteId]   = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [voting, setVoting]       = useState<string | null>(null)
  const [notFound, setNotFound]   = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUser({ id: user.id })
      else router.push('/login')
    })
  }, [])

  // Load poll + options
  useEffect(() => {
    async function load() {
      const { data: pollData, error } = await supabase
        .from('polls')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !pollData) { setNotFound(true); return }
      setPoll(pollData)

      const { data: optData } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', id)
        .order('position', { ascending: true })

      if (optData) setOptions(optData)
    }
    load()
  }, [id])

  // Load my vote
  useEffect(() => {
    if (!currentUser) return
    supabase
      .from('poll_votes')
      .select('option_id')
      .eq('poll_id', id)
      .eq('user_id', currentUser.id)
      .single()
      .then(({ data }) => {
        if (data) setMyVoteId(data.option_id)
      })
  }, [currentUser, id])

  // Realtime: update option vote counts live
  useEffect(() => {
    const channel = supabase
      .channel(`poll_options:${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'poll_options', filter: `poll_id=eq.${id}` },
        (payload) => {
          setOptions((prev) =>
            prev.map((o) => (o.id === payload.new.id ? { ...o, vote_count: payload.new.vote_count } : o))
          )
          // Update total
          setPoll((prev) =>
            prev ? { ...prev, total_votes: prev.total_votes + 1 } : prev
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function handleVote(optionId: string) {
    if (!currentUser || myVoteId || voting) return

    const expired = poll?.closes_at && new Date(poll.closes_at) < new Date()
    if (expired) { setError('This poll is closed.'); return }

    setVoting(optionId)
    setError(null)

    const { error } = await supabase.from('poll_votes').insert({
      poll_id: id,
      option_id: optionId,
      user_id: currentUser.id,
    })

    if (error) {
      if (error.code === '23505') {
        setError('You have already voted on this poll.')
      } else {
        setError(error.message)
      }
    } else {
      setMyVoteId(optionId)
      // Optimistically update local counts
      setOptions((prev) =>
        prev.map((o) => o.id === optionId ? { ...o, vote_count: o.vote_count + 1 } : o)
      )
      setPoll((prev) => prev ? { ...prev, total_votes: prev.total_votes + 1 } : prev)
    }

    setVoting(null)
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="text-[#F5F5F0] font-display text-lg font-semibold mb-2">Poll not found</p>
        <Link href="/polls" className="text-[#008751] hover:text-[#00a862] text-sm font-medium">← Back to Polls</Link>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="w-6 h-6 border-2 border-white/10 border-t-[#008751] rounded-full animate-spin" />
      </div>
    )
  }

  const total    = poll.total_votes
  const expired  = poll.closes_at ? new Date(poll.closes_at) < new Date() : false
  const hasVoted = !!myVoteId
  const showResults = hasVoted || expired
  const remaining = timeLeft(poll.closes_at)
  const leadingCount = Math.max(...options.map((o) => o.vote_count))

  return (
    <div className="px-4 md:px-8 py-8 max-w-xl mx-auto">

      {/* Back */}
      <Link
        href="/polls"
        className="inline-flex items-center gap-1.5 text-[#6B6B6B] hover:text-[#F5F5F0] text-xs mb-6 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All Polls
      </Link>

      {/* Poll card */}
      <div className="relative bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden mb-6">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#008751]" />
        <div className="px-6 py-6">

          {/* Tags + status */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[poll.tag] ?? TAG_COLORS['General']}`}>
              {poll.tag}
            </span>
            {expired ? (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-[#4A4A4A]">Closed</span>
            ) : remaining ? (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#008751]/10 text-[#008751] flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#008751] pulse-dot" />
                {remaining}
              </span>
            ) : null}
          </div>

          {/* Question */}
          <h1 className="font-display text-lg md:text-xl font-bold text-[#F5F5F0] leading-snug mb-2">
            {poll.question}
          </h1>

          {/* Meta */}
          <p className="text-xs text-[#4A4A4A] mb-6">
            by @{poll.username} · {formatDate(poll.created_at)}
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {options.map((opt) => {
              const pct       = total > 0 ? Math.round((opt.vote_count / total) * 100) : 0
              const isMyPick  = myVoteId === opt.id
              const isLeading = opt.vote_count === leadingCount && total > 0

              if (showResults) {
                return (
                  <div
                    key={opt.id}
                    className={`relative rounded-xl overflow-hidden border transition-all ${
                      isMyPick ? 'border-[#008751]/40' : 'border-white/5'
                    }`}
                  >
                    {/* Bar fill */}
                    <div
                      className={`absolute inset-0 rounded-xl transition-all duration-700 ${
                        isMyPick ? 'bg-[#008751]/15' : isLeading ? 'bg-white/3' : 'bg-[#111111]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center justify-between px-4 py-3 gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {isMyPick && (
                          <svg className="w-3.5 h-3.5 text-[#008751] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span className={`text-sm font-medium truncate ${isMyPick ? 'text-[#008751]' : 'text-[#D0D0D0]'}`}>
                          {opt.label}
                        </span>
                        {isLeading && total > 0 && (
                          <span className="text-[9px] text-[#4A4A4A] flex-shrink-0">leading</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-[#6B6B6B]">{opt.vote_count.toLocaleString()}</span>
                        <span className={`text-xs font-semibold w-10 text-right ${isMyPick ? 'text-[#008751]' : 'text-[#6B6B6B]'}`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }

              // Voting mode
              return (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  disabled={!!voting || expired}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-[#111111] hover:bg-[#1E1E1E] border border-white/5 hover:border-[#008751]/30 disabled:cursor-not-allowed transition-all group"
                >
                  <span className="text-sm text-[#D0D0D0] group-hover:text-white transition-colors text-left">
                    {opt.label}
                  </span>
                  {voting === opt.id && (
                    <span className="w-4 h-4 border-2 border-white/20 border-t-[#008751] rounded-full animate-spin flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Result summary */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
            <span className="text-xs text-[#4A4A4A]">
              {total.toLocaleString()} {total === 1 ? 'vote' : 'votes'}
            </span>
            {showResults ? (
              <span className="text-xs text-[#008751]">Results visible</span>
            ) : (
              <span className="text-xs text-[#4A4A4A]">Results after you vote</span>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}