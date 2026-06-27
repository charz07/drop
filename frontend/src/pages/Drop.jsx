import { useState, useEffect, useRef } from 'react'
import { submitRankings, submitRejections, trackClick } from '../api/recommendations'

export default function Drop({ brands, userId, onRankingsSubmitted, onViewProfile }) {
  const [dropState, setDropState] = useState('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reactions, setReactions] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const advanceTimer = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setDropState('brand'), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    return () => { if (advanceTimer.current) clearTimeout(advanceTimer.current) }
  }, [])

  function handleReact(brandId, key) {
    const current = reactions[brandId]
    const next = current === key ? null : key
    setReactions((prev) => ({ ...prev, [brandId]: next }))

    if (next !== null) {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
      advanceTimer.current = setTimeout(() => {
        if (currentIndex < brands.length - 1) {
          setCurrentIndex((i) => i + 1)
        } else {
          setDropState('complete')
        }
      }, 300)
    } else {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }

  function handleSkip() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    if (currentIndex < brands.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      setDropState('complete')
    }
  }

  async function submitReactions(then) {
    setSubmitting(true)
    setError(null)
    const rankPayload = brands
      .filter((b) => reactions[b.id] === 'want' || reactions[b.id] === 'maybe')
      .map((b) => ({ brand_id: b.id, rank: reactions[b.id] === 'want' ? 1 : 2 }))
    const rejectPayload = brands
      .filter((b) => reactions[b.id] === 'no')
      .map((b) => b.id)
    try {
      await Promise.all([
        rankPayload.length ? submitRankings(rankPayload, userId) : Promise.resolve(),
        rejectPayload.length ? submitRejections(rejectPayload, userId) : Promise.resolve(),
      ])
      then()
    } catch {
      setError('Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  if (dropState === 'intro') {
    return (
      <div className="drop-intro">
        <p className="drop-intro-text">your drop.</p>
      </div>
    )
  }

  if (dropState === 'complete') {
    return (
      <div className="page drop-complete">
        <p className="drop-complete-text">that's your drop.</p>
        {error && <p className="drop-error">{error}</p>}
        <button
          className="btn-primary"
          onClick={() => submitReactions(onViewProfile)}
          disabled={submitting}
        >
          {submitting ? 'Saving…' : 'See your profile'}
        </button>
        <button
          className="btn-ghost"
          onClick={() => submitReactions(onRankingsSubmitted)}
          disabled={submitting}
        >
          Get next drop
        </button>
      </div>
    )
  }

  const brand = brands[currentIndex]
  const reactionKey = reactions[brand.id] || null

  return (
    <div className="drop-page">
      <span className="drop-counter">{currentIndex + 1} of {brands.length}</span>

      <div key={brand.id} className="brand-screen">
        <div className="brand-screen-image">
          {brand.image_url
            ? (
              <img
                src={brand.image_url}
                alt={brand.name}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )
            : (
              <div className="brand-screen-placeholder">{brand.name[0]}</div>
            )
          }
        </div>

        <div className="brand-screen-body">
          <h2 className="brand-screen-name">{brand.name}</h2>
          {brand.description && (
            <p className="brand-screen-rationale">{brand.description}</p>
          )}
          {brand.tags?.length > 0 && (
            <div className="brand-screen-tags">
              {brand.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="brand-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="brand-screen-footer">
        <div className="reaction-buttons">
          {[
            { key: 'want', label: 'Want' },
            { key: 'maybe', label: 'Maybe' },
            { key: 'no', label: '✕' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`reaction-btn reaction-btn--${key} ${reactionKey === key ? 'active' : ''}`}
              onClick={() => handleReact(brand.id, key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="drop-skip" onClick={handleSkip}>
          skip
        </button>
      </div>
    </div>
  )
}
