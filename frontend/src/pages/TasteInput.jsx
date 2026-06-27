import { useState } from 'react'

const SURPRISE = "open to everything — adventurous and curious, no strong preferences. surprise me with something interesting and emerging."

export default function TasteInput({ onSubmit, loading }) {
  const [mode, setMode] = useState('splash')
  const [text, setText] = useState('')

  const canSubmit = text.trim().length >= 10

  function handleSubmit() {
    if (canSubmit) onSubmit(text.trim())
  }

  function handleSurprise() {
    onSubmit(SURPRISE)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) handleSubmit()
  }

  if (mode === 'splash') {
    return (
      <div className="page taste-input-page splash-page">
        <h1 className="app-title">drop.</h1>
        <p className="splash-tagline">taste-matched brands, dropped to you.</p>
        <button type="button" className="btn-primary" onClick={() => setMode('intake')} disabled={loading}>
          find my taste →
        </button>
        <button type="button" className="btn-ghost" onClick={handleSurprise} disabled={loading}>
          surprise me
        </button>
      </div>
    )
  }

  return (
    <div className="page taste-input-page intake-page">
      <p className="intake-question">what have you been eating and drinking lately?</p>
      <textarea
        className="intake-textarea"
        placeholder={"e.g. Fly By Jing chili crisp, anything fermented, Japanese convenience store snacks — skip anything sweet or mainstream…"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={6}
        autoFocus
      />
      <div className="quiz-footer">
        <button
          type="button"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
        >
          {loading ? 'finding your drop.' : 'find my drop →'}
        </button>
        <div className="quiz-footer-row">
          <button type="button" className="quiz-back-btn" onClick={() => setMode('splash')} disabled={loading}>
            ← back
          </button>
        </div>
      </div>
    </div>
  )
}
