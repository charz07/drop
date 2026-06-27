import { useEffect } from 'react'
import { tagColorClass } from '../utils/tagColor'

export default function BrandSheet({ brand, reaction, onReact, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!brand) return null

  return (
    <div className="brand-sheet-overlay" onClick={onClose}>
      <div className="brand-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="brand-sheet-close" onClick={onClose} aria-label="Close">✕</button>

        {brand.image_url && (
          <div className="brand-sheet-image">
            <img src={brand.image_url} alt={brand.name} />
          </div>
        )}

        <div className="brand-sheet-body">
          <h2 className="brand-sheet-name">{brand.name}</h2>

          {brand.description && (
            <p className="brand-sheet-desc">{brand.description}</p>
          )}

          {brand.tags && brand.tags.length > 0 && (
            <div className="brand-sheet-tags">
              {brand.tags.map((tag) => (
                <span key={tag} className={`brand-tag ${tagColorClass(tag)}`}>{tag}</span>
              ))}
            </div>
          )}

          {brand.url && (
            <a
              className="brand-sheet-link"
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              visit site ↗
            </a>
          )}

          <div className="brand-sheet-reactions">
            {[
              { key: 'want', label: 'want' },
              { key: 'maybe', label: 'maybe' },
              { key: 'no', label: 'pass' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`reaction-btn reaction-btn--${key} ${reaction === key ? 'active' : ''}`}
                onClick={() => onReact(brand.id, key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
