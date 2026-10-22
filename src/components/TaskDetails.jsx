import Modal from './Modal'
import { formatDate, formatDateTime } from '../utils/dateUtils'
import {
  categoryName,
  getPriorityLabel,
  getStatusLabel,
  isOverdue,
  subtaskProgress,
} from '../utils/taskUtils'

export default function TaskDetails({ task, categories, onClose, onEdit, onToggleSubtask }) {
  const progress = subtaskProgress(task)

  return (
    <Modal title="Detalhes da tarefa" onClose={onClose}>
      <div className="details-list">
        <div>
          <span>Título</span>
          <strong>{task.title}</strong>
        </div>
        {task.description ? (
          <div>
            <span>Descrição</span>
            <p>{task.description}</p>
          </div>
        ) : null}
        <div className="badges">
          <span className={`badge ${task.status}`}>{getStatusLabel(task.status)}</span>
          <span className={`badge ${task.priority}`}>{getPriorityLabel(task.priority)}</span>
          {isOverdue(task) ? <span className="badge atrasada">Atrasada</span> : null}
        </div>
        <div>
          <span>Categoria</span>
          <p>{categoryName(categories, task.categoryId) || 'Sem categoria'}</p>
        </div>
        <div>
          <span>Início</span>
          <p>{task.startDate ? formatDate(task.startDate) : 'Não informado'}</p>
        </div>
        <div>
          <span>Vencimento</span>
          <p>
            {task.dueDate ? formatDate(task.dueDate) : 'Não informado'}
            {task.dueTime ? ` às ${task.dueTime}` : ''}
          </p>
        </div>
        {task.tags?.length ? (
          <div>
            <span>Tags</span>
            <div className="chips">
              {task.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {progress.total ? (
          <div>
            <span>Subtarefas</span>
            <p className="progress">
              {progress.done} de {progress.total} concluídas
            </p>
            {task.subtasks.map((item) => (
              <label key={item.id} className="subtask-row">
                <input type="checkbox" checked={item.completed} onChange={() => onToggleSubtask(task.id, item.id)} />
                <span>{item.title}</span>
              </label>
            ))}
          </div>
        ) : null}
        <div>
          <span>Criada em</span>
          <p>{formatDateTime(task.createdAt) || '—'}</p>
        </div>
        <div>
          <span>Atualizada em</span>
          <p>{formatDateTime(task.updatedAt) || '—'}</p>
        </div>
        {task.completedAt ? (
          <div>
            <span>Concluída em</span>
            <p>{formatDateTime(task.completedAt)}</p>
          </div>
        ) : null}
      </div>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>
          Fechar
        </button>
        <button type="button" className="btn btn-primary" onClick={() => onEdit(task)}>
          Editar
        </button>
      </div>
    </Modal>
  )
}
