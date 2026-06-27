import { useEffect, useState } from 'react'
import { getProfile } from '../api/recommendations'

export default function Profile({ userId, onNextDrop, onUpdateTaste, onBackToDrop, hasDrop, loading }) {
  const [brands, setBrands] = useState([])
  const [summary, setSummary] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setFetching(true)
    setError(null)
    getProfile(userId)
      .then((data) => {
        setBrands(data.brands)
        setSummary(data.summary)
      })
      .catch(() => setError("Couldn't load your profile."))
      .finally(() => setFetching(false))
  }, [userId, retryCount])

  const liked = brands.filter((b) => b.rank === 1)
  const tagCounts = {}
  liked.forEach((b) => (b.tags || []).forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1 }))
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t]) => t)

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <h2>your taste.</h2>
      </div>

      {fetching && <p className="muted">Loading…</p>}

      {!fetching && error && (
        <div className="profile-error">
          <p>{error}</p>
          <button className="btn-ghost" onClick={() => setRetryCount((c) => c + 1)}>
            Try again
          </button>
        </div>
      )}

      {!fetching && !error && summary && (
        <p className="taste-summary">{summary}</p>
      )}

      {!fetching && !error && topTags.length > 0 && (
        <>
          <p className="profile-section-label">what you want</p>
          <div className="profile-tags">
            {topTags.map((tag) => <span key={tag} className="brand-tag">{tag}</span>)}
          </div>
        </>
      )}

      {!fetching && !error && liked.length > 0 && (
        <>
          <p className="profile-section-label">brands you wanted</p>
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
      )}

      {!fetching && !error && liked.length === 0 && (
        <p className="muted">Want some brands from your drops to build your profile.</p>
      )}

      <div className="drop-actions">
        {hasDrop && (
          <button type="button" className="btn-ghost" onClick={onBackToDrop}>
            ← Back to drop
          </button>
        )}
        <button type="button" className="btn-primary" onClick={onNextDrop} disabled={loading}>
          {loading ? 'Finding your drop.' : 'Get next drop →'}
        </button>
        <button type="button" className="btn-ghost" onClick={onUpdateTaste}>
          Update my taste
        </button>
      </div>
    </div>
  )
}
