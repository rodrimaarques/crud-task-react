import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import TaskForm from './components/TaskForm'
import TaskDetails from './components/TaskDetails'
import ConfirmDialog from './components/ConfirmDialog'
import Toast from './components/Toast'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Today from './pages/Today'
import Upcoming from './pages/Upcoming'
import Overdue from './pages/Overdue'
import Completed from './pages/Completed'
import Categories from './pages/Categories'
import Settings from './pages/Settings'
import {
  STORAGE_KEY,
  clearStorage,
  createInitialData,
  loadData,
  mergeImportedData,
  sanitizeData,
  saveData,
} from './services/storageService'
import {
  addCategory,
  addTask,
  deleteCategory,
  deleteTask,
  restoreTask,
  setTaskStatus,
  toggleSubtask,
  updateCategory,
  updateSettings,
  updateTask,
} from './services/taskService'

const TITLES = {
  dashboard: 'Visão geral',
  tasks: 'Todas as tarefas',
  today: 'Minhas tarefas de hoje',
  upcoming: 'Próximas tarefas',
  overdue: 'Tarefas atrasadas',
  completed: 'Tarefas concluídas',
  categories: 'Categorias',
  settings: 'Configurações',
}

function bootApp() {
  const loaded = loadData()
  if (!loaded.error && loaded.isEmpty) {
    saveData(loaded.data)
  }
  return loaded
}

