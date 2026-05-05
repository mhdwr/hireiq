import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import Dashboard from './pages/Dashboard'
import Results from './pages/Results'
import Login from './pages/Login'
import { LogOut, History, ChevronRight, Sparkles, X, Menu } from 'lucide-react'

function App() {
  const [page, setPage] = useState('dashboard')
  const [results, setResults] = useState([])
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [minLoadDone, setMinLoadDone] = useState(false)
  const [history, setHistory] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  // History fetch — user login hone par
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'screenings'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
  }, [user])

  const handleHistoryClick = (entry) => {
    setResults({ results: entry.results, failed: entry.failed || [], jobDesc: entry.jobDesc })
    setPage('results')
    setSidebarOpen(false)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const d = timestamp.toDate()
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
  }

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 40,
            display: window.innerWidth >= 768 ? 'none' : 'block'
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: '260px', flexShrink: 0,
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: window.innerWidth < 768 ? 'fixed' : 'sticky',
        top: 0, left: 0,
        height: '100vh',
        zIndex: 50,
        transform: window.innerWidth < 768
          ? sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
          : 'translateX(0)',
        transition: 'transform 0.3s ease'
      }}>

        {/* Logo */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '18px' }}>HireIQ</span>
          </div>
          {window.innerWidth < 768 && (
            <button onClick={() => setSidebarOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} color="var(--muted)" />
            </button>
          )}
        </div>

        {/* New Screening Button */}
        <div style={{ padding: '16px' }}>
          <button
            onClick={() => { setPage('dashboard'); setSidebarOpen(false) }}
            style={{
              width: '100%',
              background: page === 'dashboard'
                ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                : 'rgba(108,99,255,0.08)',
              color: page === 'dashboard' ? 'white' : 'var(--accent)',
              border: 'none', borderRadius: '12px',
              padding: '12px 16px',
              fontFamily: 'Syne', fontWeight: 700, fontSize: '14px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
            <Sparkles size={16} />
            New Screening
          </button>
        </div>

        {/* History */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '10px', paddingLeft: '4px'
          }}>
            <History size={13} color="var(--muted)" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              History
            </span>
          </div>

          {history.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--muted)', paddingLeft: '4px', lineHeight: 1.6 }}>
              No screenings yet. Run your first one!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleHistoryClick(entry)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: 'none',
                    border: '1px solid transparent',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: '8px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(108,99,255,0.06)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.borderColor = 'transparent'
                  }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: '13px', fontWeight: 600,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      color: 'var(--text)', margin: 0
                    }}>
                      {entry.jobDesc?.slice(0, 35)}...
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '2px 0 0' }}>
                      {entry.cvNames?.length} CVs · {formatDate(entry.createdAt)}
                    </p>
                  </div>
                  <ChevronRight size={14} color="var(--muted)" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User + Logout */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border)'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '10px'
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '13px', fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                margin: 0
              }}>
                {user.displayName || user.email?.split('@')[0]}
              </p>
              <p style={{
                fontSize: '11px', color: 'var(--muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                margin: '2px 0 0'
              }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={() => signOut(auth)}
              title="Logout"
              style={{
                background: 'rgba(255,80,80,0.08)',
                border: '1px solid rgba(255,80,80,0.2)',
                borderRadius: '10px', padding: '8px',
                cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              <LogOut size={16} color="#FF5050" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      {window.innerWidth < 768 && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'fixed', top: '16px', left: '16px',
            zIndex: 30, background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px', padding: '8px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}>
          <Menu size={18} color="var(--text)" />
        </button>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {page === 'dashboard' && (
          <Dashboard
            user={user}
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
      </div>
    </div>
  )
}

export default App