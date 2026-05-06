export default function BrandCard({ brand, rank, onRank, rejected, onReject }) {
  return (
    <div className={`brand-card ${rank ? 'ranked' : ''} ${rejected ? 'rejected' : ''}`}>
      <div className="brand-card-header">
        <h3>{brand.name}</h3>
        <span className="match-score">{Math.round(brand.match_score * 100)}% match</span>
      </div>
      <p className="brand-description">{brand.description}</p>
      {!rejected && (
        <div className="rank-buttons">
          <span className="rank-label">Rank:</span>
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              className={`rank-btn ${rank === n ? 'active' : ''}`}
              onClick={() => onRank(brand.name, n)}
            >
              {n}
            </button>
          ))}
          <button type="button" className="reject-btn" onClick={() => onReject(brand.name)}>
            Not for me
          </button>
        </div>
      )}
      {rejected && (
        <div className="rejected-state">
          <span>Not for me</span>
          <button type="button" className="undo-btn" onClick={() => onReject(brand.name)}>
            Undo
          </button>
        </div>
      )}
    </div>
  )
}
