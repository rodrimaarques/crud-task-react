import { Check, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import TaskCard from './TaskCard'
import { formatDate } from '../utils/dateUtils'
import {
  categoryName,
  excerpt,
  getPriorityLabel,
  getStatusLabel,
  isOverdue,
} from '../utils/taskUtils'

export default function TaskList({
  tasks,
  categories,
  viewMode,
  onOpen,
  onEdit,
  onDelete,
  onComplete,
  onReopen,
  renderExtra,
}) {
  const useCards = viewMode === 'cards'

  return (
    <>
      {!useCards ? (
        <div className="table-wrap desktop-only">
          <table className="task-table">
            <thead>
              <tr>
                <th>Tarefa</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Categoria</th>
                <th>Vencimento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="clickable" onClick={() => onOpen(task)}>
                  <td>
                    <strong>{task.title}</strong>
                    {task.description ? <p className="muted">{excerpt(task.description)}</p> : null}
                    {isOverdue(task) ? <p className="muted">Atrasada</p> : null}
                    {renderExtra ? renderExtra(task) : null}
                  </td>
                  <td>
                    <span className={`badge ${task.status}`}>{getStatusLabel(task.status)}</span>
                  </td>
                  <td>
                    <span className={`badge ${task.priority}`}>{getPriorityLabel(task.priority)}</span>
                  </td>
                  <td>{categoryName(categories, task.categoryId) || '—'}</td>
                  <td>
                    {task.dueDate ? formatDate(task.dueDate) : '—'}
                    {task.dueTime ? ` ${task.dueTime}` : ''}
                  </td>
                  <td>
                    <div className="row-actions" onClick={(event) => event.stopPropagation()}>
                      {task.status === 'concluida' ? (
                        <button type="button" className="icon-button" aria-label="Reabrir" onClick={() => onReopen(task)}>
                          <RotateCcw size={16} />
                        </button>
                      ) : (
                        <button type="button" className="icon-button" aria-label="Concluir" onClick={() => onComplete(task)}>
                          <Check size={16} />
                        </button>
                      )}
                      <button type="button" className="icon-button" aria-label="Editar" onClick={() => onEdit(task)}>
                        <Pencil size={16} />
                      </button>
                      <button type="button" className="icon-button danger" aria-label="Excluir" onClick={() => onDelete(task)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className={`cards-list ${useCards ? '' : 'mobile-cards list-mode'}`}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            categories={categories}
            extra={renderExtra ? renderExtra(task) : null}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
            onComplete={onComplete}
            onReopen={onReopen}
          />
        ))}
      </div>
    </>
  )
}
