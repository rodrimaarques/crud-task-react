import { createId, normalizeCategoryName } from '../utils/taskUtils'

export const STORAGE_KEY = 'taskflow-data'
export const STORAGE_VERSION = 1

const PRIORITIES = ['baixa', 'media', 'alta', 'urgente']
const STATUSES = ['pendente', 'em_andamento', 'concluida']
const THEMES = ['light', 'dark']
const VIEW_MODES = ['list', 'cards']

export function defaultCategories() {
  return [
    { id: 'cat-trabalho', name: 'Trabalho' },
    { id: 'cat-estudos', name: 'Estudos' },
    { id: 'cat-pessoal', name: 'Pessoal' },
    { id: 'cat-projetos', name: 'Projetos' },
    { id: 'cat-outros', name: 'Outros' },
  ]
}

export function defaultSettings() {
  return {
    theme: 'light',
    viewMode: 'list',
    confirmDelete: true,
  }
}

export function createInitialData() {
  return {
    version: STORAGE_VERSION,
    tasks: [],
    categories: defaultCategories(),
    settings: defaultSettings(),
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw == null || raw === '') {
      return { data: createInitialData(), error: null, isEmpty: true }
    }
    const parsed = JSON.parse(raw)
    return { data: sanitizeData(parsed), error: null, isEmpty: false }
  } catch (error) {
    console.error('Erro ao ler o armazenamento local:', error)
    return {
      data: createInitialData(),
      error: 'Não foi possível ler os dados salvos. Os registros originais não foram apagados.',
      isEmpty: false,
    }
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { ok: true }
  } catch (error) {
    console.error('Erro ao gravar o armazenamento local:', error)
    return { ok: false, message: 'Não foi possível salvar os dados no navegador.' }
  }
}

export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return { ok: true }
  } catch (error) {
    console.error('Erro ao limpar o armazenamento local:', error)
    return { ok: false, message: 'Não foi possível limpar os dados locais.' }
  }
}

export function sanitizeData(input) {
  const fallback = createInitialData()
  if (!input || typeof input !== 'object') return fallback

  const settings = sanitizeSettings(input.settings)
  const categories = sanitizeCategories(input.categories)
  const categoryIds = new Set(categories.map((item) => item.id))
  const tasks = sanitizeTasks(input.tasks, categoryIds)

  return {
    version: STORAGE_VERSION,
    tasks,
    categories,
    settings,
  }
}

function sanitizeSettings(settings) {
  const defaults = defaultSettings()
  if (!settings || typeof settings !== 'object') return defaults
  return {
    theme: THEMES.includes(settings.theme) ? settings.theme : defaults.theme,
    viewMode: VIEW_MODES.includes(settings.viewMode) ? settings.viewMode : defaults.viewMode,
    confirmDelete: typeof settings.confirmDelete === 'boolean' ? settings.confirmDelete : defaults.confirmDelete,
  }
}

function sanitizeCategories(categories) {
  if (!Array.isArray(categories)) return defaultCategories()
  const seen = new Set()
  const result = []
  for (const item of categories) {
    if (!item || typeof item !== 'object') continue
    const name = normalizeCategoryName(item.name)
    const id = typeof item.id === 'string' && item.id.trim() ? item.id : createId()
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key) || seen.has(id)) continue
    seen.add(key)
    seen.add(id)
    result.push({ id, name })
  }
  return result
}

function sanitizeTasks(tasks, categoryIds) {
  if (!Array.isArray(tasks)) return []
  const seen = new Set()
  const result = []
  for (const item of tasks) {
    const task = normalizeTask(item, categoryIds)
    if (!task || seen.has(task.id)) continue
    seen.add(task.id)
    result.push(task)
  }
  return result
}

export function normalizeTask(item, categoryIds) {
  if (!item || typeof item !== 'object') return null
  if (typeof item.id !== 'string' || !item.id.trim()) return null
  if (typeof item.title !== 'string' || !item.title.trim()) return null

  const categoryId =
    typeof item.categoryId === 'string' && categoryIds.has(item.categoryId) ? item.categoryId : null

  return {
    id: item.id,
    title: item.title.trim(),
    description: typeof item.description === 'string' ? item.description : '',
    categoryId,
    priority: PRIORITIES.includes(item.priority) ? item.priority : 'media',
    status: STATUSES.includes(item.status) ? item.status : 'pendente',
    startDate: validDate(item.startDate),
    dueDate: validDate(item.dueDate),
    dueTime: validTime(item.dueTime),
    tags: Array.isArray(item.tags)
      ? item.tags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim())
      : [],
    subtasks: sanitizeSubtasks(item.subtasks),
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : '',
    completedAt: item.status === 'concluida' && typeof item.completedAt === 'string' ? item.completedAt : null,
  }
}

function sanitizeSubtasks(subtasks) {
  if (!Array.isArray(subtasks)) return []
  return subtasks
    .filter((item) => item && typeof item === 'object' && typeof item.title === 'string' && item.title.trim())
    .map((item) => ({
      id: typeof item.id === 'string' && item.id.trim() ? item.id : createId(),
      title: item.title.trim(),
      completed: Boolean(item.completed),
    }))
}

function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function validTime(value) {
  return typeof value === 'string' && /^\d{2}:\d{2}$/.test(value) ? value : null
}

export function parseImportFile(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, message: 'O arquivo não é um JSON válido.' }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, message: 'O arquivo não tem o formato exportado pelo TaskFlow.' }
  }

  const hasTasks = Array.isArray(parsed.tasks)
  const hasCategories = Array.isArray(parsed.categories)
  if (!hasTasks && !hasCategories) {
    return { ok: false, message: 'O arquivo precisa conter as listas de tarefas e categorias.' }
  }

  const data = sanitizeData({
    tasks: hasTasks ? parsed.tasks : [],
    categories: hasCategories ? parsed.categories : [],
    settings: parsed.settings,
  })

  return {
    ok: true,
    data,
    taskCount: data.tasks.length,
    categoryCount: data.categories.length,
  }
}

export function mergeImportedData(current, incoming) {
  const categories = [...current.categories]
  const categoryIds = new Set(categories.map((item) => item.id))
  const categoryNames = new Set(categories.map((item) => item.name.toLowerCase()))

  for (const category of incoming.categories) {
    if (categoryIds.has(category.id)) {
      const index = categories.findIndex((item) => item.id === category.id)
      categories[index] = category
      continue
    }
    if (categoryNames.has(category.name.toLowerCase())) continue
    categories.push(category)
    categoryIds.add(category.id)
    categoryNames.add(category.name.toLowerCase())
  }

  const tasks = [...current.tasks]
  const taskIds = new Set(tasks.map((item) => item.id))
  let updated = 0
  let added = 0

  for (const task of incoming.tasks) {
    const normalized = normalizeTask(task, categoryIds)
    if (!normalized) continue
    if (taskIds.has(normalized.id)) {
      const index = tasks.findIndex((item) => item.id === normalized.id)
      tasks[index] = normalized
      updated += 1
    } else {
      tasks.unshift(normalized)
      taskIds.add(normalized.id)
      added += 1
    }
  }

  return {
    data: {
      ...current,
      tasks,
      categories,
    },
    added,
    updated,
  }
}

export function buildExportPayload(data) {
  return JSON.stringify(
    {
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      tasks: data.tasks,
      categories: data.categories,
      settings: data.settings,
    },
    null,
    2,
  )
}
