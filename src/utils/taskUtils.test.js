import { describe, expect, it } from 'vitest'
import { addDays, todayKey } from './dateUtils'
import {
  applyFilters,
  emptyFilters,
  getStats,
  getTodayGroups,
  getUpcomingTasks,
  isDuplicateCategory,
  isOverdue,
  overdueDays,
} from './taskUtils'

function task(partial) {
  return {
    id: partial.id || '1',
    title: partial.title || 'Tarefa',
    description: partial.description || '',
    categoryId: partial.categoryId || null,
    priority: partial.priority || 'media',
    status: partial.status || 'pendente',
    dueDate: partial.dueDate ?? null,
    dueTime: partial.dueTime || null,
    tags: partial.tags || [],
    subtasks: partial.subtasks || [],
    createdAt: partial.createdAt || '2026-01-01T00:00:00.000Z',
    updatedAt: partial.updatedAt || '2026-01-01T00:00:00.000Z',
    completedAt: partial.completedAt || null,
  }
}

describe('regras de atraso', () => {
  const today = '2026-10-22'

  it('marca como atrasada somente se vencida e não concluída', () => {
    expect(isOverdue(task({ dueDate: '2026-10-21', status: 'pendente' }), today)).toBe(true)
    expect(isOverdue(task({ dueDate: '2026-10-21', status: 'em_andamento' }), today)).toBe(true)
    expect(isOverdue(task({ dueDate: '2026-10-21', status: 'concluida' }), today)).toBe(false)
  })

  it('não classifica tarefa sem vencimento como atrasada', () => {
    expect(isOverdue(task({ dueDate: null, status: 'pendente' }), today)).toBe(false)
  })

  it('não classifica tarefa de hoje como atrasada', () => {
    expect(isOverdue(task({ dueDate: today, status: 'pendente' }), today)).toBe(false)
  })

  it('calcula os dias de atraso com datas locais', () => {
    expect(overdueDays(task({ dueDate: '2026-10-20', status: 'pendente' }), today)).toBe(2)
  })
})

describe('indicadores', () => {
  it('calcula totais sem misturar pendentes e concluídas', () => {
    const today = '2026-10-22'
    const stats = getStats(
      [
        task({ id: 'a', status: 'pendente' }),
        task({ id: 'b', status: 'em_andamento' }),
        task({ id: 'c', status: 'concluida' }),
        task({ id: 'd', status: 'pendente', dueDate: '2026-10-01' }),
      ],
      today,
    )
    expect(stats.total).toBe(4)
    expect(stats.pendentes).toBe(2)
    expect(stats.emAndamento).toBe(1)
    expect(stats.concluidas).toBe(1)
    expect(stats.atrasadas).toBe(1)
  })
})

describe('filtros combinados', () => {
  it('pesquisa e filtra prioridade e status juntos', () => {
    const categories = [{ id: 'cat-1', name: 'Trabalho' }]
    const tasks = [
      task({
        id: '1',
        title: 'Relatório mensal',
        priority: 'alta',
        status: 'pendente',
        categoryId: 'cat-1',
        tags: ['financeiro'],
      }),
      task({
        id: '2',
        title: 'Relatório antigo',
        priority: 'alta',
        status: 'concluida',
        categoryId: 'cat-1',
      }),
      task({
        id: '3',
        title: 'Relatório simples',
        priority: 'baixa',
        status: 'pendente',
        categoryId: 'cat-1',
      }),
    ]
    const result = applyFilters(tasks, categories, {
      ...emptyFilters(),
      query: 'relatório',
      priority: 'alta',
      status: 'pendente',
    })
    expect(result.map((item) => item.id)).toEqual(['1'])
  })
})

describe('páginas derivadas', () => {
  it('não inclui tarefas sem data nas próximas', () => {
    const today = todayKey()
    const tasks = [
      task({ id: '1', dueDate: addDays(today, 2) }),
      task({ id: '2', dueDate: null }),
      task({ id: '3', dueDate: addDays(today, -1) }),
    ]
    expect(getUpcomingTasks(tasks, 'all', today).map((item) => item.id)).toEqual(['1'])
  })

  it('separa atrasadas e tarefas de hoje', () => {
    const today = '2026-10-22'
    const groups = getTodayGroups(
      [
        task({ id: 'late', dueDate: '2026-10-20', status: 'pendente', priority: 'alta' }),
        task({ id: 'today', dueDate: today, status: 'pendente', priority: 'media' }),
        task({
          id: 'done',
          dueDate: today,
          status: 'concluida',
          completedAt: '2026-10-22T12:00:00.000Z',
        }),
      ],
      today,
    )
    expect(groups.overdue.map((item) => item.id)).toEqual(['late'])
    expect(groups.pendentes.map((item) => item.id)).toEqual(['today'])
    expect(groups.concluidasHoje.map((item) => item.id)).toEqual(['done'])
  })
})

describe('categorias', () => {
  it('detecta nomes duplicados ignorando maiúsculas e espaços', () => {
    const categories = [{ id: '1', name: 'Trabalho' }]
    expect(isDuplicateCategory(categories, '  TRABALHO ')).toBe(true)
    expect(isDuplicateCategory(categories, 'Estudos')).toBe(false)
  })
})
