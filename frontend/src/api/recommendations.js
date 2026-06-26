const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function getRecommendations(tasteDescription, userId) {
  const res = await fetch(`${API_BASE}/recommendations/?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taste_description: tasteDescription }),
  })
  if (res.status === 409) throw new Error('catalog_exhausted')
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

export async function submitRejections(brandIds, userId) {
  if (!brandIds.length) return
  const res = await fetch(`${API_BASE}/rejections/?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brand_ids: brandIds }),
  })
  if (!res.ok) throw new Error('Failed to submit rejections')
  return res.json()
}

export function trackClick(brandId, userId) {
  fetch(`${API_BASE}/analytics/click?user_id=${userId}&brand_id=${brandId}`, { method: 'POST' })
    .catch(() => {})
}
