import { useEffect, useRef } from 'react'

export default function Modal({ title, onClose, children, size = 'default' }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const node = dialogRef.current
    const focusable = node?.querySelector('button, [href], input, select, textarea')
    focusable?.focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus()
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className={`modal ${size === 'small' ? 'small' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h3 id="modal-title">{title}</h3>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
