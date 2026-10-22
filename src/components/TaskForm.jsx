import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import Modal from './Modal'
import { PRIORITIES, STATUSES, createId } from '../utils/taskUtils'

function toForm(task) {
  return {
    title: task?.title || '',
    description: task?.description || '',
    categoryId: task?.categoryId || '',
    priority: task?.priority || 'media',
    status: task?.status || 'pendente',
    startDate: task?.startDate || '',
    dueDate: task?.dueDate || '',
    dueTime: task?.dueTime || '',
    tags: task?.tags ? [...task.tags] : [],
    tagInput: '',
    subtasks: task?.subtasks ? task.subtasks.map((item) => ({ ...item })) : [],
    subtaskInput: '',
  }
}

export default function TaskForm({ task, categories, onSubmit, onClose }) {
  const [form, setForm] = useState(() => toForm(task))
  const [errors, setErrors] = useState({})

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function addTag() {
    const value = form.tagInput.trim()
    if (!value) return
    if (form.tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      update('tagInput', '')
      return
    }
    setForm((current) => ({
      ...current,
      tags: [...current.tags, value],
      tagInput: '',
    }))
  }

  function addSubtask() {
    const value = form.subtaskInput.trim()
    if (!value) return
    setForm((current) => ({
      ...current,
      subtasks: [...current.subtasks, { id: createId(), title: value, completed: false }],
      subtaskInput: '',
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const result = onSubmit({
      title: form.title,
      description: form.description,
      categoryId: form.categoryId || null,
      priority: form.priority,
      status: form.status,
      startDate: form.startDate || null,
      dueDate: form.dueDate || null,
      dueTime: form.dueTime || null,
      tags: form.tags,
      subtasks: form.subtasks,
    })
    if (result && !result.ok) setErrors(result.errors || {})
  }

  return (
    <Modal title={task ? 'Editar tarefa' : 'Nova tarefa'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="task-title">Título</label>
            <input
              id="task-title"
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
              required
            />
            {errors.title ? <span className="form-error">{errors.title}</span> : null}
          </div>
          <div className="field full">
            <label htmlFor="task-description">Descrição</label>
            <textarea
              id="task-description"
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="task-category">Categoria</label>
            <select
              id="task-category"
              value={form.categoryId}
              onChange={(event) => update('categoryId', event.target.value)}
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-priority">Prioridade</label>
            <select
              id="task-priority"
              value={form.priority}
              onChange={(event) => update('priority', event.target.value)}
            >
              {PRIORITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-status">Status</label>
            <select
              id="task-status"
              value={form.status}
              onChange={(event) => update('status', event.target.value)}
            >
              {STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-start">Data de início</label>
            <input
              id="task-start"
              type="date"
              value={form.startDate}
              onChange={(event) => update('startDate', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="task-due">Data de vencimento</label>
            <input
              id="task-due"
              type="date"
              value={form.dueDate}
              onChange={(event) => update('dueDate', event.target.value)}
            />
            {errors.dueDate ? <span className="form-error">{errors.dueDate}</span> : null}
          </div>
          <div className="field">
            <label htmlFor="task-time">Horário</label>
            <input
              id="task-time"
              type="time"
              value={form.dueTime}
              onChange={(event) => update('dueTime', event.target.value)}
            />
            {errors.dueTime ? <span className="form-error">{errors.dueTime}</span> : null}
          </div>
          <div className="field full">
            <label htmlFor="task-tag">Tags</label>
            <div className="inline-between">
              <input
                id="task-tag"
                value={form.tagInput}
                onChange={(event) => update('tagInput', event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addTag()
                  }
                }}
              />
              <button type="button" className="btn" onClick={addTag}>
                Adicionar
              </button>
            </div>
            <div className="chips">
              {form.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remover tag ${tag}`}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        tags: current.tags.filter((item) => item !== tag),
                      }))
                    }
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="field full">
            <label htmlFor="task-subtask">Subtarefas</label>
            <div className="inline-between">
              <input
                id="task-subtask"
                value={form.subtaskInput}
                onChange={(event) => update('subtaskInput', event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addSubtask()
                  }
                }}
              />
              <button type="button" className="btn" onClick={addSubtask}>
                <Plus size={16} />
                Adicionar
              </button>
            </div>
            {form.subtasks.map((item) => (
              <div key={item.id} className="subtask-row">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() =>
                    setForm((current) => ({
                      ...current,
                      subtasks: current.subtasks.map((subtask) =>
                        subtask.id === item.id ? { ...subtask, completed: !subtask.completed } : subtask,
                      ),
                    }))
                  }
                  aria-label={`Concluir ${item.title}`}
                />
                <input
                  type="text"
                  value={item.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      subtasks: current.subtasks.map((subtask) =>
                        subtask.id === item.id ? { ...subtask, title: event.target.value } : subtask,
                      ),
                    }))
                  }
                  aria-label="Nome da subtarefa"
                />
                <button
                  type="button"
                  className="icon-button danger"
                  aria-label="Excluir subtarefa"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      subtasks: current.subtasks.filter((subtask) => subtask.id !== item.id),
                    }))
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  )
}
