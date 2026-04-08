import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInAsDemo } = useAuthStore()
  const navigate = useNavigate()

  const handleDemo = () => {
    signInAsDemo()
    navigate('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-full max-w-sm p-8 border border-[var(--border)] bg-[var(--bg-secondary)]">
        <h1 className="font-serif text-2xl text-[var(--text-primary)] mb-1">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          {isSignUp ? 'Set up your life dashboard' : 'Sign in to your dashboard'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border)] 
                         text-[var(--text-primary)] text-sm font-sans
                         focus:outline-none focus:border-[var(--accent-sage)]
                         placeholder:text-[var(--text-tertiary)]"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border)] 
                         text-[var(--text-primary)] text-sm font-sans
                         focus:outline-none focus:border-[var(--accent-sage)]
                         placeholder:text-[var(--text-tertiary)]"
              placeholder="Min 6 characters"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--accent-rose)] bg-[var(--accent-rose)]/10 
                          border border-[var(--accent-rose)]/20 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--accent-sage)] text-[var(--bg-primary)] 
                       text-sm font-medium uppercase tracking-wider
                       hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-tertiary)]">or</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <button
          onClick={handleDemo}
          className="mt-4 w-full py-2.5 border border-[var(--border)] text-[var(--text-secondary)]
                     text-sm uppercase tracking-wider hover:text-[var(--text-primary)]
                     hover:border-[var(--text-tertiary)] transition-all"
        >
          Continue as Demo
        </button>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
          className="mt-4 w-full text-center text-sm text-[var(--text-secondary)]
                     hover:text-[var(--text-primary)] transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}