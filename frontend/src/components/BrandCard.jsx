export default function BrandCard({ brand, rank, onRank, rejected, onReject }) {
  return (
    <div className={`brand-card ${rank ? 'ranked' : ''} ${rejected ? 'rejected' : ''}`}>
      <div className="brand-image-wrap">
        {brand.image_url
          ? <img src={brand.image_url} alt={brand.name} className="brand-image" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          : <span className="brand-image-placeholder">{brand.name[0]}</span>
        }
      </div>
      <div className="brand-card-header">
        <h3>{brand.name}</h3>
        <div className="brand-card-meta">
          {brand.url && (
            <a href={brand.url} target="_blank" rel="noopener noreferrer" className="brand-link">
              Visit →
            </a>
          )}
          <span className="match-score">{Math.round(brand.match_score * 100)}% match</span>
        </div>
      </div>
      {brand.tags?.length > 0 && (
        <div className="brand-tags">
          {brand.tags.map((tag) => (
            <span key={tag} className="brand-tag">{tag}</span>
          ))}
        </div>
      )}
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
