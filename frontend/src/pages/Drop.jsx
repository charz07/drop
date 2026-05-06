import { useState } from 'react'
import BrandCard from '../components/BrandCard'
import { submitRankings, submitRejections } from '../api/recommendations'

export default function Drop({ brands, userId, onRankingsSubmitted }) {
  const [rankings, setRankings] = useState({})
  const [rejections, setRejections] = useState(new Set())
  const [submitting, setSubmitting] = useState(false)

  const allResolved = brands.length > 0 &&
    brands.every((b) => rankings[b.name] !== undefined || rejections.has(b.name))

  function handleRank(brandName, rank) {
    setRejections((prev) => { const next = new Set(prev); next.delete(brandName); return next })
    setRankings((prev) => {
      const updated = Object.fromEntries(Object.entries(prev).filter(([, r]) => r !== rank))
      return { ...updated, [brandName]: rank }
    })
  }

  function handleReject(brandName) {
    if (rejections.has(brandName)) {
      setRejections((prev) => { const next = new Set(prev); next.delete(brandName); return next })
    } else {
      setRankings((prev) => { const next = { ...prev }; delete next[brandName]; return next })
      setRejections((prev) => new Set([...prev, brandName]))
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    const rankPayload = brands
      .filter((b) => rankings[b.name] !== undefined)
      .map((b) => ({ brand_id: b.id, rank: rankings[b.name] }))
    const rejectPayload = brands
      .filter((b) => rejections.has(b.name))
      .map((b) => b.id)

    await Promise.all([
      submitRankings(rankPayload, userId),
      submitRejections(rejectPayload, userId),
    ])
    onRankingsSubmitted()
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
            rejected={rejections.has(brand.name)}
            onReject={handleReject}
          />
        ))}
      </div>
      <div className="drop-actions">
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={!allResolved || submitting}
        >
          {submitting ? 'Saving…' : allResolved ? 'Submit →' : 'Rank or dismiss all brands to submit'}
        </button>
      </div>
    </div>
  )
}
