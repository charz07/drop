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
    question: "Anything you've been into lately?",
    placeholder: 'e.g. Fly By Jing chili crisp, Olipop, anything fermented…',
  },
]

const SURPRISE_DESCRIPTION = "I'm open to everything — adventurous and curious, no strong preferences. Surprise me with something interesting."

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

  const result = parts.join('. ')
  return result ? result + '.' : SURPRISE_DESCRIPTION
}

export default function TasteInput({ onSubmit, loading }) {
  const [mode, setMode] = useState('splash')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const q = QUESTIONS[step]
  const currentAnswer = answers[q?.id]
  const isLastStep = step === QUESTIONS.length - 1

  const hasAnswer = q?.type === 'text'
    ? !!currentAnswer?.trim()
    : q?.multi
      ? (currentAnswer?.length > 0)
      : !!currentAnswer

  function getButtonLabel() {
    if (loading) return 'Finding your drop…'
    if (isLastStep) return hasAnswer ? 'Get my drop →' : 'Skip →'
    return hasAnswer ? 'Next →' : 'Skip →'
  }

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

  function handleBack() {
    if (step > 0) {
      setStep(step - 1)
    } else {
      setMode('splash')
    }
  }

  function handleSurprise() {
    onSubmit(SURPRISE_DESCRIPTION)
  }

  if (mode === 'splash') {
    return (
      <div className="page taste-input-page splash-page">
        <h1 className="app-title">Drop</h1>
        <p className="splash-tagline">Discover emerging food and drink brands matched to your taste.</p>
        <button type="button" className="submit-btn" onClick={() => setMode('quiz')} disabled={loading}>
          Find my brands →
        </button>
        <button type="button" className="profile-link" onClick={handleSurprise} disabled={loading}>
          Surprise me →
        </button>
      </div>
    )
  }

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
          disabled={loading}
        >
          {getButtonLabel()}
        </button>
        <div className="quiz-footer-row">
          <button type="button" className="quiz-back-btn" onClick={handleBack} disabled={loading}>
            ← Back
          </button>
          {step === 0 && (
            <button type="button" className="quiz-surprise-btn" onClick={handleSurprise} disabled={loading}>
              Surprise me →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
