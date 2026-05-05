import { useState } from 'react'
import { auth, googleProvider } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification } from 'firebase/auth'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock } from 'lucide-react'

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      if (isSignup) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password)
        await sendEmailVerification(userCred.user, {
          url: 'https://hireiq-chi.vercel.app'
        })
        setError('✅ Verification email sent! Check your inbox or spam folder.')
        setIsSignup(false)
        setLoading(false)
        return
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password)
        await userCred.user.reload()
        if (!userCred.user.emailVerified) {
          setError('Please verify your email before logging in. Check your inbox.')
          await auth.signOut()
          setLoading(false)
          return
        }
        onLogin()
      }
    } catch (err) {
      console.error('Full error:', err) // For debug
      const code = err.code
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('No account found with this email. Please sign up first.')
      } else if (code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.')
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.')
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in.')
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters long.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      onLogin()
    } catch (err) {
      const code = err.code
      if (code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled. Please try again.')
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.')
      } else {
        setError('Google sign-in failed. Please try again.')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--card)', borderRadius: '24px',
          padding: '40px', width: '100%', maxWidth: '420px',
          border: '1px solid var(--border)'
        }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '22px' }}>HireIQ</span>
        </div>

        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '26px', marginBottom: '8px' }}>
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px' }}>
          {isSignup ? 'Start screening CVs with AI' : 'Sign in to your HireIQ account'}
        </p>

        {/* Google Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px',
            color: 'var(--text)', marginBottom: '20px'
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Email */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '14px 16px'
          }}>
            <Mail size={16} color="var(--muted)" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text)'
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '14px 16px'
          }}>
            <Lock size={16} color="var(--muted)" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text)'
              }}
            />
          </div>
        </div>

        {/* Terms */}
        {isSignup && (
          <p style={{
            fontSize: '12px', color: 'var(--muted)',
            textAlign: 'center', marginBottom: '16px',
            lineHeight: '1.6'
          }}>
            By creating an account, you agree to our{' '}
            <span style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}>
              Terms of Service
            </span>{' '}
            and{' '}
            <span style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}>
              Privacy Policy
            </span>
          </p>
        )}

        {/* Error */}
        {error && (
          <p style={{
            color: error.startsWith('✅') ? '#00D4AA' : '#FF5050',
            fontSize: '13px',
            marginBottom: '16px', textAlign: 'center'
          }}>{error}</p>
        )}

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(108,99,255,0.25)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '15px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: 'white', border: 'none', borderRadius: '14px',
            fontFamily: 'Syne', fontWeight: 700, fontSize: '16px',
            cursor: 'pointer', marginBottom: '20px'
          }}>
          {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
        </motion.button>

        {/* Toggle */}
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <span
            onClick={() => { setIsSignup(!isSignup); setError('') }}
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
            {isSignup ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </motion.div>
    </div>
  )
}