import { useState } from 'react'
import BrandCard from '../components/BrandCard'
import { submitRankings, submitRejections, trackClick } from '../api/recommendations'

export default function Drop({ brands, userId, onRankingsSubmitted }) {
  const [reactions, setReactions] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function handleReact(brandId, reaction) {
    setReactions((prev) => ({ ...prev, [brandId]: reaction }))
  }

  async function handleNextDrop() {
    setSubmitting(true)
    const rankPayload = brands
      .filter((b) => reactions[b.id] === 'want' || reactions[b.id] === 'maybe')
      .map((b) => ({ brand_id: b.id, rank: reactions[b.id] === 'want' ? 1 : 2 }))
    const rejectPayload = brands
      .filter((b) => reactions[b.id] === 'no')
      .map((b) => b.id)

    await Promise.all([
      rankPayload.length ? submitRankings(rankPayload, userId) : Promise.resolve(),
      rejectPayload.length ? submitRejections(rejectPayload, userId) : Promise.resolve(),
    ])
    onRankingsSubmitted()
  }

  return (
    <div className="page drop-page">
      <div className="drop-header">
        <h2>Your Drop</h2>
        <p className="drop-subtitle">React to each brand to improve your next drop.</p>
      </div>
      <div className="brand-grid">
        {brands.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={brand}
            reaction={reactions[brand.id] || null}
            onReact={handleReact}
            onVisit={() => trackClick(brand.id, userId)}
          />
        ))}
      </div>
      <div className="drop-actions">
        <button
          className="submit-btn"
          onClick={handleNextDrop}
          disabled={submitting}
        >
          {submitting ? 'Saving…' : 'Get next drop →'}
        </button>
      </div>
    </div>
  )
}
