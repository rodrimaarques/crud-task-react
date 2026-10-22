import { Check, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { formatDate } from '../utils/dateUtils'
import {
  categoryName,
  excerpt,
  getPriorityLabel,
  getStatusLabel,
  isOverdue,
  subtaskProgress,
} from '../utils/taskUtils'

export default function TaskCard({ task, categories, extra, onOpen, onEdit, onDelete, onComplete, onReopen }) {
  const progress = subtaskProgress(task)
  const overdue = isOverdue(task)

  return (
    <article className={`task-card ${task.status === 'concluida' ? 'done' : ''}`}>
      <div className="task-card-top">
        <button type="button" className="task-link" onClick={() => onOpen(task)}>
          <h3 className="task-title">{task.title}</h3>
          {task.description ? <p className="muted">{excerpt(task.description)}</p> : null}
        </button>
        <div className="row-actions">
          {task.status === 'concluida' ? (
            <button type="button" className="icon-button" aria-label="Reabrir tarefa" onClick={() => onReopen(task)}>
              <RotateCcw size={16} />
            </button>
          ) : (
            <button type="button" className="icon-button" aria-label="Concluir tarefa" onClick={() => onComplete(task)}>
              <Check size={16} />
            </button>
          )}
          <button type="button" className="icon-button" aria-label="Editar tarefa" onClick={() => onEdit(task)}>
            <Pencil size={16} />
          </button>
          <button type="button" className="icon-button danger" aria-label="Excluir tarefa" onClick={() => onDelete(task)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="badges">
        <span className={`badge ${task.status}`}>{getStatusLabel(task.status)}</span>
        <span className={`badge ${task.priority}`}>{getPriorityLabel(task.priority)}</span>
        {categoryName(categories, task.categoryId) ? (
          <span className="badge pendente">{categoryName(categories, task.categoryId)}</span>
        ) : null}
        {overdue ? <span className="badge atrasada">Atrasada</span> : null}
      </div>
      <p className="muted">
        {task.dueDate ? `Vence em ${formatDate(task.dueDate)}${task.dueTime ? ` às ${task.dueTime}` : ''}` : 'Sem vencimento'}
        {progress.total ? ` · ${progress.done} de ${progress.total} concluídas` : ''}
      </p>
      {extra}
    </article>
  )
}
