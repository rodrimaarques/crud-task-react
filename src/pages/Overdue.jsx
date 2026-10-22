import EmptyState from '../components/EmptyState'
import TaskList from '../components/TaskList'
import { isOverdue, overdueDays, sortTasks } from '../utils/taskUtils'

export default function Overdue({ data, onCreate, actions }) {
  const tasks = sortTasks(
    data.tasks.filter((task) => isOverdue(task)),
    'vencimento',
  )

  if (!tasks.length) {
    return (
      <EmptyState
        title="Nenhuma tarefa atrasada"
        message="Tudo em dia. As tarefas concluídas nunca aparecem nesta lista."
        actionLabel="Ver todas as tarefas"
        onAction={onCreate}
      />
    )
  }

  return (
    <TaskList
      tasks={tasks}
      categories={data.categories}
      viewMode={data.settings.viewMode}
      renderExtra={(task) => {
        const days = overdueDays(task)
        return (
          <p className="muted">
            {days} {days === 1 ? 'dia' : 'dias'} de atraso
          </p>
        )
      }}
      {...actions}
    />
  )
}
