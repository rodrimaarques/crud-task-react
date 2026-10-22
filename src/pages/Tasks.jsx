import { useState } from 'react'
import EmptyState from '../components/EmptyState'
import TaskFilters from '../components/TaskFilters'
import TaskList from '../components/TaskList'
import { applyFilters, emptyFilters, sortTasks } from '../utils/taskUtils'

export default function Tasks({ data, onCreate, actions }) {
  const [filters, setFilters] = useState(emptyFilters)

  if (!data.tasks.length) {
    return (
      <EmptyState
        title="Nenhuma tarefa cadastrada"
        message="Use o botão Nova tarefa para começar a organizar o seu dia."
        actionLabel="Nova tarefa"
        onAction={onCreate}
      />
    )
  }

  const filtered = sortTasks(applyFilters(data.tasks, data.categories, filters), filters.sortBy)

  return (
    <>
      <TaskFilters
        filters={filters}
        categories={data.categories}
        onChange={setFilters}
        onClear={() => setFilters(emptyFilters())}
      />
      {filtered.length ? (
        <TaskList tasks={filtered} categories={data.categories} viewMode={data.settings.viewMode} {...actions} />
      ) : (
        <EmptyState
          title="Nenhum resultado"
          message="Nenhuma tarefa corresponde à pesquisa e aos filtros atuais."
          actionLabel="Limpar filtros"
          onAction={() => setFilters(emptyFilters())}
        />
      )}
    </>
  )
}
