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

  if (authLoading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Syne', fontSize: '18px', color: 'var(--muted)'
    }}>
      Loading...
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