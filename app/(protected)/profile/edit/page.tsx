'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ProfileForm {
  display_name: string
  bio: string
  location: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState<ProfileForm>({
    display_name: '',
    bio: '',
    location: '',
  })
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load existing profile
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUsername(profile.username)
        setForm({
          display_name: profile.display_name || '',
          bio: profile.bio || '',
          location: profile.location || '',
        })
      } else {
        const fallback = user.email?.split('@')[0] || 'Naija'
        setUsername(fallback)
        setForm({ display_name: fallback, bio: '', location: '' })
      }

      setLoading(false)
    }
    load()
  }, [])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
    setSuccess(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: form.display_name.trim() || username,
        bio: form.bio.trim(),
        location: form.location.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/profile'), 1200)
    }

    setSaving(false)
  }

  const initial = username.charAt(0).toUpperCase()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="w-5 h-5 border-2 border-white/10 border-t-[#008751] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-8 max-w-xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/profile"
          className="text-[#4A4A4A] hover:text-[#F5F5F0] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-display text-2xl font-bold text-[#F5F5F0]">Edit Profile</h1>
      </div>

      {/* Avatar preview */}
      <div className="flex items-center gap-4 bg-[#1A1A1A] border border-white/5 rounded-2xl px-5 py-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-[#008751]/20 border border-[#008751]/30 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-2xl font-bold text-[#008751]">{initial}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-[#F5F5F0]">
            {form.display_name || username}
          </p>
          <p className="text-xs text-[#6B6B6B]">@{username}</p>
          <p className="text-[10px] text-[#4A4A4A] mt-0.5">
            Username cannot be changed
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-5">

        {/* Success */}
        {success && (
          <div className="bg-[#008751]/10 border border-[#008751]/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#008751] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-[#008751]">Profile saved! Redirecting…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Display name */}
        <div className="space-y-1.5">
          <label
            htmlFor="display_name"
            className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest"
          >
            Display Name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            value={form.display_name}
            onChange={handleChange}
            placeholder={username}
            maxLength={50}
            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/60 focus:ring-2 focus:ring-[#008751]/10 transition-all"
          />
          <p className="text-[10px] text-[#4A4A4A]">
            This is the name shown on your messages and profile.
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label
            htmlFor="bio"
            className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Tell the board who you are…"
            maxLength={160}
            rows={3}
            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/60 focus:ring-2 focus:ring-[#008751]/10 transition-all resize-none"
          />
          <p className="text-[10px] text-[#4A4A4A] text-right">
            {form.bio.length}/160
          </p>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label
            htmlFor="location"
            className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest"
          >
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Lagos, Nigeria"
            maxLength={60}
            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/60 focus:ring-2 focus:ring-[#008751]/10 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#008751] hover:bg-[#00a862] disabled:bg-[#008751]/40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 font-display"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </button>
          <Link
            href="/profile"
            className="px-5 py-3 text-sm font-medium text-[#6B6B6B] hover:text-[#F5F5F0] bg-[#1A1A1A] border border-white/5 hover:border-white/10 rounded-xl transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}