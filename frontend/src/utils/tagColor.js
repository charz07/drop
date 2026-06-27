const NUM_COLORS = 6

export function tagColorClass(tag) {
  let h = 0
  for (let i = 0; i < tag.length; i++) {
    h = (Math.imul(31, h) + tag.charCodeAt(i)) | 0
  }
  return `brand-tag--c${Math.abs(h) % NUM_COLORS}`
}
