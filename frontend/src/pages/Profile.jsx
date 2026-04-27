import { useEffect, useState } from 'react'
import { getProfile } from '../api/recommendations'

export default function Profile({ userId, onBack }) {
  const [brands, setBrands] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile(userId).then((data) => {
      setBrands(data.brands)
      setSummary(data.summary)
      setLoading(false)
    })
  }, [userId])

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <h2>Your Taste Profile</h2>
        <p className="drop-subtitle">Built from everything you've ranked.</p>
      </div>

      {loading && <p className="muted">Loading…</p>}

      {!loading && brands.length === 0 && (
        <p className="muted">No rankings yet. Get a drop first.</p>
      )}

      {!loading && summary && (
        <p className="taste-summary">{summary}</p>
      )}

      {!loading && brands.length > 0 && (
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

      <button type="button" className="restart-btn" style={{ marginTop: '2rem' }} onClick={onBack}>
        ← Back
      </button>
    </div>
  )
}
