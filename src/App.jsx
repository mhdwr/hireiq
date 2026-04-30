import { useState } from 'react'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Results from './pages/Results'

function App() {
  const [page, setPage] = useState('landing')
  const [results, setResults] = useState([])

  return (
    <>
      {page === 'landing' && <Landing onStart={() => setPage('dashboard')} />}
      {page === 'dashboard' && (
        <Dashboard
          onResults={(data) => {
            setResults(data)
            setPage('results')
          }}
        />
      )}
      {page === 'results' && (
        <Results
          results={results}
          onBack={() => setPage('dashboard')}
        />
      )}
    </>
  )
}

export default App