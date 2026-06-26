import { useEffect, useState } from 'react'
import { getProfile } from '../api/recommendations'

export default function Profile({ userId, onNextDrop, onUpdateTaste, loading }) {
  const [brands, setBrands] = useState([])
  const [summary, setSummary] = useState(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getProfile(userId)
      .then((data) => {
        setBrands(data.brands)
        setSummary(data.summary)
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [userId])

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <h2>Your Taste Profile</h2>
        <p className="drop-subtitle">Built from everything you've reacted to.</p>
      </div>

      {fetching && <p className="muted">Loading…</p>}

      {!fetching && summary && (
        <p className="taste-summary">{summary}</p>
      )}

      {!fetching && brands.length > 0 && (() => {
        const tagCounts = {}
        brands.forEach((b) => (b.tags || []).forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1 }))
        const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t]) => t)
        return topTags.length > 0 && (
          <>
            <p className="profile-section-label">Your taste tends toward</p>
            <div className="profile-tags">
              {topTags.map((tag) => <span key={tag} className="brand-tag">{tag}</span>)}
            </div>
          </>
        )
      })()}

      {!fetching && (() => {
        const liked = brands.filter((b) => b.rank === 1)
        return liked.length > 0 ? (
          <>
            <p className="profile-section-label">Brands you liked</p>
            <div className="profile-brand-list">
              {liked.map((brand) => (
                <div key={brand.id} className="profile-brand-card">
                  <div className="profile-brand-row">
                    <span className="profile-brand-name">{brand.name}</span>
                  </div>
                  <span className="profile-brand-desc">{brand.description}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="muted">Like some brands to build your profile.</p>
        )
      })()}

      <div className="drop-actions" style={{ marginTop: '2rem' }}>
        <button type="button" className="submit-btn" onClick={onNextDrop} disabled={loading}>
          {loading ? 'Finding your drop…' : 'Get next drop →'}
        </button>
        <button type="button" className="profile-link" onClick={onUpdateTaste}>
          Retake taste quiz
        </button>
      </div>
    </div>
  )
}
