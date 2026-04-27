import { useState } from 'react'

export default function TasteInput({ onSubmit, loading }) {
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (text.trim()) onSubmit(text.trim())
  }

  return (
    <div className="page taste-input-page">
      <h1 className="app-title">Drop</h1>
      <p className="app-subtitle">Describe your taste. Get matched to brands you'll love.</p>
      <form onSubmit={handleSubmit} className="taste-form">
        <textarea
          className="taste-textarea"
          placeholder="e.g. I love bold, spicy flavors with a hint of sweetness and fermented complexity..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          disabled={loading}
        />
        <button type="submit" className="submit-btn" disabled={loading || !text.trim()}>
          {loading ? 'Finding your drop…' : 'Get my drop →'}
        </button>
      </form>
    </div>
  )
}
