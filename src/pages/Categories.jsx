import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

export default function Categories({ data, onCreate, onUpdate, onDelete }) {
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState('')

  function handleCreate(event) {
    event.preventDefault()
    const result = onCreate(name)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setName('')
    setError('')
  }

  function handleUpdate(event) {
    event.preventDefault()
    const result = onUpdate(editingId, editingName)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setEditingId(null)
    setEditingName('')
    setError('')
  }

  return (
    <section className="panel">
      <form className="toolbar" onSubmit={handleCreate}>
        <div className="field grow">
          <label htmlFor="category-name">Nova categoria</label>
          <input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome da categoria"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Criar
        </button>
      </form>
      {error ? <p className="form-error">{error}</p> : null}
      {data.categories.map((category) => (
        <div key={category.id} className="category-item">
          {editingId === category.id ? (
            <form className="toolbar grow" onSubmit={handleUpdate}>
              <input
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                aria-label="Nome da categoria"
              />
              <button type="submit" className="btn btn-primary">
                Salvar
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setEditingId(null)
                  setError('')
                }}
              >
                Cancelar
              </button>
            </form>
          ) : (
            <>
              <strong className="grow">{category.name}</strong>
              <button
                type="button"
                className="icon-button"
                aria-label={`Editar ${category.name}`}
                onClick={() => {
                  setEditingId(category.id)
                  setEditingName(category.name)
                  setError('')
                }}
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                className="icon-button danger"
                aria-label={`Excluir ${category.name}`}
                onClick={() => onDelete(category)}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      ))}
    </section>
  )
}
