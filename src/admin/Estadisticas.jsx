import { useEffect, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { fechaLocal } from './store.js'
import { Icon, faChartLine, faFilePdf, faCircleInfo, faArrowTrendUp, faArrowTrendDown } from './iconos.js'

// DEMO: datos simulados (estables). En la versión real vendrían de la analítica de la web
// (visitas y clics en los botones de WhatsApp) y de la base de datos del panel.

const C_VISITAS = '#ffc800' // serie única del gráfico de línea
const C_COTIZ = '#3987e5'   // serie única de barras (validado contra el fondo #111114)

const SERVICIOS = [
  ['Polarizado', 0.36], ['PPF', 0.15], ['Láminas de seguridad', 0.1], ['Audio', 0.09], ['Corta corriente', 0.08],
  ['Ahumado de focos', 0.07], ['Vinilos / Kill chrome', 0.06], ['Iluminación', 0.04], ['Polarizado arquitectónico', 0.03], ['Grabado de patentes', 0.02],
]
const ORIGENES = [['Instagram', 0.52], ['Google', 0.23], ['Directo (link)', 0.15], ['Compartido por WhatsApp', 0.1]]
const RANGOS = [[7, '7 días'], [30, '30 días'], [90, '90 días']]

function serieSimulada() {
  let s = 20261010
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const hoy = new Date()
  return Array.from({ length: 180 }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - (179 - i))
    const dow = d.getDay()
    const factor = dow === 6 ? 1.2 : dow === 0 ? 0.75 : 1
    const visitas = Math.round((42 + i * 0.32 + (rnd() - 0.5) * 30) * factor)
    const clics = Math.round(visitas * (0.08 + rnd() * 0.05))
    return { fecha: fechaLocal(d), visitas, clics }
  })
}

const fmt = (n) => n.toLocaleString('es-CL')
const fechaCorta = (iso) => { const [, m, d] = iso.split('-'); return `${Number(d)}/${Number(m)}` }

function useAncho() {
  const ref = useRef(null)
  const [w, setW] = useState(600)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, e.contentRect.width)))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, w]
}

const ticks = (max) => {
  const paso = Math.pow(10, Math.floor(Math.log10(max / 3)))
  const p = [1, 2, 5, 10].map((k) => k * paso).find((k) => max / k <= 4) || paso * 10
  return Array.from({ length: Math.ceil(max / p) + 1 }, (_, i) => i * p) // el último tick siempre queda sobre el máximo
}

