import { useState } from 'react'
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

export default function App() {
  const userId = getUserId()
  const savedTaste = getSavedTaste()

  const [screen, setScreen] = useState(savedTaste ? 'input' : 'input')
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exhausted, setExhausted] = useState(false)

  async function fetchDrop(tasteDescription) {
    setLoading(true)
    setError(null)
    try {
      const data = await getRecommendations(tasteDescription, userId)
      setBrands(data.drop)
      setExhausted(false)
      setScreen('drop')
    } catch (err) {
      if (err.message === 'catalog_exhausted') {
        setExhausted(true)
      } else {
        setError('Something went wrong. Make sure the backend is running.')
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
    setScreen('profile')
  }

  function handleNextDrop() {
    fetchDrop(getSavedTaste())
  }

  function handleUpdateTaste() {
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
      {exhausted && (
        <div className="page taste-input-page">
          <h1 className="app-title">Drop</h1>
          <p className="splash-tagline">You've seen every brand in the catalog. Reset your history to start fresh.</p>
          <button type="button" className="submit-btn" onClick={handleResetHistory} disabled={loading}>
            {loading ? 'Resetting…' : 'Start fresh →'}
          </button>
        </div>
      )}
      {screen === 'input' && (
        <TasteInput
          onSubmit={handleSubmit}
          loading={loading}
          savedTaste={savedTaste}
        />
      )}
      {screen === 'drop' && (
        <Drop
          brands={brands}
          userId={userId}
          onRankingsSubmitted={handleRankingsSubmitted}
        />
      )}
      {screen === 'profile' && (
        <Profile
          userId={userId}
          onNextDrop={handleNextDrop}
          onUpdateTaste={handleUpdateTaste}
          loading={loading}
        />
      )}
    </div>
  )
}
