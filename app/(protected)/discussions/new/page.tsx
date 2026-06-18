'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const TAGS = ['General', 'Politics', 'Tech', 'Music', 'Sports', 'Education', 'Business', 'Diaspora', 'Food & Fun']

export default function NewDiscussionPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle]   = useState('')
  const [body, setBody]     = useState('')
  const [tag, setTag]       = useState('General')
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (title.trim().length < 10) {
      setError('Title must be at least 10 characters.')
      return
    }
    if (body.trim().length < 20) {
      setError('Post body must be at least 20 characters.')
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

    const { data, error: insertError } = await supabase
      .from('discussions')
      .insert({
        user_id: user.id,
        username,
        title: title.trim(),
        body: body.trim(),
        tag,
      })
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/discussions/${data.id}`)
  }

  return (
    <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/discussions"
          className="text-[#4A4A4A] hover:text-[#F5F5F0] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-display text-2xl font-bold text-[#F5F5F0]">New Discussion</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Tag selector */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
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

        {/* Title */}
        <div className="space-y-1.5">
          <label
            htmlFor="title"
            className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to discuss?"
            maxLength={150}
            required
            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/60 focus:ring-2 focus:ring-[#008751]/10 transition-all"
          />
          <p className="text-[10px] text-[#4A4A4A] text-right">{title.length}/150</p>
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <label
            htmlFor="body"
            className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest"
          >
            Your Post
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your full thoughts here. The more detail, the better the conversation…"
            maxLength={5000}
            rows={8}
            required
            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/60 focus:ring-2 focus:ring-[#008751]/10 transition-all resize-none leading-relaxed"
          />
          <p className="text-[10px] text-[#4A4A4A] text-right">{body.length}/5000</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#008751] hover:bg-[#00a862] disabled:bg-[#008751]/40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 font-display"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting…
              </>
            ) : (
              'Post Discussion'
            )}
          </button>
          <Link
            href="/discussions"
            className="px-5 py-3 text-sm font-medium text-[#6B6B6B] hover:text-[#F5F5F0] bg-[#1A1A1A] border border-white/5 hover:border-white/10 rounded-xl transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}