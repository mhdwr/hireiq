import { useState, useEffect } from 'react'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Results from './pages/Results'
import Login from './pages/Login'

function App() {
  const [page, setPage] = useState('landing')
  const [results, setResults] = useState([])
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [minLoadDone, setMinLoadDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadDone(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        await u.reload()
        if (!u.emailVerified && u.providerData[0]?.providerId === 'password') {
          setUser(null)
        } else {
          setUser(u)
        }
      } else {
        setUser(null)
      }
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  if (authLoading || !minLoadDone) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '20px'
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.85; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        width: '72px', height: '72px',
        background: 'linear-gradient(135deg, #6C63FF, #00D4AA)',
        borderRadius: '22px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 2s ease-in-out infinite',
        boxShadow: '0 0 40px rgba(108,99,255,0.3)'
      }}>
        <img src="/logo.svg" alt="HireIQ" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
      </div>

      <div style={{
        fontFamily: 'Syne', fontWeight: 800, fontSize: '28px',
        background: 'linear-gradient(90deg, #6C63FF, #00D4AA, #6C63FF)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'shimmer 2.5s linear infinite, fadeUp 0.6s ease forwards',
      }}>
        HireIQ
      </div>
    </div>
  )

  if (!user) return <Login onLogin={() => {
    auth.currentUser?.reload().then(() => {
      setUser(auth.currentUser)
      setPage('dashboard')
    })
  }} />

  return (
    <>
      {page === 'landing' && <Landing onStart={() => setPage('dashboard')} />}
      {page === 'dashboard' && (
        <Dashboard
          user={user}
          onLogout={() => signOut(auth)}
          onResults={(data) => {
            setResults(data)
            setPage('results')
          }}
        />
      )}
      {page === 'results' && (
        <Results
          data={results}
          onBack={() => setPage('dashboard')}
        />
      )}
    </>
  )
}

export default App