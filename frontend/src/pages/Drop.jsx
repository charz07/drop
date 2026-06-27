import { useState, useEffect } from 'react'
import { submitRankings, submitRejections } from '../api/recommendations'

export default function Drop({ brands, userId, onRankingsSubmitted, onViewProfile }) {
  const [boxState, setBoxState] = useState('closed')  // 'closed' | 'opening' | 'open'
  const [reactions, setReactions] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const t1 = setTimeout(() => setBoxState('opening'), 300)
    const t2 = setTimeout(() => setBoxState('open'), 1350)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  function handleReact(brandId, key) {
    setReactions((prev) => ({
      ...prev,
      [brandId]: prev[brandId] === key ? null : key,
    }))
  }

  async function handleContinue(then) {
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

  const isOpen = boxState === 'open'

  return (
    <div className="drop-box-page">
      <div className="drop-box-scene">
        <div className="drop-box-outer">

          {/* Lid */}
          <div className={`drop-box-lid ${boxState !== 'closed' ? 'open' : ''}`}>
            <span className="drop-box-lid-label">drop.</span>
          </div>

          {/* Box body */}
          <div className="drop-box-body">
            <div className={`drop-box-interior ${isOpen ? 'visible' : ''}`}>
              {brands.map((brand, i) => {
                const rxn = reactions[brand.id] || null
                return (
                  <div
                    key={brand.id}
                    className="brand-item"
                    style={{ '--stagger': i }}
                  >
                    <div className="brand-item-inner">

                      {/* Front: image + name */}
                      <div className="brand-item-front">
                        <div className="brand-item-image">
                          {brand.image_url
                            ? <img src={brand.image_url} alt={brand.name} onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            : <div className="brand-item-placeholder">{brand.name[0]}</div>
                          }
                          {rxn && (
                            <span className={`brand-item-rxn-stamp brand-item-rxn-stamp--${rxn}`}>
                              {rxn === 'no' ? '✕' : rxn}
                            </span>
                          )}
                        </div>
                        <div className="brand-item-front-label">
                          <span className="brand-item-name">{brand.name}</span>
                        </div>
                      </div>

                      {/* Back: info + reactions */}
                      <div className="brand-item-back">
                        <span className="brand-item-name">{brand.name}</span>
                        {brand.description && (
                          <span className="brand-item-desc">{brand.description}</span>
                        )}
                        {brand.tags && brand.tags.length > 0 && (
                          <div className="brand-item-tags">
                            {brand.tags.slice(0, 4).map((tag) => (
                              <span key={tag} className="brand-tag">{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="brand-item-reactions">
                          {[
                            { key: 'want', label: 'Want' },
                            { key: 'maybe', label: 'Maybe' },
                            { key: 'no', label: '✕' },
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              type="button"
                              className={`reaction-btn reaction-btn--${key} ${rxn === key ? 'active' : ''}`}
                              onClick={() => handleReact(brand.id, key)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className={`drop-box-footer ${isOpen ? 'visible' : ''}`}>
        {error && <p className="drop-error">{error}</p>}
        <button
          className="btn-primary"
          onClick={() => handleContinue(onRankingsSubmitted)}
          disabled={submitting || !isOpen}
        >
          {submitting ? 'Saving…' : 'Get next drop →'}
        </button>
        <button
          className="btn-ghost"
          onClick={() => handleContinue(onViewProfile)}
          disabled={submitting || !isOpen}
        >
          See your profile
        </button>
      </div>
    </div>
  )
}
