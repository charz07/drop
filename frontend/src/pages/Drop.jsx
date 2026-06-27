import { useState, useEffect } from 'react'
import { submitRankings, submitRejections } from '../api/recommendations'
import BrandSheet from '../components/BrandSheet'

export default function Drop({ brands, userId, dropNum, reactions, onReact, submitted, onRankingsSubmitted, onViewProfile }) {
  const [boxState, setBoxState] = useState(submitted ? 'open' : 'idle')
  const [tappedId, setTappedId] = useState(null)
  const [sheetBrand, setSheetBrand] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (submitted) return
    const t1 = setTimeout(() => setBoxState('opening'), 120)
    const t2 = setTimeout(() => setBoxState('open'), 850)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  function handleCardTap(brandId) {
    setTappedId((prev) => (prev === brandId ? null : brandId))
  }

  function handleReact(brandId, key, e) {
    e?.stopPropagation()
    onReact(brandId, key)
    setTappedId(null)
    setSheetBrand(null)
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
  const lidOpen = boxState === 'opening' || boxState === 'open'
  const ratedCount = brands.filter((b) => reactions[b.id]).length
  const allRated = ratedCount === brands.length

  return (
    <div className="drop-box-page">
      <div className="drop-box-header">
        <span className="drop-num-label">drop {dropNum}</span>
        <p className="drop-value-tagline">rate each one — every drop gets sharper</p>
      </div>
      <div className="drop-box-scene">
        {isOpen && (
          <p className="drop-rate-hint">
            {allRated ? 'all rated.' : `${brands.length - ratedCount} left`}
          </p>
        )}
        <div className={`drop-box-outer${!submitted && boxState !== 'idle' ? ' opening' : ''}`}>

          {/* Lid */}
          <div className={`drop-box-lid${lidOpen ? ' open' : ''}`}>
            <span className="drop-box-lid-label">drop.</span>
          </div>

          {/* Box body */}
          <div className={`drop-box-body${isOpen ? ' open' : ''}`}>
            <div className="drop-box-interior">
              {brands.map((brand, i) => {
                const rxn = reactions[brand.id] || null
                return (
                  <div
                    key={brand.id}
                    tabIndex={isOpen ? 0 : -1}
                    aria-label={`${brand.name}${rxn ? ` — ${rxn === 'no' ? 'passed' : rxn}` : ''}`}
                    className={`brand-item${isOpen ? ' visible' : ''}${tappedId === brand.id ? ' brand-item--tapped' : ''}`}
                    style={{ '--stagger': i }}
                    onClick={() => handleCardTap(brand.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleCardTap(brand.id)
                      }
                    }}
                  >
                    <div className="brand-item-inner">

                      {/* Front: image + name */}
                      <div className="brand-item-front">
                        <div className="brand-item-image">
                          {brand.image_url
                            ? <img src={brand.image_url} alt={brand.name} onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            : <div className="brand-item-placeholder">{brand.name[0]}</div>
                          }
                        </div>
                        <div className="brand-item-front-label">
                          <span className="brand-item-name">{brand.name}</span>
                          <span className="brand-item-tap-hint" style={rxn ? { visibility: 'hidden' } : undefined}>
                            <span className="hint-hover">hover to flip</span>
                            <span className="hint-touch">tap to flip</span>
                          </span>
                        </div>
                        {rxn && (
                          <span className={`brand-item-rxn-stamp brand-item-rxn-stamp--${rxn}`}>
                            {rxn === 'no' ? 'pass' : rxn === 'maybe' ? 'maybe' : 'want'}
                          </span>
                        )}
                      </div>

                      {/* Back: info + reactions */}
                      <div className="brand-item-back">
                        <div className="brand-item-back-header">
                          <span className="brand-item-name">{brand.name}</span>
                          <button
                            type="button"
                            className="brand-item-more"
                            onClick={(e) => { e.stopPropagation(); setSheetBrand(brand) }}
                          >
                            more ↗
                          </button>
                        </div>
                        {brand.description && (
                          <span className="brand-item-desc">{brand.description}</span>
                        )}
                        <div className="brand-item-reactions">
                          {[
                            { key: 'want', label: 'want' },
                            { key: 'maybe', label: 'maybe' },
                            { key: 'no', label: 'pass' },
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              type="button"
                              aria-pressed={rxn === key}
                              className={`reaction-btn reaction-btn--${key} ${rxn === key ? 'active' : ''}`}
                              onClick={(e) => handleReact(brand.id, key, e)}
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

      <BrandSheet
        brand={sheetBrand}
        reaction={sheetBrand ? reactions[sheetBrand.id] || null : null}
        onReact={handleReact}
        onClose={() => setSheetBrand(null)}
      />

      {/* Footer */}
      <div className={`drop-box-footer ${isOpen ? 'visible' : ''}`}>
        {submitted ? (
          <button className="btn-primary" onClick={onViewProfile}>
            back to profile →
          </button>
        ) : (
          <>
            {error && <p className="drop-error">{error}</p>}
            <button
              className="btn-primary"
              onClick={() => handleContinue(onViewProfile)}
              disabled={submitting || !isOpen || !allRated}
            >
              {submitting ? 'saving…' : 'see your profile →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