function GraficoVisitas({ datos }) {
  const [ref, W] = useAncho()
  const [idx, setIdx] = useState(null)
  const H = 240, ml = 40, mr = 12, mt = 14, mb = 28
  const max = Math.max(...datos.map((d) => d.visitas)) * 1.05
  const ys = ticks(max)
  const top = ys[ys.length - 1] || 1
  const x = (i) => ml + (i / Math.max(1, datos.length - 1)) * (W - ml - mr)
  const y = (v) => mt + (1 - v / top) * (H - mt - mb)
  const linea = datos.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.visitas).toFixed(1)}`).join('')
  const area = `${linea}L${x(datos.length - 1)},${y(0)}L${x(0)},${y(0)}Z`
  const marcas = datos.length > 1 ? [0, Math.floor((datos.length - 1) / 2), datos.length - 1] : [0]

  const mover = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const i = Math.round(((e.clientX - r.left - ml) / (W - ml - mr)) * (datos.length - 1))
    setIdx(Math.max(0, Math.min(datos.length - 1, i)))
  }
  const teclas = (e) => {
    if (e.key === 'ArrowRight') setIdx((i) => Math.min(datos.length - 1, (i ?? -1) + 1))
    if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, (i ?? datos.length) - 1))
  }
  const d = idx != null ? datos[idx] : null

  return (
    <div className="st-chart" ref={ref}>
      <svg width={W} height={H} role="img" aria-label="Visitas por día" tabIndex={0}
        onPointerMove={mover} onPointerLeave={() => setIdx(null)} onKeyDown={teclas} onBlur={() => setIdx(null)}>
        <defs>
          <linearGradient id="st-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C_VISITAS} stopOpacity="0.28" />
            <stop offset="1" stopColor={C_VISITAS} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ys.map((v) => (
          <g key={v}>
            <line x1={ml} x2={W - mr} y1={y(v)} y2={y(v)} className="st-grid" />
            <text x={ml - 8} y={y(v) + 4} className="st-axis" textAnchor="end">{fmt(v)}</text>
          </g>
        ))}
        {marcas.map((i) => (
          <text key={i} x={x(i)} y={H - 8} className="st-axis" textAnchor={i === 0 ? 'start' : i === datos.length - 1 ? 'end' : 'middle'}>{fechaCorta(datos[i].fecha)}</text>
        ))}
        <path d={area} fill="url(#st-area)" />
        <path d={linea} fill="none" stroke={C_VISITAS} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {d && (
          <g>
            <line x1={x(idx)} x2={x(idx)} y1={mt} y2={H - mb} className="st-cross" />
            <circle cx={x(idx)} cy={y(d.visitas)} r="5" fill={C_VISITAS} stroke="#111114" strokeWidth="2" />
          </g>
        )}
      </svg>
      {d && (
        <div className="st-tip" style={{ left: Math.min(W - 170, Math.max(0, x(idx) - 80)), top: 6 }}>
          <span className="st-tip-f">{fechaCorta(d.fecha)}</span>
          <span><i style={{ background: C_VISITAS }} /><b>{fmt(d.visitas)}</b> visitas</span>
          <span className="st-tip-sub"><b>{fmt(d.clics)}</b> clics a WhatsApp</span>
        </div>
      )}
    </div>
  )
}

function Barras({ filas, color, unidad }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(...filas.map((f) => f.valor), 1)
  const total = filas.reduce((a, f) => a + f.valor, 0) || 1
  return (
    <ul className="st-barras">
      {filas.map((f, i) => (
        <li key={f.nombre} className={hover === i ? 'is-hover' : ''}
          onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} tabIndex={0} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
          title={`${f.nombre}: ${fmt(f.valor)} ${unidad} (${Math.round((f.valor / total) * 100)}%)`}>
          <span className="st-bar-nombre">{f.nombre}</span>
          <span className="st-bar-pista">
            <i style={{ width: `${(f.valor / max) * 100}%`, background: color }} />
          </span>
          <span className="st-bar-valor"><b>{fmt(f.valor)}</b> <small>{Math.round((f.valor / total) * 100)}%</small></span>
        </li>
      ))}
    </ul>
  )
}

function Kpi({ titulo, valor, previo, sufijo = '', nota, texto }) {
  const delta = previo ? ((valor - previo) / previo) * 100 : null
  const sube = delta != null && delta >= 0
  return (
    <div className="st-kpi">
      <span className="st-kpi-t">{titulo}</span>
      <b className="st-kpi-v">{texto ?? fmt(valor)}{sufijo}</b>
      {delta != null && Number.isFinite(delta) ? (
        <span className={`st-kpi-d ${sube ? 'is-up' : 'is-down'}`}>
          <Icon icon={sube ? faArrowTrendUp : faArrowTrendDown} /> {sube ? '+' : ''}{delta.toFixed(0)}% vs período anterior
        </span>
      ) : <span className="st-kpi-d">{nota}</span>}
    </div>
  )
}

export default function Estadisticas({ certificados, trabajos }) {
  const [dias, setDias] = useState(30)
  const reporte = useRef(null)
  const [ocupado, setOcupado] = useState(false)
  const serie = useMemo(serieSimulada, [])

  const actual = serie.slice(-dias)
  const previo = serie.slice(-dias * 2, -dias)
  const suma = (arr, k) => arr.reduce((a, d) => a + d[k], 0)
  const visitas = suma(actual, 'visitas')
  const clics = suma(actual, 'clics')
  const desde = actual[0].fecha
  const certs = certificados.filter((c) => c.fecha >= desde).length
  const agenda = trabajos.filter((t) => t.fecha >= desde).length
  const tasa = visitas ? (clics / visitas) * 100 : 0
  const tasaPrev = suma(previo, 'visitas') ? (suma(previo, 'clics') / suma(previo, 'visitas')) * 100 : 0

  // Reparto fijo por servicio/origen: el resto se asigna al primero para que sume exacto
  const repartir = (total, pesos) => {
    const filas = pesos.map(([nombre, p]) => ({ nombre, valor: Math.round(total * p) }))
    filas[0].valor += total - filas.reduce((a, f) => a + f.valor, 0)
    return filas
  }
  const porServicio = repartir(clics, SERVICIOS)
  const porOrigen = repartir(visitas, ORIGENES)

  const descargar = async () => {
    setOcupado(true)
    try {
      await document.fonts.ready
      const canvas = await html2canvas(reporte.current, {
        scale: 2, backgroundColor: '#070708', logging: false,
        ignoreElements: (el) => el.classList?.contains('st-tabla') || el.classList?.contains('st-aviso'),
        onclone: (doc) => { const h = doc.querySelector('.st-rep-head'); if (h) h.style.display = 'flex' },
      })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const w = 190, h = (canvas.height / canvas.width) * w
      const k = Math.min(1, 277 / h)
      pdf.setFillColor(7, 7, 8); pdf.rect(0, 0, 210, 297, 'F')
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 10 + (w - w * k) / 2, 10, w * k, h * k)
      pdf.save(`Reporte VP Unicars - ultimos ${dias} dias.pdf`)
    } finally { setOcupado(false) }
  }

  return (
    <main className="adm-main st">
      <div className="adm-list-head">
        <h1 className="adm-h1"><Icon icon={faChartLine} /> Estadísticas</h1>
        <button className="adm-btn" onClick={descargar} disabled={ocupado}><Icon icon={faFilePdf} /> {ocupado ? 'Generando…' : 'Descargar reporte'}</button>
      </div>

      <div className="st-filtros">
        {RANGOS.map(([n, t]) => (
          <button key={n} className={`adm-chip ${dias === n ? 'is-on' : ''}`} onClick={() => setDias(n)}>Últimos {t}</button>
        ))}
      </div>

      <div ref={reporte} className="st-reporte">
        {/* Encabezado que solo aparece en el PDF */}
        <div className="st-rep-head">
          <img src="/admin/logo-vp.png" alt="" />
          <div><b>Reporte de la página web</b><span>Últimos {dias} días · {fechaCorta(actual[0].fecha)} al {fechaCorta(actual[actual.length - 1].fecha)} · generado el {fechaLocal().split('-').reverse().join('/')}</span></div>
        </div>
        <p className="st-aviso"><Icon icon={faCircleInfo} /> Datos de visitas y clics simulados para la demo. En la versión real vienen de la página publicada.</p>

        <div className="st-kpis">
          <Kpi titulo="Visitas a la página" valor={visitas} previo={suma(previo, 'visitas')} />
          <Kpi titulo="Cotizaciones por WhatsApp" valor={clics} previo={suma(previo, 'clics')} />
          <Kpi titulo="Visitas que cotizan" valor={tasa} texto={tasa.toFixed(1).replace('.', ',')} sufijo="%" previo={tasaPrev || null} />
          <Kpi titulo="Certificados emitidos" valor={certs} nota="Desde el panel" />
          <Kpi titulo="Trabajos agendados" valor={agenda} nota="Desde la agenda" />
        </div>

        <section className="st-card">
          <header><h2>Visitas por día</h2><span>Pasa el mouse o usa las flechas para ver cada día</span></header>
          <GraficoVisitas datos={actual} />
          <details className="st-tabla">
            <summary>Ver datos en tabla</summary>
            <table>
              <thead><tr><th>Fecha</th><th>Visitas</th><th>Clics a WhatsApp</th></tr></thead>
              <tbody>{[...actual].reverse().map((d) => <tr key={d.fecha}><td>{d.fecha.split('-').reverse().join('/')}</td><td>{fmt(d.visitas)}</td><td>{fmt(d.clics)}</td></tr>)}</tbody>
            </table>
          </details>
        </section>

        <div className="st-dos">
          <section className="st-card">
            <header><h2>Cotizaciones por servicio</h2><span>Botones "Cotizar" de la página</span></header>
            <Barras filas={porServicio} color={C_COTIZ} unidad="cotizaciones" />
          </section>
          <section className="st-card">
            <header><h2>De dónde llegan las visitas</h2><span>Origen del tráfico</span></header>
            <Barras filas={porOrigen} color={C_VISITAS} unidad="visitas" />
          </section>
        </div>
      </div>
    </main>
  )
}
