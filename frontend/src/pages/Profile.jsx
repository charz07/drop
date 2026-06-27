import { useEffect, useState } from 'react'
import { getProfile } from '../api/recommendations'

const PERSONAS = {
  'heat-seeker': {
    label: 'the heat seeker.',
    desc: 'every drop, you find the one that burns — and you want it.',
  },
  'ferment-head': {
    label: 'the ferment head.',
    desc: 'funk, acid, complexity. you want the stuff that takes time to understand.',
  },
  'globalist': {
    label: 'the globalist.',
    desc: 'you pass on anything that could have been made in Ohio.',
  },
  'maximalist': {
    label: 'the maximalist.',
    desc: 'subtle never cuts it. bold, rich, more — the stuff that makes an impression.',
  },
  'purist': {
    label: 'the purist.',
    desc: 'one, maybe two per drop. standards are high and you know it.',
  },
  'explorer': {
    label: 'the explorer.',
    desc: 'you rarely say no. every drop, you find something. you\'re here for all of it.',
  },
}

function derivePersona(brands) {
  if (brands.length < 8) return null

  const wanted = brands.filter((b) => b.reaction === 'want')
  const wantRate = wanted.length / brands.length

  if (wantRate <= 0.25) return 'purist'

  const tagCounts = {}
  wanted.forEach((b) =>
    (b.tags || []).forEach((t) => {
      const norm = t.toLowerCase()
      tagCounts[norm] = (tagCounts[norm] || 0) + 1
    })
  )

  const score = (keywords) =>
    keywords.reduce(
      (sum, k) =>
        sum +
        Object.entries(tagCounts)
          .filter(([t]) => t.includes(k))
          .reduce((s, [, c]) => s + c, 0),
      0
    )

  const scores = {
    'heat-seeker': score(['spicy', 'heat', 'hot', 'chili', 'chile', 'pepper']),
    'ferment-head': score(['ferment', 'probiotic', 'umami', 'funky', 'aged', 'cultured', 'miso', 'kimchi', 'vinegar', 'tangy']),
    globalist: score(['global', 'asian', 'japanese', 'korean', 'mexican', 'latin', 'indian', 'thai', 'chinese', 'international']),
    maximalist: score(['bold', 'rich', 'indulgent', 'intense', 'decadent', 'complex']),
  }

  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  if (top && top[1] > 0) return top[0]

  return wantRate > 0.6 ? 'explorer' : 'explorer'
}

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

  const wanted = brands.filter((b) => b.reaction === 'want')
  const passed = brands.filter((b) => b.reaction === 'no')

  const topTag = (() => {
    const counts = {}
    wanted.forEach((b) => (b.tags || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  })()

  const topSkipTag = (() => {
    const counts = {}
    passed.forEach((b) => (b.tags || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  })()

  const persona = derivePersona(brands)
  const personaData = persona ? PERSONAS[persona] : null

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <h2>your taste.</h2>
      </div>

      {fetching && <p className="muted">Loading…</p>}

      {!fetching && error && (
        <div className="profile-error">
          <p>{error}</p>
          <button className="btn-ghost" onClick={() => setRetryCount((c) => c + 1)}>Try again</button>
        </div>
      )}

      {!fetching && !error && (
        <>
          {/* Persona */}
          {personaData && (
            <div className="profile-persona">
              <h1 className="persona-label">{personaData.label}</h1>
              <p className="persona-desc">{summary || personaData.desc}</p>
            </div>
          )}

          {!personaData && summary && (
            <p className="taste-summary">{summary}</p>
          )}

          {/* Superlatives */}
          {brands.length > 0 && (
            <div className="profile-superlatives">
              <div className="superlative-stats">
                <div className="superlative-stat">
                  <span className="superlative-num">{brands.length}</span>
                  <span className="superlative-label">tried</span>
                </div>
                <div className="superlative-stat">
                  <span className="superlative-num">{wanted.length}</span>
                  <span className="superlative-label">wanted</span>
                </div>
                <div className="superlative-stat">
                  <span className="superlative-num">{passed.length}</span>
                  <span className="superlative-label">passed</span>
                </div>
              </div>

              {topTag && (
                <div className="superlative-insight">
                  <span className="superlative-insight-label">you always come back to</span>
                  <span className="brand-tag">{topTag}</span>
                </div>
              )}
              {topSkipTag && (
                <div className="superlative-insight">
                  <span className="superlative-insight-label">you consistently skip</span>
                  <span className="brand-tag brand-tag--muted">{topSkipTag}</span>
                </div>
              )}
            </div>
          )}

          {/* Record */}
          {brands.length > 0 && (
            <div className="profile-record">
              <p className="profile-section-label">everything you've tried</p>
              <div className="profile-brand-list">
                {['want', 'maybe', 'no'].flatMap((rxn) =>
                  brands.filter((b) => b.reaction === rxn).map((brand) => (
                    <div key={brand.id} className="profile-brand-card">
                      {brand.image_url && (
                        <div className="profile-brand-thumb">
                          <img src={brand.image_url} alt={brand.name} onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        </div>
                      )}
                      <div className="profile-brand-info">
                        <div className="profile-brand-row">
                          <span className="profile-brand-name">{brand.name}</span>
                          <span className={`profile-rxn-badge profile-rxn-badge--${brand.reaction}`}>
                            {brand.reaction === 'no' ? '✕' : brand.reaction}
                          </span>
                        </div>
                        {brand.description && (
                          <span className="profile-brand-desc">{brand.description}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {brands.length === 0 && (
            <p className="muted">Rate some brands from your drops to build your profile.</p>
          )}
        </>
      )}

      <div className="drop-actions">
        {hasDrop && (
          <button type="button" className="btn-ghost" onClick={onBackToDrop}>← back to drop</button>
        )}
        <button type="button" className="btn-primary" onClick={onNextDrop} disabled={loading}>
          {loading ? 'finding your drop.' : 'get next drop →'}
        </button>
        <button type="button" className="btn-ghost" onClick={onUpdateTaste}>update my taste</button>
      </div>
    </div>
  )
}
