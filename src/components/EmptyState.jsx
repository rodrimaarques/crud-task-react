import { Inbox } from 'lucide-react'

export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="empty-state panel">
      <Inbox size={36} />
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel ? (
        <p>
          <button type="button" className="btn btn-primary" onClick={onAction}>
            {actionLabel}
          </button>
        </p>
      ) : null}
    </div>
  )
}
