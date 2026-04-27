import { useState } from 'react'
import BrandCard from '../components/BrandCard'
import { submitRankings } from '../api/recommendations'

export default function Drop({ brands, userId, onRestart }) {
  const [rankings, setRankings] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const allRanked = brands.length > 0 && Object.keys(rankings).length === brands.length

  function handleRank(brandName, rank) {
    setRankings((prev) => {
      const updated = Object.fromEntries(
        Object.entries(prev).filter(([, r]) => r !== rank)
      )
      return { ...updated, [brandName]: rank }
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    const payload = brands.map((brand) => ({
      brand_id: brand.id,
      rank: rankings[brand.name],
    }))
    await submitRankings(payload, userId)
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="page drop-page">
      <div className="drop-header">
        <h2>Your Drop</h2>
        <p className="drop-subtitle">Rank each brand to improve your next drop.</p>
      </div>
      <div className="brand-grid">
        {brands.map((brand) => (
          <BrandCard
            key={brand.name}
            brand={brand}
            rank={rankings[brand.name] || null}
            onRank={handleRank}
          />
        ))}
      </div>
      <div className="drop-actions">
        {!submitted && (
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!allRanked || submitting}
          >
            {submitting ? 'Saving…' : allRanked ? 'Submit rankings →' : `Rank all ${brands.length} brands to submit`}
          </button>
        )}
        {submitted && (
          <p className="ranked-msg">Rankings saved! Ready for your next drop.</p>
        )}
        <button className="restart-btn" onClick={onRestart}>
          ← Try a different taste
        </button>
      </div>
    </div>
  )
}
