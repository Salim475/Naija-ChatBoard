'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DotGrid from '@/app/(protected)/components/DotGrid'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 relative">

  {/* DotGrid background */}
  <div className="fixed inset-0 z-0 pointer-events-none">
    <DotGrid
      dotSize={4}
      gap={22}
      baseColor="#111111"
      activeColor="#008751"
      proximity={100}
      shockRadius={200}
      shockStrength={4}
      resistance={750}
      returnDuration={1.5}
    />
  </div>

  {/* existing ambient glow div stays here */}
  {/* existing content stays here */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#008751]/10 blur-[120px]" />
        </div>

        <div className="w-full max-w-md relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-10">
            <span className="text-2xl">🇳🇬</span>
            <span
              className="text-2xl font-bold text-[#F5F5F0] tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Naija ChatBoard
            </span>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#008751]" />
            <div className="px-8 py-12">
              <div className="w-14 h-14 rounded-full bg-[#008751]/15 border border-[#008751]/30 flex items-center justify-center mx-auto mb-5">
                <svg className="w-6 h-6 text-[#008751]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2
                className="text-xl font-semibold text-[#F5F5F0] mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Check your email
              </h2>
              <p className="text-[#6B6B6B] text-sm leading-relaxed mb-6">
                We sent a confirmation link to <span className="text-[#F5F5F0]">{email}</span>.
                Click it to activate your account.
              </p>
              <Link
                href="/login"
                className="inline-block text-sm text-[#008751] hover:text-[#00a862] font-medium transition-colors"
              >
                Back to sign in →
              </Link>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
        `}</style>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-10">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#008751]/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-2xl">🇳🇬</span>
            <span
              className="text-2xl font-bold text-[#F5F5F0] tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Naija ChatBoard
            </span>
          </div>
          <p className="text-[#6B6B6B] text-sm">
            Where Naija conversations happen
          </p>
        </div>

        {/* Card */}
        <div className="relative bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">

          {/* Nigerian green accent stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#008751]" />

          <div className="px-8 py-9">
            <h1
              className="text-xl font-semibold text-[#F5F5F0] mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Create your account
            </h1>
            <p className="text-[#6B6B6B] text-sm mb-8">
              Join thousands of Nigerians already on the board
            </p>

            <form onSubmit={handleRegister} className="space-y-5">

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Username */}
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. lagosboy99"
                  className="w-full bg-[#2A2A2A] border border-white/5 rounded-xl px-4 py-3 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/60 focus:ring-2 focus:ring-[#008751]/10 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#2A2A2A] border border-white/5 rounded-xl px-4 py-3 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/60 focus:ring-2 focus:ring-[#008751]/10 transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-[#2A2A2A] border border-white/5 rounded-xl px-4 py-3 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/60 focus:ring-2 focus:ring-[#008751]/10 transition-all"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm"
                  className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest"
                >
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#2A2A2A] border border-white/5 rounded-xl px-4 py-3 text-[#F5F5F0] text-sm placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#008751]/60 focus:ring-2 focus:ring-[#008751]/10 transition-all"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#008751] hover:bg-[#00a862] disabled:bg-[#008751]/40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 px-8 py-5">
            <p className="text-center text-sm text-[#6B6B6B]">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#008751] hover:text-[#00a862] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-[#3D3D3D] mt-6">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="hover:text-[#6B6B6B] transition-colors underline underline-offset-2">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="hover:text-[#6B6B6B] transition-colors underline underline-offset-2">
            Privacy Policy
          </Link>
        </p>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
      `}</style>
    </main>
  )
}