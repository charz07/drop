import { useState, useEffect } from 'react'
import TasteInput from './pages/TasteInput'
import Drop from './pages/Drop'
import Profile from './pages/Profile'
import { getRecommendations } from './api/recommendations'

function getUserId() {
  let id = localStorage.getItem('drop_user_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('drop_user_id', id)
  }
  return id
}

function getSavedTaste() {
  return localStorage.getItem('drop_taste') || ''
}

function saveTaste(taste) {
  localStorage.setItem('drop_taste', taste)
}

function getStoredDropNum() {
  return parseInt(localStorage.getItem('drop_num') || '0', 10)
}

export default function App() {
  const userId = getUserId()
  const savedTaste = getSavedTaste()

  const [screen, setScreen] = useState(savedTaste ? 'fetching' : 'input')
  const [brands, setBrands] = useState([])
  const [dropKey, setDropKey] = useState(0)
  const [dropNum, setDropNum] = useState(getStoredDropNum)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exhausted, setExhausted] = useState(false)

  useEffect(() => {
    if (savedTaste) fetchDrop(savedTaste)
  }, [])

  async function fetchDrop(tasteDescription) {
    const next = getStoredDropNum() + 1
    localStorage.setItem('drop_num', String(next))
    setDropNum(next)
    setScreen('fetching')
    setLoading(true)
    setError(null)
    try {
      const data = await getRecommendations(tasteDescription, userId)
      setBrands(data.drop)
      setDropKey((k) => k + 1)
      setExhausted(false)
      setScreen('drop')
    } catch (err) {
      if (err.message === 'catalog_exhausted') {
        setExhausted(true)
        setScreen('exhausted')
      } else {
        setError('Something went wrong. Make sure the backend is running.')
        setScreen(savedTaste ? 'drop' : 'input')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(tasteDescription) {
    saveTaste(tasteDescription)
    await fetchDrop(tasteDescription)
  }

  function handleRankingsSubmitted() {
    fetchDrop(getSavedTaste())
  }

  function handleViewProfile() {
    setScreen('profile')
  }

  function handleNextDrop() {
    fetchDrop(getSavedTaste())
  }

  function handleRetakeQuiz() {
    setScreen('input')
  }

  async function handleResetHistory() {
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/users/reset-history?user_id=${userId}`, { method: 'DELETE' })
    setExhausted(false)
    fetchDrop(getSavedTaste())
  }

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}

      {screen === 'fetching' && (
        <div className="page fetching-page">
          <h1 className="app-title fetching-pulse">drop.</h1>
          <p className="fetching-tagline">
            {dropNum <= 1 ? 'finding your first drop.' : `preparing drop ${dropNum}.`}
          </p>
          {dropNum > 1 && (
            <p className="fetching-hint">each rating shapes what comes next.</p>
          )}
        </div>
      )}

      {screen === 'exhausted' && (
        <div className="page fetching-page">
          <h1 className="app-title">drop.</h1>
          <p className="fetching-tagline">you've seen everything in the catalog.</p>
          <button type="button" className="btn-primary" onClick={handleResetHistory} disabled={loading}>
            {loading ? 'resetting…' : 'fresh start →'}
          </button>
        </div>
      )}

      {screen === 'input' && (
        <TasteInput onSubmit={handleSubmit} loading={loading} />
      )}

      {screen === 'drop' && (
        <Drop
          key={dropKey}
          brands={brands}
          userId={userId}
          dropNum={dropNum}
          onRankingsSubmitted={handleRankingsSubmitted}
          onViewProfile={handleViewProfile}
        />
      )}

      {screen === 'profile' && (
        <Profile
          userId={userId}
          onNextDrop={handleNextDrop}
          onUpdateTaste={handleRetakeQuiz}
          onBackToDrop={() => setScreen('drop')}
          hasDrop={brands.length > 0}
          loading={loading}
        />
      )}
    </div>
  )
}
