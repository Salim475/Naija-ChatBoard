'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────
interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  username: string
}

interface Props {
  params: { roomId: string }
}

// ── Room metadata (will come from DB later) ────────────────
const ROOM_META: Record<string, { name: string; description: string }> = {
  'naija-politics':   { name: 'Naija Politics 🗳️',    description: 'Hot takes and real talk on Nigerian politics.' },
  'tech-lagos':       { name: 'Tech in Lagos 💻',      description: 'Startups, developer gist, and tech jobs.' },
  'jollof-war':       { name: 'Jollof War Zone 🍛',    description: 'Nigeria vs Ghana. The debate never dies.' },
  'naija-music':      { name: 'Naija Music 🎵',        description: 'All the vibes — Afrobeats and beyond.' },
  'hustle-corner':    { name: 'Hustle Corner 💼',      description: 'Business ideas and entrepreneurship.' },
  'edu-talks':        { name: 'Edu Talks 🎓',          description: 'JAMB, WAEC, scholarships, and career advice.' },
  'diaspora-connect': { name: 'Diaspora Connect ✈️',  description: 'For Nigerians abroad.' },
  'sports-arena':     { name: 'Sports Arena ⚽',       description: 'Super Eagles, NPFL, and everything sports.' },
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase()
}

// Consistent avatar color per username
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

// ── Component ──────────────────────────────────────────────
export default function RoomPage({ params }: Props) {
  const { roomId } = params
  const room = ROOM_META[roomId] ?? { name: roomId, description: '' }

  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null)
  const [onlineCount, setOnlineCount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ── Load user ────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser({
          id: user.id,
          username:
            user.user_metadata?.username || user.email?.split('@')[0] || 'Naija',
        })
      }
    })
  }, [])

  // ── Scroll to bottom ─────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ── Fetch existing messages ───────────────────────────────
  useEffect(() => {
    async function loadMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (!error && data) {
        setMessages(data as Message[])
      }
    }
    loadMessages()
  }, [roomId])

  // ── Realtime subscription ─────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  // ── Presence (online count) ───────────────────────────────
  useEffect(() => {
    if (!currentUser) return

    const presenceChannel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: currentUser.id } },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ username: currentUser.username })
        }
      })

    return () => {
      supabase.removeChannel(presenceChannel)
    }
  }, [currentUser, roomId])

  // ── Send message ──────────────────────────────────────────
  async function sendMessage() {
    if (!input.trim() || !currentUser || sending) return

    const content = input.trim()
    setInput('')
    setSending(true)

    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      user_id: currentUser.id,
      username: currentUser.username,
      content,
    })

    if (error) {
      console.error('Failed to send:', error.message)
      setInput(content) // restore on failure
    }

    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen md:h-screen">

      {/* Room header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 md:px-6 py-4 bg-[#111111] border-b border-white/5">
        <Link
          href="/chat"
          className="text-[#4A4A4A] hover:text-[#F5F5F0] transition-colors mr-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-sm font-semibold text-[#F5F5F0] truncate">
            {room.name}
          </h1>
          <p className="text-[10px] text-[#6B6B6B] truncate">{room.description}</p>
        </div>

        {/* Online indicator */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#008751] pulse-dot" />
          <span className="text-[10px] text-[#6B6B6B]">
            {onlineCount > 0 ? `${onlineCount} online` : 'Live'}
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[#4A4A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#F5F5F0] mb-1">No messages yet</p>
            <p className="text-xs text-[#6B6B6B]">Be the first to say something in {room.name}</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.user_id === currentUser?.id
          const prevMsg = messages[i - 1]
          const grouped = prevMsg?.user_id === msg.user_id

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${grouped ? 'mt-1' : 'mt-4'}`}
            >
              {/* Avatar */}
              {!grouped ? (
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${isOwn ? 'bg-[#008751]/20 text-[#008751]' : avatarColor(msg.username)}`}>
                  {getInitial(msg.username)}
                </div>
              ) : (
                <div className="w-7 flex-shrink-0" />
              )}

              <div className={`flex flex-col gap-0.5 max-w-[72%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {!grouped && (
                  <div className={`flex items-center gap-2 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-medium text-[#6B6B6B]">
                      {isOwn ? 'You' : msg.username}
                    </span>
                    <span className="text-[9px] text-[#3D3D3D]">{formatTime(msg.created_at)}</span>
                  </div>
                )}
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                    isOwn
                      ? 'bg-[#008751] text-white rounded-br-sm'
                      : 'bg-[#1A1A1A] text-[#D0D0D0] border border-white/5 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4 bg-[#0A0A0A] border-t border-white/5">
        <div className="flex items-end gap-3 bg-[#1A1A1A] border border-white/5 focus-within:border-[#008751]/40 rounded-2xl px-4 py-3 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${room.name}…`}
            rows={1}
            className="flex-1 bg-transparent text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] resize-none focus:outline-none max-h-32 overflow-y-auto leading-relaxed"
            style={{ minHeight: '24px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#008751] hover:bg-[#00a862] disabled:bg-[#2A2A2A] disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            {sending ? (
              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-[#3D3D3D] mt-2 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}