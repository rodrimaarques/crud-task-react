import { Menu, Plus } from 'lucide-react'

export default function Header({ title, onMenu, onCreate }) {
  return (
    <header className="header">
      <div className="header-left">
        <button type="button" className="menu-button" onClick={onMenu} aria-label="Abrir menu">
          <Menu size={20} />
        </button>
        <h2>{title}</h2>
      </div>
      {onCreate ? (
        <button type="button" className="btn btn-primary" onClick={onCreate}>
          <Plus size={18} />
          <span>Nova tarefa</span>
        </button>
      ) : null}
    </header>
  )
}
