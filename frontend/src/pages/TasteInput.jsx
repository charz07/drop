import { useState, useEffect, useRef } from 'react'
import { sendChatMessage } from '../api/recommendations'

const OPENING = 'what have you been eating and drinking lately?'
const SURPRISE = "open to everything — adventurous and curious, no strong preferences. surprise me with something interesting and emerging."

export default function TasteInput({ onSubmit, loading }) {
  const [mode, setMode] = useState('splash')
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
        <button type="button" className="btn-ghost" onClick={() => onSubmit(SURPRISE)} disabled={loading}>
          surprise me
        </button>
      </div>
    )
  }

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>
            {m.content}
          </div>
        ))}
        {thinking && (
          <div className="chat-bubble chat-bubble--assistant chat-bubble--thinking">
            <span className="chat-dot" />
            <span className="chat-dot" />
            <span className="chat-dot" />
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
        )}
      </div>
    </div>
  )
}