export default function App() {
  const [session] = useState(bootApp)
  const [data, setData] = useState(session.data)
  const [readError, setReadError] = useState(session.error)
  const [page, setPage] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [formTask, setFormTask] = useState(undefined)
  const [detailsTask, setDetailsTask] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', data.settings.theme)
  }, [data.settings.theme])

  useEffect(() => {
    function onStorage(event) {
      if (event.key !== STORAGE_KEY || !event.newValue) return
      try {
        setData(sanitizeData(JSON.parse(event.newValue)))
        setReadError(null)
      } catch (error) {
        console.error('Erro ao sincronizar dados entre abas:', error)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function showToast(message, type = 'success', undo = null) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((current) => [...current, { id, message, type, undo }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, undo ? 6000 : 3200)
  }

  function commit(next) {
    setData(next)
    if (readError) return
    const result = saveData(next)
    if (!result.ok) showToast(result.message, 'error')
  }

  function navigate(nextPage) {
    setPage(nextPage)
    setMenuOpen(false)
  }

  function openCreate() {
    setDetailsTask(null)
    setFormTask(null)
  }

  function openEdit(task) {
    setDetailsTask(null)
    setFormTask(task)
  }

  function handleSubmit(input) {
    const result = formTask ? updateTask(data, formTask.id, input) : addTask(data, input)
    if (!result.ok) return result
    commit(result.data)
    setFormTask(undefined)
    showToast(formTask ? 'Tarefa atualizada.' : 'Tarefa criada.')
    return result
  }

  function completeTask(task) {
    commit(setTaskStatus(data, task.id, 'concluida'))
    showToast('Tarefa concluída.')
  }

  function reopenTask(task) {
    commit(setTaskStatus(data, task.id, 'pendente'))
    showToast('Tarefa reaberta.')
  }

  function removeTask(task) {
    const result = deleteTask(data, task.id)
    if (!result.ok) return
    commit(result.data)
    setDetailsTask(null)
    showToast(`Tarefa "${task.title}" excluída.`, 'success', (toastId) => {
      setData((current) => {
        const next = restoreTask(current, result.task)
        if (!readError) saveData(next)
        return next
      })
      setToasts((current) => current.filter((item) => item.id !== toastId))
      showToast('Exclusão desfeita.')
    })
  }

  function requestDeleteTask(task) {
    if (!data.settings.confirmDelete) {
      removeTask(task)
      return
    }
    setConfirm({
      title: 'Excluir tarefa',
      message: `A tarefa "${task.title}" será excluída. Essa ação pode ser desfeita por alguns segundos.`,
      confirmLabel: 'Excluir',
      danger: true,
      onConfirm: () => {
        setConfirm(null)
        removeTask(task)
      },
    })
  }

  function requestDeleteCategory(category) {
    setConfirm({
      title: 'Excluir categoria',
      message: `A categoria "${category.name}" será excluída. As tarefas relacionadas permanecem, sem essa categoria.`,
      confirmLabel: 'Excluir',
      danger: true,
      onConfirm: () => {
        commit(deleteCategory(data, category.id))
        setConfirm(null)
        showToast('Categoria excluída.')
      },
    })
  }

  function handleImport(incoming, mode) {
    if (mode === 'replace') {
      const next = {
        ...incoming,
        settings: data.settings,
      }
      commit(next)
      showToast('Dados substituídos pela importação.')
      return { ok: true }
    }
    const merged = mergeImportedData(data, incoming)
    commit(merged.data)
    showToast(`Importação concluída: ${merged.added} novas e ${merged.updated} atualizadas.`)
    return { ok: true }
  }

  function requestClear() {
    setConfirm({
      title: 'Limpar dados locais',
      message: 'Isso apaga tarefas, categorias e preferências salvas neste navegador.',
      confirmLabel: 'Limpar tudo',
      danger: true,
      onConfirm: () => {
        const result = clearStorage()
        if (!result.ok) {
          showToast(result.message, 'error')
          setConfirm(null)
          return
        }
        const initial = createInitialData()
        setData(initial)
        setReadError(null)
        saveData(initial)
        setConfirm(null)
        showToast('Dados locais removidos.')
      },
    })
  }

  const actions = {
    onOpen: (task) => setDetailsTask(task),
    onEdit: openEdit,
    onDelete: requestDeleteTask,
    onComplete: completeTask,
    onReopen: reopenTask,
  }

  const currentDetails = detailsTask ? data.tasks.find((task) => task.id === detailsTask.id) : null
  const showCreate = page !== 'settings' && page !== 'categories'

  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={navigate} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-area">
        <Header
          title={TITLES[page]}
          onMenu={() => setMenuOpen(true)}
          onCreate={showCreate ? openCreate : null}
        />
        <main className="content">
          {readError ? (
            <div className="banner">
              <p>{readError}</p>
              <p className="muted">
                O aplicativo continua funcionando em memória e não sobrescreveu o armazenamento corrompido.
              </p>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const initial = createInitialData()
                  setData(initial)
                  setReadError(null)
                  saveData(initial)
                  showToast('Armazenamento recriado com dados iniciais.')
                }}
              >
                Substituir por dados vazios
              </button>
            </div>
          ) : null}

          {page === 'dashboard' ? <Dashboard data={data} onCreate={openCreate} actions={actions} /> : null}
          {page === 'tasks' ? <Tasks data={data} onCreate={openCreate} actions={actions} /> : null}
          {page === 'today' ? <Today data={data} onCreate={openCreate} actions={actions} /> : null}
          {page === 'upcoming' ? <Upcoming data={data} onCreate={openCreate} actions={actions} /> : null}
          {page === 'overdue' ? (
            <Overdue data={data} onCreate={() => navigate('tasks')} actions={actions} />
          ) : null}
          {page === 'completed' ? <Completed data={data} actions={actions} /> : null}
          {page === 'categories' ? (
            <Categories
              data={data}
              onCreate={(name) => {
                const result = addCategory(data, name)
                if (result.ok) {
                  commit(result.data)
                  showToast('Categoria criada.')
                }
                return result
              }}
              onUpdate={(id, name) => {
                const result = updateCategory(data, id, name)
                if (result.ok) {
                  commit(result.data)
                  showToast('Categoria atualizada.')
                }
                return result
              }}
              onDelete={requestDeleteCategory}
            />
          ) : null}
          {page === 'settings' ? (
            <Settings
              data={data}
              onSettings={(patch) => commit(updateSettings(data, patch))}
              onImport={handleImport}
              onClear={requestClear}
            />
          ) : null}
        </main>
      </div>

      {formTask !== undefined ? (
        <TaskForm
          task={formTask}
          categories={data.categories}
          onSubmit={handleSubmit}
          onClose={() => setFormTask(undefined)}
        />
      ) : null}

      {currentDetails ? (
        <TaskDetails
          task={currentDetails}
          categories={data.categories}
          onClose={() => setDetailsTask(null)}
          onEdit={openEdit}
          onToggleSubtask={(taskId, subtaskId) => commit(toggleSubtask(data, taskId, subtaskId))}
        />
      ) : null}

      {confirm ? (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
      ) : null}

      <Toast toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))} />
    </div>
  )
}
