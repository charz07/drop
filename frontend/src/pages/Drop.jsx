import { useState, useEffect } from 'react'
import { submitRankings, submitRejections } from '../api/recommendations'
import BrandSheet from '../components/BrandSheet'
import { tagColorClass } from '../utils/tagColor'

export default function Drop({ brands, userId, dropNum, onRankingsSubmitted, onViewProfile }) {
  const [boxState, setBoxState] = useState('idle')  // 'idle' | 'opening' | 'open'
  const [reactions, setReactions] = useState({})
  const [tappedId, setTappedId] = useState(null)
  const [sheetBrand, setSheetBrand] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const t1 = setTimeout(() => setBoxState('opening'), 120)
    const t2 = setTimeout(() => setBoxState('open'), 850)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  function handleCardTap(brandId) {
    setTappedId((prev) => (prev === brandId ? null : brandId))
  }

  function handleReact(brandId, key, e) {
    e?.stopPropagation()
    setReactions((prev) => ({
      ...prev,
      [brandId]: prev[brandId] === key ? null : key,
    }))
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
      </div>
      <div className="drop-box-scene">
        {isOpen && (
          <p className="drop-rate-hint">
            {allRated ? 'all rated.' : `${brands.length - ratedCount} left — flip each card`}
          </p>
        )}
        <div className={`drop-box-outer${boxState !== 'idle' ? ' opening' : ''}`}>

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
                    className={`brand-item${isOpen ? ' visible' : ''}${tappedId === brand.id ? ' brand-item--tapped' : ''}`}
                    style={{ '--stagger': i }}
                    onClick={() => handleCardTap(brand.id)}
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
                        {brand.tags && brand.tags.length > 0 && (
                          <div className="brand-item-tags">
                            {brand.tags.slice(0, 4).map((tag) => (
                              <span key={tag} className={`brand-tag ${tagColorClass(tag)}`}>{tag}</span>
                            ))}
                          </div>
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
        {error && <p className="drop-error">{error}</p>}
        <button
          className="btn-primary"
          onClick={() => handleContinue(onViewProfile)}
          disabled={submitting || !isOpen || !allRated}
        >
          {submitting ? 'saving…' : 'see your profile →'}
        </button>
      </div>
    </div>
  )
}
