export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
          <span>{toast.message}</span>
          {toast.undo ? (
            <button type="button" onClick={() => toast.undo(toast.id)}>
              Desfazer
            </button>
          ) : (
            <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Fechar notificação">
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
