import { useState } from 'react'
import EmptyState from '../components/EmptyState'
import TaskCard from '../components/TaskCard'
import { formatDateLong } from '../utils/dateUtils'
import { getUpcomingTasks, groupByDueDate } from '../utils/taskUtils'

export default function Upcoming({ data, onCreate, actions }) {
  const [range, setRange] = useState('7')
  const tasks = getUpcomingTasks(data.tasks, range)
  const groups = groupByDueDate(tasks)

  return (
    <>
      <div className="panel toolbar">
        <div className="choice-group">
          <button type="button" className="btn" aria-pressed={range === '7'} onClick={() => setRange('7')}>
            Próximos 7 dias
          </button>
          <button type="button" className="btn" aria-pressed={range === '30'} onClick={() => setRange('30')}>
            Próximos 30 dias
          </button>
          <button type="button" className="btn" aria-pressed={range === 'all'} onClick={() => setRange('all')}>
            Todas as futuras
          </button>
        </div>
      </div>
      {groups.length ? (
        groups.map((group) => (
          <section key={group.date} className="panel">
            <h3>{formatDateLong(group.date)}</h3>
            <div className="cards-list">
              {group.tasks.map((task) => (
                <TaskCard key={task.id} task={task} categories={data.categories} {...actions} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <EmptyState
          title="Sem tarefas futuras"
          message="Não há tarefas com vencimento depois de hoje neste período."
          actionLabel="Nova tarefa"
          onAction={onCreate}
        />
      )}
    </>
  )
}
