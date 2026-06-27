import { useEffect, useState } from 'react'
import { getProfile } from '../api/recommendations'
import { tagColorClass } from '../utils/tagColor'

const PERSONAS = {
  'heat-seeker': {
    label: 'the heat seeker.',
    desc: 'every drop, you find the one that burns — and you want it.',
    tint: 'oklch(0.96 0.04 22)',
    border: 'oklch(0.80 0.10 22)',
    color: 'oklch(0.40 0.18 22)',
  },
  'ferment-head': {
    label: 'the ferment head.',
    desc: 'funk, acid, complexity. you want the stuff that takes time to understand.',
    tint: 'oklch(0.96 0.04 148)',
    border: 'oklch(0.78 0.10 148)',
    color: 'oklch(0.36 0.16 148)',
  },
  'globalist': {
    label: 'the globalist.',
    desc: 'you pass on anything that could have been made in Ohio.',
    tint: 'oklch(0.96 0.04 55)',
    border: 'oklch(0.80 0.10 50)',
    color: 'oklch(0.38 0.15 45)',
  },
  'maximalist': {
    label: 'the maximalist.',
    desc: 'subtle never cuts it. bold, rich, more — the stuff that makes an impression.',
    tint: 'oklch(0.96 0.04 340)',
    border: 'oklch(0.78 0.10 340)',
    color: 'oklch(0.38 0.18 340)',
  },
  'purist': {
    label: 'the purist.',
    desc: 'one, maybe two per drop. standards are high and you know it.',
    tint: 'oklch(0.96 0.04 248)',
    border: 'oklch(0.78 0.10 248)',
    color: 'oklch(0.38 0.14 248)',
  },
  'explorer': {
    label: 'the explorer.',
    desc: 'you rarely say no. every drop, you find something. you\'re here for all of it.',
    tint: 'oklch(0.96 0.04 188)',
    border: 'oklch(0.78 0.10 188)',
    color: 'oklch(0.36 0.14 188)',
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

function getDietaryProfile() {
  try {
    return JSON.parse(localStorage.getItem('drop_dietary') || 'null')
  } catch {
    return null
  }
}

export default function Profile({ userId, onNextDrop, onUpdateTaste, onBackToDrop, hasDrop, loading }) {
  const [brands, setBrands] = useState([])
  const [summary, setSummary] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const dietary = getDietaryProfile()

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

  const topTags = (() => {
    const counts = {}
    wanted.forEach((b) => (b.tags || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t)
  })()

  const topSkipTags = (() => {
    const counts = {}
    passed.forEach((b) => (b.tags || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1 }))
    const topTagSet = new Set(topTags)
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .filter(([t]) => !topTagSet.has(t))
      .slice(0, 3)
      .map(([t]) => t)
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
            <div
              className="profile-persona"
              style={{ background: personaData.tint, borderColor: personaData.border }}
            >
              <h1 className="persona-label" style={{ color: personaData.color }}>{personaData.label}</h1>
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

              {topTags.length > 0 && (
                <div className="superlative-insight">
                  <span className="superlative-insight-label">you always come back to</span>
                  <div className="superlative-insight-tags">
                    {topTags.map((t) => <span key={t} className={`brand-tag ${tagColorClass(t)}`}>{t}</span>)}
                  </div>
                </div>
              )}
              {topSkipTags.length > 0 && (
                <div className="superlative-insight">
                  <span className="superlative-insight-label">you consistently skip</span>
                  <div className="superlative-insight-tags">
                    {topSkipTags.map((t) => <span key={t} className={`brand-tag ${tagColorClass(t)}`}>{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dietary + Goals */}
          {dietary && (dietary.restrictions?.length > 0 || dietary.goals?.length > 0) && (
            <div className="profile-dietary">
              {dietary.restrictions?.length > 0 && (
                <div className="profile-dietary-row">
                  <span className="profile-dietary-label">dietary</span>
                  <div className="profile-dietary-tags">
                    {dietary.restrictions.map((r) => (
                      <span key={r} className="brand-tag brand-tag--dietary">{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {dietary.goals?.length > 0 && (
                <div className="profile-dietary-row">
                  <span className="profile-dietary-label">goals</span>
                  <div className="profile-dietary-tags">
                    {dietary.goals.map((g) => (
                      <span key={g} className="brand-tag brand-tag--goal">{g}</span>
                    ))}
                  </div>
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
                            {brand.reaction === 'want' ? 'want' : brand.reaction === 'maybe' ? 'maybe' : 'pass'}
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
