import { Icon, faChevronLeft, faChevronRight } from './iconos.js'

// Números de página con "…" cuando hay muchas: 1 … 4 5 6 … 12
const paginas = (actual, total) => {
  const set = new Set([1, total, actual - 1, actual, actual + 1].filter((n) => n >= 1 && n <= total))
  const lista = [...set].sort((a, b) => a - b)
  return lista.flatMap((n, i) => (i && n - lista[i - 1] > 1 ? ['…', n] : [n]))
}

export default function Paginacion({ pagina, total, items, porPagina, onCambio }) {
  const desde = (pagina - 1) * porPagina + 1
  const hasta = Math.min(items, pagina * porPagina)
  return (
    <nav className="adm-pag" aria-label="Paginación">
      <span className="adm-pag-info">Mostrando <b>{desde}–{hasta}</b> de <b>{items}</b></span>
      <div className="adm-pag-btns">
        <button className="adm-icon-btn" disabled={pagina === 1} onClick={() => onCambio(pagina - 1)} aria-label="Página anterior"><Icon icon={faChevronLeft} /></button>
        {paginas(pagina, total).map((n, i) => (n === '…'
          ? <span key={`e${i}`} className="adm-pag-dots">…</span>
          : <button key={n} className={`adm-pag-n ${n === pagina ? 'is-on' : ''}`} onClick={() => onCambio(n)} aria-current={n === pagina ? 'page' : undefined}>{n}</button>))}
        <button className="adm-icon-btn" disabled={pagina === total} onClick={() => onCambio(pagina + 1)} aria-label="Página siguiente"><Icon icon={faChevronRight} /></button>
      </div>
    </nav>
  )
}
