'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DotGrid from '@/app/(protected)/components/DotGrid'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

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

      {/* Ambient background glow */}
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

          {/* Nigerian green left accent stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#008751]" />

          <div className="px-8 py-9">
            <h1
              className="text-xl font-semibold text-[#F5F5F0] mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Welcome back
            </h1>
            <p className="text-[#6B6B6B] text-sm mb-8">
              Sign in to your account to continue
            </p>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

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
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-widest"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#008751] hover:text-[#00a862] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 px-8 py-5">
            <p className="text-center text-sm text-[#6B6B6B]">
              No account yet?{' '}
              <Link
                href="/register"
                className="text-[#008751] hover:text-[#00a862] font-medium transition-colors"
              >
                Create one — e free
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-[#3D3D3D] mt-6">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="hover:text-[#6B6B6B] transition-colors underline underline-offset-2">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="hover:text-[#6B6B6B] transition-colors underline underline-offset-2">
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Google Font import via style tag */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
      `}</style>
    </main>
  )
}