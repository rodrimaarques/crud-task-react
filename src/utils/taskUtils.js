import { addDays, daysBetween, endOfWeek, isoToDateKey, startOfWeek, todayKey } from './dateUtils'

export const PRIORITIES = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

export const STATUSES = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluida', label: 'Concluída' },
]

export const PRIORITY_RANK = {
  urgente: 0,
  alta: 1,
  media: 2,
  baixa: 3,
}

export function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getStatusLabel(status) {
  return STATUSES.find((item) => item.value === status)?.label || status
}

export function getPriorityLabel(priority) {
  return PRIORITIES.find((item) => item.value === priority)?.label || priority
}

export function isOverdue(task, today = todayKey()) {
  if (!task || task.status === 'concluida' || !task.dueDate) return false
  return task.dueDate < today
}

export function isDueOn(task, dateKey) {
  return Boolean(task?.dueDate && task.dueDate === dateKey)
}

export function isUpcoming(task, today = todayKey()) {
  return Boolean(task?.dueDate && task.dueDate > today)
}

export function overdueDays(task, today = todayKey()) {
  if (!isOverdue(task, today)) return 0
  return daysBetween(task.dueDate, today)
}

export function subtaskProgress(task) {
  const subtasks = task.subtasks || []
  const total = subtasks.length
  const done = subtasks.filter((item) => item.completed).length
  return { total, done }
}

export function getStats(tasks, today = todayKey()) {
  return {
    total: tasks.length,
    pendentes: tasks.filter((task) => task.status === 'pendente').length,
    emAndamento: tasks.filter((task) => task.status === 'em_andamento').length,
    concluidas: tasks.filter((task) => task.status === 'concluida').length,
    atrasadas: tasks.filter((task) => isOverdue(task, today)).length,
  }
}

export function getWeekSummary(tasks, today = todayKey()) {
  const start = startOfWeek(today)
  const end = endOfWeek(today)
  const concluidas = tasks.filter((task) => {
    if (task.status !== 'concluida' || !task.completedAt) return false
    const completedOn = isoToDateKey(task.completedAt)
    return completedOn && completedOn >= start && completedOn <= end
  }).length
  const pendentes = tasks.filter((task) => {
    if (task.status === 'concluida') return false
    if (!task.dueDate) return false
    return task.dueDate >= start && task.dueDate <= end
  }).length
  return { concluidas, pendentes, start, end }
}

export function getTodayGroups(tasks, today = todayKey()) {
  const overdue = []
  const pendentes = []
  const emAndamento = []
  const concluidasHoje = []

  for (const task of tasks) {
    if (isOverdue(task, today)) {
      overdue.push(task)
      continue
    }
    if (isDueOn(task, today) && task.status === 'pendente') {
      pendentes.push(task)
      continue
    }
    if (isDueOn(task, today) && task.status === 'em_andamento') {
      emAndamento.push(task)
      continue
    }
    if (task.status === 'concluida' && isoToDateKey(task.completedAt) === today) {
      concluidasHoje.push(task)
    }
  }

  return {
    overdue: sortByPriorityAndTime(overdue),
    pendentes: sortByPriorityAndTime(pendentes),
    emAndamento: sortByPriorityAndTime(emAndamento),
    concluidasHoje: sortByPriorityAndTime(concluidasHoje),
  }
}

export function getUpcomingTasks(tasks, range, today = todayKey()) {
  let limit = null
  if (range === '7') limit = addDays(today, 7)
  if (range === '30') limit = addDays(today, 30)

  const upcoming = tasks.filter((task) => {
    if (!isUpcoming(task, today)) return false
    if (limit && task.dueDate > limit) return false
    return true
  })

  return sortTasks(upcoming, 'vencimento')
}

export function groupByDueDate(tasks) {
  const groups = []
  const map = new Map()
  for (const task of tasks) {
    if (!task.dueDate) continue
    if (!map.has(task.dueDate)) {
      const group = { date: task.dueDate, tasks: [] }
      map.set(task.dueDate, group)
      groups.push(group)
    }
    map.get(task.dueDate).tasks.push(task)
  }
  return groups
}

export function categoryName(categories, categoryId) {
  if (!categoryId) return ''
  return categories.find((item) => item.id === categoryId)?.name || ''
}

export function applyFilters(tasks, categories, filters) {
  const query = (filters.query || '').trim().toLowerCase()
  const today = todayKey()

  return tasks.filter((task) => {
    if (query) {
      const haystack = [
        task.title,
        task.description,
        categoryName(categories, task.categoryId),
        ...(task.tags || []),
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    if (filters.status && task.status !== filters.status) return false
    if (filters.priority && task.priority !== filters.priority) return false
    if (filters.categoryId && task.categoryId !== filters.categoryId) return false
    if (filters.onlyOverdue && !isOverdue(task, today)) return false
    if (filters.onlyCompleted && task.status !== 'concluida') return false

    if (filters.period === 'hoje' && !isDueOn(task, today)) return false
    if (filters.period === 'semana') {
      const start = startOfWeek(today)
      const end = endOfWeek(today)
      if (!task.dueDate || task.dueDate < start || task.dueDate > end) return false
    }
    if (filters.period === 'mes') {
      if (!task.dueDate || task.dueDate.slice(0, 7) !== today.slice(0, 7)) return false
    }
    if (filters.periodFrom && (!task.dueDate || task.dueDate < filters.periodFrom)) return false
    if (filters.periodTo && (!task.dueDate || task.dueDate > filters.periodTo)) return false

    return true
  })
}

export function sortTasks(tasks, sortBy) {
  const copy = [...tasks]
  copy.sort((a, b) => {
    if (sortBy === 'vencimento') {
      if (!a.dueDate && !b.dueDate) return comparePriorityThenTitle(a, b)
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      return (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99')
    }
    if (sortBy === 'criacao') {
      return (b.createdAt || '').localeCompare(a.createdAt || '')
    }
    if (sortBy === 'prioridade') {
      return comparePriorityThenTitle(a, b)
    }
    if (sortBy === 'alfabetica') {
      return a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
    }
    return 0
  })
  return copy
}

export function sortByPriorityAndTime(tasks) {
  const copy = [...tasks]
  copy.sort((a, b) => {
    const rank = comparePriorityThenTitle(a, b)
    if (rank !== 0) return rank
    return (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99')
  })
  return copy
}

function comparePriorityThenTitle(a, b) {
  const rank = (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9)
  if (rank !== 0) return rank
  return a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
}

export function normalizeCategoryName(name) {
  return (name || '').trim().replace(/\s+/g, ' ')
}

export function isDuplicateCategory(categories, name, ignoreId = null) {
  const normalized = normalizeCategoryName(name).toLowerCase()
  if (!normalized) return false
  return categories.some(
    (item) => item.id !== ignoreId && normalizeCategoryName(item.name).toLowerCase() === normalized,
  )
}

export function emptyFilters() {
  return {
    query: '',
    status: '',
    priority: '',
    categoryId: '',
    period: '',
    periodFrom: '',
    periodTo: '',
    onlyOverdue: false,
    onlyCompleted: false,
    sortBy: 'vencimento',
  }
}

export function excerpt(text, length = 90) {
  const value = (text || '').trim()
  if (value.length <= length) return value
  return `${value.slice(0, length).trim()}…`
}
