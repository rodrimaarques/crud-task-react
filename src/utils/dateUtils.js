export function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayKey() {
  return toDateKey(new Date())
}

export function parseDateKey(key) {
  if (!key || typeof key !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return date
}

export function addDays(key, amount) {
  const date = parseDateKey(key)
  if (!date) return null
  date.setDate(date.getDate() + amount)
  return toDateKey(date)
}

export function startOfWeek(key) {
  const date = parseDateKey(key)
  if (!date) return null
  const weekday = date.getDay()
  const diff = weekday === 0 ? 6 : weekday - 1
  date.setDate(date.getDate() - diff)
  return toDateKey(date)
}

export function endOfWeek(key) {
  const start = startOfWeek(key)
  return addDays(start, 6)
}

export function daysBetween(fromKey, toKey) {
  const from = parseDateKey(fromKey)
  const to = parseDateKey(toKey)
  if (!from || !to) return 0
  return Math.round((to.getTime() - from.getTime()) / 86400000)
}

export function formatDate(key) {
  const date = parseDateKey(key)
  if (!date) return ''
  return date.toLocaleDateString('pt-BR')
}

export function formatDateLong(key) {
  const date = parseDateKey(key)
  if (!date) return ''
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function formatDateTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isoToDateKey(iso) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return toDateKey(date)
}

export function nowIso() {
  return new Date().toISOString()
}
