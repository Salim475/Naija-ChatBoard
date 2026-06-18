'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const TAGS = ['General', 'Politics', 'Tech', 'Music', 'Sports', 'Education', 'Business', 'Food & Fun']

const DURATIONS = [
  { label: '1 day',   hours: 24 },
  { label: '3 days',  hours: 72 },
  { label: '7 days',  hours: 168 },
  { label: 'No expiry', hours: null },
]

export default function NewPollPage() {
  const router = useRouter()
  const supabase = createClient()

  const [question, setQuestion] = useState('')
  const [options, setOptions]   = useState(['', ''])
  const [tag, setTag]           = useState('General')
  const [duration, setDuration] = useState<number | null>(24)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  function addOption() {
    if (options.length < 6) setOptions([...options, ''])
  }

  function removeOption(i: number) {
    if (options.length <= 2) return
    setOptions(options.filter((_, idx) => idx !== i))
  }

  function updateOption(i: number, val: string) {
    const updated = [...options]
    updated[i] = val
    setOptions(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (question.trim().length < 10) {
      setError('Question must be at least 10 characters.')
      return
    }

    const validOptions = options.map((o) => o.trim()).filter(Boolean)
    if (validOptions.length < 2) {
      setError('You need at least 2 options.')
      return
    }

    const uniqueOptions = new Set(validOptions.map((o) => o.toLowerCase()))
    if (uniqueOptions.size !== validOptions.length) {
      setError('Options must be unique.')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    const username = profile?.username || user.email?.split('@')[0] || 'Naija'

    const closesAt = duration
      ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
      : null

    // Insert poll
    const { data: poll, error: pollErr } = await supabase
      .from('polls')
      .insert({ user_id: user.id, username, question: question.trim(), tag, closes_at: closesAt })
      .select('id')
      .single()

    if (pollErr || !poll) {
      setError(pollErr?.message ?? 'Failed to create poll.')
      setLoading(false)
      return
    }

    // Insert options
    const { error: optErr } = await supabase.from('poll_options').insert(
      validOptions.map((label, position) => ({
        poll_id: poll.id,
        label,
        position,
      }))
    )

    if (optErr) {
      setError(optErr.message)
      setLoading(false)
      return
    }

    router.push(`/polls/${poll.id}`)
  }

  return (
    <div className="px-4 md:px-8 py-8 max-w-xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/polls" className="text-[#4A4A4A] hover:text-[#F5F5F0] transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-display text-2xl font-bold text-[#F5F5F0]">New Poll</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Tag */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest">Category</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <button
                key={t} type="button" onClick={() => setTag(t)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  tag === t
                    ? 'bg-[#008751]/15 text-[#008751] border-[#008751]/30'
                    : 'bg-[#1A1A1A] text-[#6B6B6B] border-white/5 hover:border-white/10 hover:text-[#F5F5F0]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="space-y-1.5">
          <label htmlFor="question" className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest">
            Question
          </label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask Naija something…"
            maxLength={200}
            required
            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/60 focus:ring-2 focus:ring-[#008751]/10 transition-all"
          />
          <p className="text-[10px] text-[#4A4A4A] text-right">{question.length}/200</p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest">
              Options <span className="normal-case text-[#3D3D3D]">({options.length}/6)</span>
            </label>
          </div>

          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2A2A2A] border border-white/5 flex items-center justify-center text-[10px] text-[#4A4A4A] font-medium">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  maxLength={100}
                  className="flex-1 bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-2.5 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/60 focus:ring-2 focus:ring-[#008751]/10 transition-all"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="flex-shrink-0 text-[#3D3D3D] hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-2 text-xs text-[#008751] hover:text-[#00a862] font-medium transition-colors mt-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add option
            </button>
          )}
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest">Poll Duration</label>
          <div className="grid grid-cols-2 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.label} type="button"
                onClick={() => setDuration(d.hours)}
                className={`text-xs font-medium px-3 py-2.5 rounded-xl border transition-all ${
                  duration === d.hours
                    ? 'bg-[#008751]/15 text-[#008751] border-[#008751]/30'
                    : 'bg-[#1A1A1A] text-[#6B6B6B] border-white/5 hover:border-white/10 hover:text-[#F5F5F0]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit" disabled={loading}
            className="flex-1 bg-[#008751] hover:bg-[#00a862] disabled:bg-[#008751]/40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 font-display"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </>
            ) : 'Create Poll'}
          </button>
          <Link
            href="/polls"
            className="px-5 py-3 text-sm font-medium text-[#6B6B6B] hover:text-[#F5F5F0] bg-[#1A1A1A] border border-white/5 hover:border-white/10 rounded-xl transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}