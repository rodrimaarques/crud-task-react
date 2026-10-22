import Modal from './Modal'

export default function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose} size="small">
      <p>{message}</p>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>
          Cancelar
        </button>
        <button type="button" className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
