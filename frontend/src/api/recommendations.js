const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function getRecommendations(tasteDescription, userId) {
  const res = await fetch(`${API_BASE}/recommendations/?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taste_description: tasteDescription }),
  })
  if (!res.ok) throw new Error('Failed to get recommendations')
  return res.json()
}

export async function submitRankings(rankings, userId) {
  const res = await fetch(`${API_BASE}/rankings/?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rankings }),
  })
  if (!res.ok) throw new Error('Failed to submit rankings')
  return res.json()
}

export async function getProfile(userId) {
  const res = await fetch(`${API_BASE}/profile/?user_id=${userId}`)
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}
