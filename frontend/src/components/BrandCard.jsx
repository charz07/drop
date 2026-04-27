export default function BrandCard({ brand, rank, onRank }) {
  return (
    <div className={`brand-card ${rank ? 'ranked' : ''}`}>
      <div className="brand-card-header">
        <h3>{brand.name}</h3>
        <span className="match-score">{Math.round(brand.match_score * 100)}% match</span>
      </div>
      <p className="brand-description">{brand.description}</p>
      <div className="rank-buttons">
        <span className="rank-label">Rank:</span>
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            className={`rank-btn ${rank === n ? 'active' : ''}`}
            onClick={() => onRank(brand.name, n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
