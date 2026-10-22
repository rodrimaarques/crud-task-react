import EmptyState from '../components/EmptyState'
import SummaryCard from '../components/SummaryCard'
import TaskCard from '../components/TaskCard'
import { formatDate, todayKey } from '../utils/dateUtils'
import { getStats, getUpcomingTasks, getWeekSummary, isDueOn } from '../utils/taskUtils'

export default function Dashboard({ data, onCreate, actions }) {
  const today = todayKey()
  const stats = getStats(data.tasks, today)
  const week = getWeekSummary(data.tasks, today)
  const todayTasks = data.tasks.filter((task) => isDueOn(task, today))
  const upcoming = getUpcomingTasks(data.tasks, '7', today).slice(0, 6)

  if (!data.tasks.length) {
    return (
      <EmptyState
        title="Nenhuma tarefa por aqui"
        message="Crie a primeira tarefa para acompanhar prazos, prioridades e o progresso da semana."
        actionLabel="Criar primeira tarefa"
        onAction={onCreate}
      />
    )
  }

  return (
    <>
      <section className="cards-grid">
        <SummaryCard label="Total de tarefas" value={stats.total} />
        <SummaryCard label="Pendentes" value={stats.pendentes} tone="warning" />
        <SummaryCard label="Em andamento" value={stats.emAndamento} tone="primary" />
        <SummaryCard label="Concluídas" value={stats.concluidas} tone="success" />
        <SummaryCard label="Atrasadas" value={stats.atrasadas} tone="danger" />
      </section>

      <section className="panel">
        <h3>Resumo semanal</h3>
        <div className="week-summary">
          <p>
            <strong>{week.concluidas}</strong> concluídas nesta semana
          </p>
          <p>
            <strong>{week.pendentes}</strong> pendentes com vencimento nesta semana
          </p>
        </div>
      </section>

      <section className="panel">
        <h3>Tarefas de hoje</h3>
        {todayTasks.length ? (
          <div className="cards-list">
            {todayTasks.map((task) => (
              <TaskCard key={task.id} task={task} categories={data.categories} {...actions} />
            ))}
          </div>
        ) : (
          <p className="muted">Nenhuma tarefa vence hoje.</p>
        )}
      </section>

      <section className="panel">
        <h3>Próximas tarefas</h3>
        {upcoming.length ? (
          <div className="cards-list">
            {upcoming.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                categories={data.categories}
                extra={<p className="muted">{formatDate(task.dueDate)}</p>}
                {...actions}
              />
            ))}
          </div>
        ) : (
          <p className="muted">Não há tarefas futuras nos próximos 7 dias.</p>
        )}
      </section>
    </>
  )
}
