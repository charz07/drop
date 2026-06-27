import { useState, useEffect, useRef } from 'react'
import { sendChatMessage } from '../api/recommendations'

const OPENING = "hi! welcome to drop 👋 i'm here to match you with emerging food and drink brands you'll actually love. tell me about your taste, i'll put together a box of 4 — rate them, and the next drop gets sharper. first up: what have you been eating and drinking a lot of lately?"
const SURPRISE = "open to everything — adventurous and curious, no strong preferences. surprise me with something interesting and emerging."

export default function TasteInput({ onSubmit, loading, skipSplash }) {
  const [mode, setMode] = useState(skipSplash ? 'chat' : 'splash')
  const [messages, setMessages] = useState([{ role: 'assistant', content: OPENING }])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [done, setDone] = useState(false)
  const [tasteDescription, setTasteDescription] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  useEffect(() => {
    if (mode === 'chat') inputRef.current?.focus()
  }, [mode])

  async function handleSend() {
    const text = input.trim()
    if (!text || thinking || done) return

    const userMsg = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setThinking(true)

    try {
      const res = await sendChatMessage(next)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.message }])
      if (res.done) {
        setDone(true)
        setTasteDescription(res.taste_description)
        if (res.dietary_profile) {
          localStorage.setItem('drop_dietary', JSON.stringify(res.dietary_profile))
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'something went wrong. try again?' }])
    } finally {
      setThinking(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  if (mode === 'splash') {
    return (
      <div className="page taste-input-page splash-page">
        <h1 className="app-title">drop.</h1>
        <p className="splash-tagline">taste-matched brands, dropped to you.</p>
        <button type="button" className="btn-primary" onClick={() => setMode('chat')} disabled={loading}>
          find my taste →
        </button>
      </div>
    )
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <span className="chat-brand-label">drop.</span>
      </div>
      <div className="chat-messages">
        {messages.map((m, i) =>
          m.role === 'assistant' ? (
            <div key={i} className="chat-assistant-row">
              <div className="chat-avatar">d.</div>
              <div className="chat-bubble chat-bubble--assistant">{m.content}</div>
            </div>
          ) : (
            <div key={i} className="chat-bubble chat-bubble--user">{m.content}</div>
          )
        )}
        {thinking && (
          <div className="chat-assistant-row">
            <div className="chat-avatar">d.</div>
            <div className="chat-bubble chat-bubble--assistant chat-bubble--thinking">
              <span className="chat-dot" />
              <span className="chat-dot" />
              <span className="chat-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-footer">
        {done ? (
          <button className="btn-primary" onClick={() => onSubmit(tasteDescription)} disabled={loading}>
            {loading ? 'finding your drop.' : 'see my drop →'}
          </button>
        ) : (
          <>
            <div className="chat-input-row">
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder="type here…"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={thinking}
              />
              <button
                type="button"
                className="chat-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || thinking}
              >
                →
              </button>
            </div>
            <button
              type="button"
              className="chat-surprise-btn"
              onClick={() => onSubmit(SURPRISE)}
              disabled={loading || thinking}
            >
              surprise me (skip quiz)
            </button>
          </>
        )}
      </div>
    </div>
  )
}
