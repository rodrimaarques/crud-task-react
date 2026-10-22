import EmptyState from '../components/EmptyState'
import TaskCard from '../components/TaskCard'
import { getTodayGroups } from '../utils/taskUtils'

function Group({ title, tasks, categories, actions }) {
  if (!tasks.length) return null
  return (
    <section className="group-block">
      <h3 className="section-title">{title}</h3>
      <div className="cards-list">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} categories={categories} {...actions} />
        ))}
      </div>
    </section>
  )
}

export default function Today({ data, onCreate, actions }) {
  const groups = getTodayGroups(data.tasks)
  const hasItems =
    groups.overdue.length || groups.pendentes.length || groups.emAndamento.length || groups.concluidasHoje.length

  if (!hasItems) {
    return (
      <EmptyState
        title="Nada para hoje"
        message="Você não tem tarefas vencendo hoje nem atrasos pendentes."
        actionLabel="Nova tarefa"
        onAction={onCreate}
      />
    )
  }

  return (
    <>
      <Group title="Atrasadas que ainda precisam de atenção" tasks={groups.overdue} categories={data.categories} actions={actions} />
      <Group title="Pendentes de hoje" tasks={groups.pendentes} categories={data.categories} actions={actions} />
      <Group title="Em andamento" tasks={groups.emAndamento} categories={data.categories} actions={actions} />
      <Group title="Concluídas hoje" tasks={groups.concluidasHoje} categories={data.categories} actions={actions} />
    </>
  )
}
