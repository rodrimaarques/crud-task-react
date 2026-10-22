import { Search } from 'lucide-react'
import { PRIORITIES, STATUSES } from '../utils/taskUtils'

export default function TaskFilters({ filters, categories, onChange, onClear, showCompletedToggle = true }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="panel toolbar">
      <div className="field grow">
        <label htmlFor="task-search">Pesquisar</label>
        <div className="search-field">
          <Search size={16} />
          <input
            id="task-search"
            value={filters.query}
            onChange={(event) => update('query', event.target.value)}
            placeholder="Título, descrição, categoria ou tag"
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="filter-status">Status</label>
        <select id="filter-status" value={filters.status} onChange={(event) => update('status', event.target.value)}>
          <option value="">Todos</option>
          {STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="filter-priority">Prioridade</label>
        <select
          id="filter-priority"
          value={filters.priority}
          onChange={(event) => update('priority', event.target.value)}
        >
          <option value="">Todas</option>
          {PRIORITIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="filter-category">Categoria</label>
        <select
          id="filter-category"
          value={filters.categoryId}
          onChange={(event) => update('categoryId', event.target.value)}
        >
          <option value="">Todas</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="filter-period">Período</label>
        <select id="filter-period" value={filters.period} onChange={(event) => update('period', event.target.value)}>
          <option value="">Todos</option>
          <option value="hoje">Hoje</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mês</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="filter-from">De</label>
        <input
          id="filter-from"
          type="date"
          value={filters.periodFrom}
          onChange={(event) => update('periodFrom', event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="filter-to">Até</label>
        <input
          id="filter-to"
          type="date"
          value={filters.periodTo}
          onChange={(event) => update('periodTo', event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="filter-sort">Ordenar por</label>
        <select id="filter-sort" value={filters.sortBy} onChange={(event) => update('sortBy', event.target.value)}>
          <option value="vencimento">Data de vencimento</option>
          <option value="criacao">Data de criação</option>
          <option value="prioridade">Prioridade</option>
          <option value="alfabetica">Ordem alfabética</option>
        </select>
      </div>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={filters.onlyOverdue}
          onChange={(event) => update('onlyOverdue', event.target.checked)}
        />
        Somente atrasadas
      </label>
      {showCompletedToggle ? (
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={filters.onlyCompleted}
            onChange={(event) => update('onlyCompleted', event.target.checked)}
          />
          Somente concluídas
        </label>
      ) : null}
      <button type="button" className="btn" onClick={onClear}>
        Limpar filtros
      </button>
    </div>
  )
}
