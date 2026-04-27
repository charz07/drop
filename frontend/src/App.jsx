import { useState, useEffect } from 'react'
import TasteInput from './pages/TasteInput'
import Drop from './pages/Drop'
import { getRecommendations } from './api/recommendations'

function getUserId() {
  let id = localStorage.getItem('drop_user_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('drop_user_id', id)
  }
  return id
}

export default function App() {
  const [screen, setScreen] = useState('input')
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const userId = getUserId()

  async function handleSubmit(tasteDescription) {
    setLoading(true)
    setError(null)
    try {
      const data = await getRecommendations(tasteDescription, userId)
      setBrands(data.drop)
      setScreen('drop')
    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  function handleRestart() {
    setBrands([])
    setScreen('input')
  }

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}
      {screen === 'input' && (
        <TasteInput onSubmit={handleSubmit} loading={loading} />
      )}
      {screen === 'drop' && (
        <Drop brands={brands} userId={userId} onRestart={handleRestart} />
      )}
    </div>
  )
}
