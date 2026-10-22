import { nowIso } from '../utils/dateUtils'
import { createId, isDuplicateCategory, normalizeCategoryName } from '../utils/taskUtils'

export function validateTaskInput(input) {
  const errors = {}
  const title = (input.title || '').trim()
  if (!title) errors.title = 'Informe um título para a tarefa.'
  if (input.dueTime && !input.dueDate) {
    errors.dueTime = 'Defina a data de vencimento para usar um horário.'
  }
  if (input.startDate && input.dueDate && input.dueDate < input.startDate) {
    errors.dueDate = 'A data de vencimento não pode ser anterior à data de início.'
  }
  return { ok: Object.keys(errors).length === 0, errors, title }
}

function buildSubtasks(subtasks) {
  return (subtasks || [])
    .filter((item) => item && item.title && item.title.trim())
    .map((item) => ({
      id: item.id || createId(),
      title: item.title.trim(),
      completed: Boolean(item.completed),
    }))
}

export function addTask(data, input) {
  const validation = validateTaskInput(input)
  if (!validation.ok) return { ok: false, errors: validation.errors }

  const now = nowIso()
  const task = {
    id: createId(),
    title: validation.title,
    description: (input.description || '').trim(),
    categoryId: input.categoryId || null,
    priority: input.priority || 'media',
    status: input.status || 'pendente',
    startDate: input.startDate || null,
    dueDate: input.dueDate || null,
    dueTime: input.dueTime || null,
    tags: input.tags || [],
    subtasks: buildSubtasks(input.subtasks),
    createdAt: now,
    updatedAt: now,
    completedAt: input.status === 'concluida' ? now : null,
  }

  return { ok: true, data: { ...data, tasks: [task, ...data.tasks] }, task }
}

export function updateTask(data, id, input) {
  const validation = validateTaskInput(input)
  if (!validation.ok) return { ok: false, errors: validation.errors }

  const now = nowIso()
  let updated = null
  const tasks = data.tasks.map((task) => {
    if (task.id !== id) return task
    updated = {
      ...task,
      title: validation.title,
      description: (input.description || '').trim(),
      categoryId: input.categoryId || null,
      priority: input.priority || task.priority,
      status: input.status || task.status,
      startDate: input.startDate || null,
      dueDate: input.dueDate || null,
      dueTime: input.dueTime || null,
      tags: input.tags || [],
      subtasks: buildSubtasks(input.subtasks),
      updatedAt: now,
      completedAt: input.status === 'concluida' ? task.completedAt || now : null,
    }
    return updated
  })

  if (!updated) return { ok: false, errors: { title: 'Tarefa não encontrada.' } }
  return { ok: true, data: { ...data, tasks }, task: updated }
}

export function deleteTask(data, id) {
  const task = data.tasks.find((item) => item.id === id)
  if (!task) return { ok: false, data, task: null }
  return {
    ok: true,
    data: { ...data, tasks: data.tasks.filter((item) => item.id !== id) },
    task,
  }
}

export function restoreTask(data, task) {
  if (!task) return data
  if (data.tasks.some((item) => item.id === task.id)) return data
  return { ...data, tasks: [task, ...data.tasks] }
}

export function setTaskStatus(data, id, status) {
  const now = nowIso()
  return {
    ...data,
    tasks: data.tasks.map((task) => {
      if (task.id !== id) return task
      return {
        ...task,
        status,
        completedAt: status === 'concluida' ? now : null,
        updatedAt: now,
      }
    }),
  }
}

export function toggleSubtask(data, taskId, subtaskId) {
  const now = nowIso()
  return {
    ...data,
    tasks: data.tasks.map((task) => {
      if (task.id !== taskId) return task
      return {
        ...task,
        updatedAt: now,
        subtasks: (task.subtasks || []).map((item) =>
          item.id === subtaskId ? { ...item, completed: !item.completed } : item,
        ),
      }
    }),
  }
}

export function addCategory(data, name) {
  const normalized = normalizeCategoryName(name)
  if (!normalized) return { ok: false, message: 'Informe um nome para a categoria.' }
  if (isDuplicateCategory(data.categories, normalized)) {
    return { ok: false, message: 'Já existe uma categoria com esse nome.' }
  }
  const category = { id: createId(), name: normalized }
  return { ok: true, data: { ...data, categories: [...data.categories, category] }, category }
}

export function updateCategory(data, id, name) {
  const normalized = normalizeCategoryName(name)
  if (!normalized) return { ok: false, message: 'Informe um nome para a categoria.' }
  if (isDuplicateCategory(data.categories, normalized, id)) {
    return { ok: false, message: 'Já existe uma categoria com esse nome.' }
  }
  return {
    ok: true,
    data: {
      ...data,
      categories: data.categories.map((item) => (item.id === id ? { ...item, name: normalized } : item)),
    },
  }
}

export function deleteCategory(data, id) {
  return {
    ...data,
    categories: data.categories.filter((item) => item.id !== id),
    tasks: data.tasks.map((task) =>
      task.categoryId === id ? { ...task, categoryId: null, updatedAt: nowIso() } : task,
    ),
  }
}

export function updateSettings(data, patch) {
  return {
    ...data,
    settings: { ...data.settings, ...patch },
  }
}
