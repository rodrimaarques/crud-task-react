import { useState } from 'react'
import { todayKey } from '../utils/dateUtils'
import { buildExportPayload, parseImportFile } from '../services/storageService'

export default function Settings({ data, onSettings, onImport, onClear }) {
  const [importPreview, setImportPreview] = useState(null)
  const [importError, setImportError] = useState('')
  const [mode, setMode] = useState('merge')

  function exportData() {
    const payload = buildExportPayload(data)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `taskflow-${todayKey()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const result = parseImportFile(text)
      if (!result.ok) {
        setImportPreview(null)
        setImportError(result.message)
        return
      }
      setImportError('')
      setImportPreview(result)
    } catch (error) {
      console.error(error)
      setImportPreview(null)
      setImportError('Não foi possível ler o arquivo selecionado.')
    }
  }

  function confirmImport() {
    if (!importPreview) return
    const result = onImport(importPreview.data, mode)
    if (!result.ok) {
      setImportError(result.message)
      return
    }
    setImportPreview(null)
  }

  return (
    <div className="settings-stack">
      <section className="panel">
        <h3>Aparência</h3>
        <div className="setting-row">
          <div>
            <strong>Tema</strong>
            <p className="muted">Claro ou escuro, salvo neste navegador.</p>
          </div>
          <div className="choice-group">
            <button
              type="button"
              className="btn"
              aria-pressed={data.settings.theme === 'light'}
              onClick={() => onSettings({ theme: 'light' })}
            >
              Claro
            </button>
            <button
              type="button"
              className="btn"
              aria-pressed={data.settings.theme === 'dark'}
              onClick={() => onSettings({ theme: 'dark' })}
            >
              Escuro
            </button>
          </div>
        </div>
        <div className="setting-row">
          <div>
            <strong>Visualização das tarefas</strong>
            <p className="muted">Lista em tabela no desktop ou cards.</p>
          </div>
          <div className="choice-group">
            <button
              type="button"
              className="btn"
              aria-pressed={data.settings.viewMode === 'list'}
              onClick={() => onSettings({ viewMode: 'list' })}
            >
              Lista
            </button>
            <button
              type="button"
              className="btn"
              aria-pressed={data.settings.viewMode === 'cards'}
              onClick={() => onSettings({ viewMode: 'cards' })}
            >
              Cards
            </button>
          </div>
        </div>
        <label className="setting-row">
          <div>
            <strong>Confirmar exclusão</strong>
            <p className="muted">Pede confirmação antes de apagar uma tarefa.</p>
          </div>
          <input
            type="checkbox"
            checked={data.settings.confirmDelete}
            onChange={(event) => onSettings({ confirmDelete: event.target.checked })}
          />
        </label>
      </section>

      <section className="panel">
        <h3>Dados</h3>
        <div className="setting-row">
          <div>
            <strong>Exportar</strong>
            <p className="muted">Baixa um arquivo JSON com tarefas e categorias.</p>
          </div>
          <button type="button" className="btn" onClick={exportData}>
            Exportar JSON
          </button>
        </div>
        <div className="setting-row">
          <div>
            <strong>Importar</strong>
            <p className="muted">Use um arquivo gerado pelo próprio TaskFlow.</p>
          </div>
          <label className="btn">
            Selecionar arquivo
            <input type="file" accept="application/json,.json" hidden onChange={handleFile} />
          </label>
        </div>
        {importError ? <p className="form-error">{importError}</p> : null}
        {importPreview ? (
          <div className="panel">
            <p>
              Serão importadas <strong>{importPreview.taskCount}</strong> tarefas e{' '}
              <strong>{importPreview.categoryCount}</strong> categorias.
            </p>
            <div className="choice-group">
              <button type="button" className="btn" aria-pressed={mode === 'merge'} onClick={() => setMode('merge')}>
                Mesclar
              </button>
              <button type="button" className="btn" aria-pressed={mode === 'replace'} onClick={() => setMode('replace')}>
                Substituir dados atuais
              </button>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setImportPreview(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={confirmImport}>
                {mode === 'replace' ? 'Confirmar substituição' : 'Confirmar importação'}
              </button>
            </div>
          </div>
        ) : null}
        <div className="setting-row">
          <div>
            <strong>Limpar dados locais</strong>
            <p className="muted">Remove tarefas, categorias e preferências deste navegador.</p>
          </div>
          <button type="button" className="btn btn-danger" onClick={onClear}>
            Limpar tudo
          </button>
        </div>
      </section>
    </div>
  )
}
