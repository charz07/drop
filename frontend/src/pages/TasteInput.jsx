import { useState } from 'react'

const QUESTIONS = [
  {
    id: 'intensity',
    question: 'How do you like your flavors?',
    options: ['Subtle & delicate', 'Balanced', 'Bold & intense'],
  },
  {
    id: 'profile',
    question: 'What draws you in?',
    options: ['Sweet', 'Savory & umami', 'Tangy & acidic', 'Spicy & complex'],
    multi: true,
  },
  {
    id: 'heat',
    question: 'How do you feel about heat?',
    options: ['No spice', 'Mild warmth', 'Bring the heat'],
  },
  {
    id: 'texture',
    question: 'Textures you love?',
    options: ['Crunchy & crispy', 'Creamy & smooth', 'Chewy', 'Light & airy'],
    multi: true,
  },
  {
    id: 'vibe',
    question: 'What describes your food philosophy?',
    options: ['Clean & simple', 'Functional & healthy', 'Adventurous & global', 'Indulgent & rich', 'Fermented & complex'],
    multi: true,
  },
  {
    id: 'recent',
    type: 'text',
    question: "What's something delicious you ate or drank recently? What are your go-to brands or products?",
    placeholder: 'e.g. Had amazing Fly By Jing chili crisp lately, love Olipop and anything fermented...',
  },
]

function synthesize(answers) {
  const parts = []

  const intensityMap = {
    'Subtle & delicate': 'subtle, delicate',
    'Balanced': 'balanced',
    'Bold & intense': 'bold, intense',
  }
  if (answers.intensity) parts.push(`I gravitate toward ${intensityMap[answers.intensity]} flavors`)

  if (answers.profile?.length) {
    const profiles = answers.profile.map((p) => p.toLowerCase())
    parts.push(`with a strong pull toward ${profiles.join(' and ')}`)
  }

  const heatMap = {
    'No spice': 'I prefer no heat at all',
    'Mild warmth': 'I enjoy mild warmth but not aggressive heat',
    'Bring the heat': 'I love bold, building spice',
  }
  if (answers.heat) parts.push(heatMap[answers.heat])

  if (answers.texture?.length) {
    const textures = answers.texture.map((t) => t.toLowerCase())
    parts.push(`${textures.join(' and ')} textures appeal to me`)
  }

  if (answers.vibe?.length) {
    const vibes = answers.vibe.map((v) => v.toLowerCase())
    parts.push(`My food philosophy leans ${vibes.join(', ')}`)
  }

  if (answers.recent?.trim()) {
    parts.push(answers.recent.trim())
  }

  return parts.join('. ') + '.'
}

export default function TasteInput({ onSubmit, loading, savedTaste }) {
  const [mode, setMode] = useState(savedTaste ? 'text' : 'quiz')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [text, setText] = useState(savedTaste || '')

  function handleOption(questionId, option, multi) {
    setAnswers((prev) => {
      if (multi) {
        const current = prev[questionId] || []
        const next = current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option]
        return { ...prev, [questionId]: next }
      }
      return { ...prev, [questionId]: option }
    })
  }

  function handleNext() {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      onSubmit(synthesize(answers))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (text.trim()) onSubmit(text.trim())
  }

  const q = QUESTIONS[step]
  const currentAnswer = answers[q?.id]
  const canAdvance = q?.type === 'text' ? true : q?.multi ? (currentAnswer?.length > 0) : !!currentAnswer

  if (mode === 'quiz') {
    return (
      <div className="page taste-input-page">
        <h1 className="app-title">Drop</h1>
        <div className="quiz-progress">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`quiz-pip ${i <= step ? 'active' : ''}`} />
          ))}
        </div>
        <p className="quiz-question">{q.question}</p>
        {q.multi && <p className="quiz-multiselect-hint">Select all that apply</p>}
        {q.type === 'text' ? (
          <textarea
            className="taste-textarea quiz-textarea"
            placeholder={q.placeholder}
            value={currentAnswer || ''}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            rows={4}
          />
        ) : (
          <div className="quiz-options">
            {q.options.map((opt) => {
              const selected = q.multi
                ? (currentAnswer || []).includes(opt)
                : currentAnswer === opt
              return (
                <button
                  key={opt}
                  type="button"
                  className={`quiz-option ${selected ? 'selected' : ''}`}
                  onClick={() => handleOption(q.id, opt, q.multi)}
                >
                  {q.multi && selected && <span className="quiz-check">✓ </span>}{opt}
                </button>
              )
            })}
          </div>
        )}
        <div className="quiz-footer">
          <button
            type="button"
            className="submit-btn"
            onClick={handleNext}
            disabled={!canAdvance}
          >
            {step < QUESTIONS.length - 1 ? 'Next →' : 'Get my drop →'}
          </button>
          <button type="button" className="profile-link" onClick={() => setMode('text')}>
            Skip quiz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page taste-input-page">
      <h1 className="app-title">Drop</h1>
      <p className="app-subtitle">Get matched to brands you'll love.</p>
      <form onSubmit={handleSubmit} className="taste-form">
        <textarea
          className="taste-textarea"
          placeholder="What's something delicious you ate or drank recently? What are your go-to brands or products?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          disabled={loading}
        />
        <button type="submit" className="submit-btn" disabled={loading || !text.trim()}>
          {loading ? 'Finding your drop…' : 'Get my drop →'}
        </button>
      </form>
      <button type="button" className="profile-link" style={{ marginTop: '1rem' }} onClick={() => { setStep(0); setAnswers({}); setMode('quiz') }}>
        Retake quiz
      </button>
    </div>
  )
}
