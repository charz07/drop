import { useEffect, useState } from 'react'
import { getProfile } from '../api/recommendations'

export default function Profile({ userId, onNextDrop, onUpdateTaste, loading }) {
  const [brands, setBrands] = useState([])
  const [summary, setSummary] = useState(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getProfile(userId).then((data) => {
      setBrands(data.brands)
      setSummary(data.summary)
      setFetching(false)
    })
  }, [userId])

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <h2>Your Taste Profile</h2>
        <p className="drop-subtitle">Built from everything you've ranked.</p>
      </div>

      {fetching && <p className="muted">Loading…</p>}

      {!fetching && summary && (
        <p className="taste-summary">{summary}</p>
      )}

      {!fetching && brands.length > 0 && (
        <div className="profile-brand-list">
          {brands.map((brand) => (
            <div key={brand.id} className="profile-brand-card">
              <div className="profile-brand-row">
                <span className="profile-brand-name">{brand.name}</span>
                <span className="profile-rank-badge">{brand.rank}</span>
              </div>
              <span className="profile-brand-desc">{brand.description}</span>
            </div>
          ))}
        </div>
      )}

      {!fetching && brands.length === 0 && (
        <p className="muted">No rankings yet.</p>
      )}

      <div className="drop-actions" style={{ marginTop: '2rem' }}>
        <button type="button" className="submit-btn" onClick={onNextDrop} disabled={loading}>
          {loading ? 'Finding your drop…' : 'Get next drop →'}
        </button>
        <button type="button" className="profile-link" onClick={onUpdateTaste}>
          Update taste description
        </button>
      </div>
    </div>
  )
}
