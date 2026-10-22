import { describe, expect, it } from 'vitest'
import { mergeImportedData, parseImportFile, sanitizeData } from './storageService'

describe('armazenamento e importação', () => {
  it('mantém tarefas válidas quando há registros inválidos', () => {
    const result = sanitizeData({
      tasks: [
        { id: 'ok', title: 'Válida', status: 'pendente', priority: 'baixa' },
        { id: 'bad' },
        null,
      ],
      categories: [{ id: 'c1', name: 'Pessoal' }],
    })
    expect(result.tasks).toHaveLength(1)
    expect(result.tasks[0].id).toBe('ok')
    expect(result.categories[0].name).toBe('Pessoal')
  })

  it('rejeita JSON inválido na importação', () => {
    expect(parseImportFile('{nao-json').ok).toBe(false)
    expect(parseImportFile('[]').ok).toBe(false)
  })

  it('importa arquivo válido e informa as quantidades', () => {
    const payload = JSON.stringify({
      tasks: [{ id: 't1', title: 'Importada', status: 'pendente', priority: 'media' }],
      categories: [{ id: 'c1', name: 'Projetos' }],
    })
    const parsed = parseImportFile(payload)
    expect(parsed.ok).toBe(true)
    expect(parsed.taskCount).toBe(1)
    expect(parsed.categoryCount).toBe(1)
  })

  it('mescla identificadores duplicados sem perder os dados atuais se a entrada for vazia', () => {
    const current = sanitizeData({
      tasks: [{ id: 't1', title: 'Atual', status: 'pendente', priority: 'baixa' }],
      categories: [{ id: 'c1', name: 'Pessoal' }],
    })
    const merged = mergeImportedData(current, {
      tasks: [{ id: 't1', title: 'Importada', status: 'em_andamento', priority: 'alta' }],
      categories: [{ id: 'c1', name: 'Pessoal' }],
    })
    expect(merged.updated).toBe(1)
    expect(merged.data.tasks[0].title).toBe('Importada')
  })
})
