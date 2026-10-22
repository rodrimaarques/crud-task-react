import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  LayoutDashboard,
  ListTodo,
  Settings,
  Sun,
  Tags,
  Workflow,
} from 'lucide-react'

const ITEMS = [
  { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'tasks', label: 'Todas as tarefas', icon: ListTodo },
  { id: 'today', label: 'Minhas tarefas de hoje', icon: Sun },
  { id: 'upcoming', label: 'Próximas tarefas', icon: CalendarClock },
  { id: 'overdue', label: 'Tarefas atrasadas', icon: AlertTriangle },
  { id: 'completed', label: 'Tarefas concluídas', icon: CheckCircle2 },
  { id: 'categories', label: 'Categorias', icon: Tags },
  { id: 'settings', label: 'Configurações', icon: Settings },
]

export default function Sidebar({ page, onNavigate, open, onClose }) {
  return (
    <>
      {open ? <button type="button" className="sidebar-backdrop" aria-label="Fechar menu" onClick={onClose} /> : null}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Workflow size={20} />
          </div>
          <h1>TaskFlow</h1>
        </div>
        <nav className="nav-list" aria-label="Menu principal">
          {ITEMS.map((item) => {
            const Icon = item.icon
            const active = page === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-button ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
