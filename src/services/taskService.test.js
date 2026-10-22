import { describe, expect, it } from 'vitest'
import { createInitialData } from './storageService'
import { addTask, deleteCategory, deleteTask, restoreTask, setTaskStatus, updateTask } from './taskService'

describe('CRUD de tarefas', () => {
  it('não salva tarefa sem título', () => {
    const result = addTask(createInitialData(), { title: '   ' })
    expect(result.ok).toBe(false)
  })

  it('cria, edita e preserva o identificador', () => {
    const created = addTask(createInitialData(), {
      title: 'Estudar React',
      priority: 'alta',
      status: 'pendente',
    })
    const taskId = created.task.id
    const createdAt = created.task.createdAt
    const updated = updateTask(created.data, taskId, {
      title: 'Estudar React e Vite',
      priority: 'urgente',
      status: 'em_andamento',
    })
    expect(updated.ok).toBe(true)
    expect(updated.task.id).toBe(taskId)
    expect(updated.task.createdAt).toBe(createdAt)
    expect(updated.task.priority).toBe('urgente')
    expect(updated.task.status).toBe('em_andamento')
    expect(updated.data.tasks).toHaveLength(1)
  })

  it('conclui registrando data e reabre removendo a data', () => {
    const created = addTask(createInitialData(), { title: 'Revisar código', status: 'pendente' })
    const completed = setTaskStatus(created.data, created.task.id, 'concluida')
    expect(completed.tasks[0].status).toBe('concluida')
    expect(completed.tasks[0].completedAt).toBeTruthy()
    const reopened = setTaskStatus(completed, created.task.id, 'pendente')
    expect(reopened.tasks[0].status).toBe('pendente')
    expect(reopened.tasks[0].completedAt).toBeNull()
  })

  it('alterar prioridade não altera o status', () => {
    const created = addTask(createInitialData(), {
      title: 'Enviar relatório',
      priority: 'media',
      status: 'em_andamento',
    })
    const updated = updateTask(created.data, created.task.id, {
      title: 'Enviar relatório',
      priority: 'urgente',
      status: 'em_andamento',
    })
    expect(updated.task.status).toBe('em_andamento')
    expect(updated.task.priority).toBe('urgente')
  })

  it('exclui somente a tarefa selecionada e permite restaurar', () => {
    let data = createInitialData()
    data = addTask(data, { title: 'Uma' }).data
    data = addTask(data, { title: 'Duas' }).data
    const removedId = data.tasks[0].id
    const remainingId = data.tasks[1].id
    const deleted = deleteTask(data, removedId)
    expect(deleted.data.tasks.map((item) => item.id)).toEqual([remainingId])
    const restored = restoreTask(deleted.data, deleted.task)
    expect(restored.tasks).toHaveLength(2)
  })
})

describe('categorias', () => {
  it('remove a associação sem excluir as tarefas', () => {
    let data = createInitialData()
    const categoryId = data.categories[0].id
    data = addTask(data, { title: 'Tarefa de trabalho', categoryId }).data
    const next = deleteCategory(data, categoryId)
    expect(next.categories.find((item) => item.id === categoryId)).toBeUndefined()
    expect(next.tasks[0].title).toBe('Tarefa de trabalho')
    expect(next.tasks[0].categoryId).toBeNull()
  })
})
