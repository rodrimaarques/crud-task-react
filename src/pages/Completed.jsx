import { useState } from 'react'
import EmptyState from '../components/EmptyState'
import TaskList from '../components/TaskList'
import { formatDateTime, isoToDateKey } from '../utils/dateUtils'
import { applyFilters, emptyFilters, sortTasks } from '../utils/taskUtils'

export default function Completed({ data, actions }) {
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const completed = data.tasks.filter((task) => task.status === 'concluida')
  const filters = {
    ...emptyFilters(),
    query,
  }
  const filtered = sortTasks(
    applyFilters(completed, data.categories, filters).filter((task) => {
      const completedOn = isoToDateKey(task.completedAt)
      if (from && (!completedOn || completedOn < from)) return false
      if (to && (!completedOn || completedOn > to)) return false
      return true
    }),
    'criacao',
  )

  if (!completed.length) {
    return (
      <EmptyState
        title="Nenhuma tarefa concluída"
        message="Quando uma tarefa for finalizada, ela aparece aqui com a data de conclusão."
      />
    )
  }

  return (
    <>
      <div className="panel toolbar">
        <div className="field grow">
          <label htmlFor="completed-search">Pesquisar</label>
          <input
            id="completed-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Título, descrição, categoria ou tag"
          />
        </div>
        <div className="field">
          <label htmlFor="completed-from">De</label>
          <input id="completed-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="completed-to">Até</label>
          <input id="completed-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </div>
      </div>
      {filtered.length ? (
        <TaskList
          tasks={filtered}
          categories={data.categories}
          viewMode={data.settings.viewMode}
          renderExtra={(task) => (
            <p className="muted">Concluída em {formatDateTime(task.completedAt) || '—'}</p>
          )}
          {...actions}
        />
      ) : (
        <EmptyState title="Nenhum resultado" message="Nenhuma tarefa concluída corresponde à pesquisa ou ao período." />
      )}
    </>
  )
}
