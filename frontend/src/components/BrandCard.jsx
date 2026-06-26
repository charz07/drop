export default function BrandCard({ brand, reaction, onReact }) {
  return (
    <div className={`brand-card ${reaction ? 'reacted' : ''}`}>
      <div className="brand-image-wrap">
        {brand.image_url
          ? <img src={brand.image_url} alt={brand.name} className="brand-image" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          : <span className="brand-image-placeholder">{brand.name[0]}</span>
        }
      </div>
      <div className="brand-card-body">
        <div className="brand-card-header">
          <h3>{brand.name}</h3>
          {brand.url && (
            <a href={brand.url} target="_blank" rel="noopener noreferrer" className="brand-link">
              Visit →
            </a>
          )}
        </div>
        {brand.tags?.length > 0 && (
          <div className="brand-tags">
            {brand.tags.map((tag) => (
              <span key={tag} className="brand-tag">{tag}</span>
            ))}
          </div>
        )}
        <p className="brand-description">{brand.description}</p>
        <div className="reaction-buttons">
          {[
            { key: 'want', label: 'Like' },
            { key: 'maybe', label: 'Maybe' },
            { key: 'no', label: 'Not for me' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`reaction-btn reaction-btn--${key} ${reaction === key ? 'active' : ''}`}
              onClick={() => onReact(brand.id, reaction === key ? null : key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
