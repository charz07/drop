import { useEffect, useRef } from 'react'
import { tagColorClass } from '../utils/tagColor'

export default function BrandSheet({ brand, reaction, onReact, onClose }) {
  const sheetRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    closeRef.current?.focus()

    function onKey(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = Array.from(sheetRef.current.querySelectorAll(
          'button, a[href], input, [tabindex]:not([tabindex="-1"])'
        )).filter((el) => !el.disabled)
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus()
    }
  }, [onClose])

  if (!brand) return null

  return (
    <div className="brand-sheet-overlay" onClick={onClose}>
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-sheet-title"
        className="brand-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} className="brand-sheet-close" onClick={onClose} aria-label="Close">✕</button>

        {brand.image_url && (
          <div className="brand-sheet-image">
            <img src={brand.image_url} alt={brand.name} loading="lazy" />
          </div>
        )}

        <div className="brand-sheet-body">
          <h2 id="brand-sheet-title" className="brand-sheet-name">{brand.name}</h2>

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
                aria-pressed={reaction === key}
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
