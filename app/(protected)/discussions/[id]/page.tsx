'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────
interface Discussion {
  id: string
  user_id: string
  username: string
  title: string
  body: string
  tag: string
  reply_count: number
  created_at: string
}

interface Reply {
  id: string
  discussion_id: string
  user_id: string
  username: string
  body: string
  created_at: string
}

interface Props {
  params: { id: string }
}

// ── Helpers ────────────────────────────────────────────────
function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60)    return `${seconds}s ago`
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const AVATAR_COLORS = [
  'bg-purple-500/20 text-purple-400',
  'bg-blue-500/20 text-blue-400',
  'bg-pink-500/20 text-pink-400',
  'bg-yellow-500/20 text-yellow-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-orange-500/20 text-orange-400',
]
function avatarColor(username: string) {
  let hash = 0
  for (const c of username) hash = (hash + c.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[hash]
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

// ── Component ──────────────────────────────────────────────
export default function DiscussionPage({ params }: Props) {
  const { id } = params
  const router = useRouter()
  const supabase = createClient()

  const [discussion, setDiscussion]   = useState<Discussion | null>(null)
  const [replies, setReplies]         = useState<Reply[]>([])
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null)
  const [replyBody, setReplyBody]     = useState('')
  const [sending, setSending]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [notFound, setNotFound]       = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      setCurrentUser({
        id: user.id,
        username: profile?.username || user.email?.split('@')[0] || 'Naija',
      })
    })
  }, [])

  // Load discussion
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('discussions')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) { setNotFound(true); return }
      setDiscussion(data)
    }
    load()
  }, [id])

  // Load replies
  useEffect(() => {
    async function loadReplies() {
      const { data } = await supabase
        .from('discussion_replies')
        .select('*')
        .eq('discussion_id', id)
        .order('created_at', { ascending: true })

      if (data) setReplies(data)
    }
    loadReplies()
  }, [id])

  // Realtime replies
  useEffect(() => {
    const channel = supabase
      .channel(`discussion:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'discussion_replies',
          filter: `discussion_id=eq.${id}`,
        },
        (payload) => {
          setReplies((prev) => {
            const exists = prev.some((r) => r.id === payload.new.id)
            return exists ? prev : [...prev, payload.new as Reply]
          })
          // Update local reply count
          setDiscussion((prev) =>
            prev ? { ...prev, reply_count: prev.reply_count + 1 } : prev
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  // Scroll to bottom when replies load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [replies])

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyBody.trim() || !currentUser || sending) return

    if (replyBody.trim().length < 3) {
      setError('Reply is too short.')
      return
    }

    setSending(true)
    setError(null)

    const { error } = await supabase.from('discussion_replies').insert({
      discussion_id: id,
      user_id: currentUser.id,
      username: currentUser.username,
      body: replyBody.trim(),
    })

    if (error) {
      setError(error.message)
    } else {
      setReplyBody('')
    }

    setSending(false)
  }

  // ── Not found ──
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="text-[#F5F5F0] font-display text-lg font-semibold mb-2">Discussion not found</p>
        <p className="text-[#6B6B6B] text-sm mb-6">It may have been deleted.</p>
        <Link href="/discussions" className="text-[#008751] hover:text-[#00a862] text-sm font-medium">
          ← Back to Discussions
        </Link>
      </div>
    )
  }

  if (!discussion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="w-6 h-6 border-2 border-white/10 border-t-[#008751] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto">

      {/* Back */}
      <Link
        href="/discussions"
        className="inline-flex items-center gap-1.5 text-[#6B6B6B] hover:text-[#F5F5F0] text-xs mb-6 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Discussions
      </Link>

      {/* Original post */}
      <div className="relative bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden mb-6">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#008751]" />
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[discussion.tag] ?? TAG_COLORS['General']}`}>
              {discussion.tag}
            </span>
          </div>
          <h1 className="font-display text-lg md:text-xl font-bold text-[#F5F5F0] leading-snug mb-3">
            {discussion.title}
          </h1>
          <p className="text-sm text-[#D0D0D0] leading-relaxed whitespace-pre-wrap mb-4">
            {discussion.body}
          </p>
          <div className="flex items-center gap-3 pt-3 border-t border-white/5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarColor(discussion.username)}`}>
              {discussion.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-[#6B6B6B]">@{discussion.username}</span>
            <span className="text-[10px] text-[#3D3D3D]">·</span>
            <span className="text-xs text-[#4A4A4A]">{timeAgo(discussion.created_at)}</span>
            <span className="ml-auto text-xs text-[#4A4A4A]">
              {discussion.reply_count} {discussion.reply_count === 1 ? 'reply' : 'replies'}
            </span>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-3 mb-6">
          <p className="text-xs text-[#4A4A4A] font-medium uppercase tracking-widest px-1">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </p>
          {replies.map((reply) => {
            const isOwn = reply.user_id === currentUser?.id
            return (
              <div
                key={reply.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${isOwn ? 'bg-[#008751]/20 text-[#008751]' : avatarColor(reply.username)}`}>
                  {reply.username.charAt(0).toUpperCase()}
                </div>
                <div className={`flex flex-col gap-1 max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] text-[#6B6B6B]">
                      {isOwn ? 'You' : `@${reply.username}`}
                    </span>
                    <span className="text-[9px] text-[#3D3D3D]">{timeAgo(reply.created_at)}</span>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${
                    isOwn
                      ? 'bg-[#008751] text-white rounded-br-sm'
                      : 'bg-[#1A1A1A] text-[#D0D0D0] border border-white/5 rounded-bl-sm'
                  }`}>
                    {reply.body}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Reply box */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-xs font-medium text-[#6B6B6B]">
            Replying as{' '}
            <span className="text-[#F5F5F0]">@{currentUser?.username}</span>
          </p>
        </div>
        <form onSubmit={handleReply} className="p-4 space-y-3">
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Write your reply…"
            rows={3}
            maxLength={2000}
            className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/50 transition-all resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#3D3D3D]">{replyBody.length}/2000</span>
            <button
              type="submit"
              disabled={!replyBody.trim() || sending}
              className="flex items-center gap-2 bg-[#008751] hover:bg-[#00a862] disabled:bg-[#008751]/40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all font-display"
            >
              {sending ? (
                <>
                  <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Posting…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Post Reply
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}