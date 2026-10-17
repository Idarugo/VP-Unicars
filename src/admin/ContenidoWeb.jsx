import { useEffect, useMemo, useRef, useState } from 'react'
import { base, urlFoto } from '../data.js'
import { useContenidoStore } from '../stores/contenidoStore.js'
import { exito, error as alertaError, confirmar, escapar } from './alertas.js'
import {
  Icon, faFloppyDisk, faRotateLeft, faArrowUp, faArrowDown, faTrash, faPlus, faEye, faEyeSlash, faDownload, faUpload,
  faArrowUpRightFromSquare, faCopy, faClockRotateLeft, faImage, faXmark, faChevronDown, faMagnifyingGlass, faCircleCheck,
} from './iconos.js'

// Fotos que ya vienen con la página (carpeta public/fotos)
const FOTOS_PAGINA = [
  'ahumado-focos.webp', 'arquitectonico-bronce.webp', 'arquitectonico.webp', 'bmw-520i.jpg', 'fibra-carbono.webp', 'kill-chrome.jpg',
  'laminas-seguridad.webp', 'nanocarbon.jpg', 'nanoceramico.jpg', 'personalizacion.jpg', 'piano-black.jpg', 'pilares-carbono.jpg',
  'pilares-ppf.webp', 'polarizado-5.webp', 'porsche-ppf.jpg', 'ppf-moto.webp', 'ppf-trabajos.webp', 'privacidad.jpg', 'tecnica.webp',
  'territory-ppf.jpg', 'tornasol.webp',
].map((f) => `/fotos/${f}`)

/* ---------------------- Normalización según el esquema ---------------------- */
const vacioPara = (campo) => {
  if (campo.tipo === 'tags') return []
  if (campo.tipo === 'booleano') return false
  if (campo.tipo === 'numero') return null
  if (campo.tipo === 'opcion') return campo.opciones?.[0]?.valor ?? ''
  if (campo.tipo === 'color') return '#ffe600'
  return ''
}
const normalizarObjeto = (seccion, obj = {}) =>
  Object.fromEntries(seccion.campos.map((c) => [c.clave, obj[c.clave] ?? vacioPara(c)]))
const normalizarItem = (seccion, item = {}) => ({ id: item.id, oculto: Boolean(item.oculto), ...normalizarObjeto(seccion, item) })
const normalizar = (seccion, valor) =>
  seccion.tipo === 'objeto' ? normalizarObjeto(seccion, valor) : (valor || []).map((x) => normalizarItem(seccion, x))

const nuevoId = () => Math.random().toString(36).slice(2, 10)
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// Lo que hoy muestra la página para cada sección: lo guardado o, si no hay, el original
const efectivo = (esquema, guardado) =>
  Object.fromEntries(esquema.map((s) => [s.clave, normalizar(s, guardado?.[s.clave] ?? base[s.clave])]))

const faltantes = (esquema, borrador) => {
  const errores = []
  for (const s of esquema) {
    const items = s.tipo === 'objeto' ? [borrador[s.clave]] : borrador[s.clave]
    items.forEach((item, i) => {
      const faltan = s.campos.filter((c) => c.requerido && (item[c.clave] === '' || item[c.clave] == null)).map((c) => c.etiqueta)
      if (faltan.length) errores.push(`${s.titulo}${s.tipo === 'lista' ? ` #${i + 1}` : ''}: ${faltan.join(', ')}`)
    })
  }
  return errores
}

function bajar(nombre, contenido) {
  const url = URL.createObjectURL(new Blob([contenido], { type: 'application/json' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre })
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/* ------------------------------- Selector de fotos ------------------------------- */
function SelectorFotos({ actual, onElegir, onClose }) {
  const { fotos, subiendo, subirFoto } = useContenidoStore()
  const archivo = useRef(null)
  const subir = async (f) => {
    if (!f) return
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return alertaError('Formato no permitido', 'La foto debe ser JPG, PNG o WEBP.')
    if (f.size > 6 * 1024 * 1024) return alertaError('Foto muy pesada', 'El máximo es 6 MB. Puedes achicarla en squoosh.app.')
    const r = await subirFoto(f)
    if (!r.ok) return alertaError('No se pudo subir', r.message)
    exito('Foto subida')
    onElegir(r.url)
  }
  const Grilla = ({ lista }) => (
    <div className="mt-fotos">
      {lista.map((url) => (
        <button type="button" key={url} className={`mt-foto ${actual === url ? 'is-on' : ''}`} onClick={() => onElegir(url)}>
          <img src={urlFoto(url)} alt="" loading="lazy" />
        </button>
      ))}
    </div>
  )
  return (
    <div className="ag-modal-bg" onClick={onClose}>
      <div className="ag-modal cw-fotos-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); subir(e.dataTransfer.files?.[0]) }}>
        <div className="ag-modal-head">
          <h2>Elegir foto</h2>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Cerrar"><Icon icon={faXmark} /></button>
        </div>
        <button type="button" className="cw-drop" onClick={() => archivo.current.click()} disabled={subiendo}>
          <Icon icon={faUpload} /> {subiendo ? 'Subiendo…' : 'Subir foto nueva'} <small>o arrástrala aquí · JPG, PNG o WEBP hasta 6 MB</small>
        </button>
        <input ref={archivo} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { subir(e.target.files?.[0]); e.target.value = '' }} />
        <div className="cw-fotos-scroll">
          {fotos.length > 0 && <><p className="mt-sub">Subidas desde el panel</p><Grilla lista={fotos.map((f) => f.url)} /></>}
          <p className="mt-sub">Fotos de la página</p>
          <Grilla lista={FOTOS_PAGINA} />
        </div>
        <div className="ag-modal-foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => onElegir('')}>Sin foto</button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Selector de videos (TV) ------------------------------- */
const VIDEOS_PAGINA = ['/tv/vp-unicars.mp4', '/tv/vp-asi-trabajamos.mp4', '/tv/vp-elige-tu-polarizado.mp4', '/tv/vp-clientes-felices.mp4']
const nombreVideo = (u) => u.split('/').pop()

function SelectorVideos({ actual, onElegir, onClose }) {
  const { videos, subiendo, subirVideo, eliminarVideo } = useContenidoStore()
  const archivo = useRef(null)
  const subir = async (f) => {
    if (!f) return
    if (!/^video\/(mp4|webm|quicktime)$/.test(f.type)) return alertaError('Formato no permitido', 'El video debe ser MP4 o WEBM.')
    if (f.size > 400 * 1024 * 1024) return alertaError('Video muy pesado', 'El máximo es 400 MB.')
    const r = await subirVideo(f)
    if (!r.ok) return alertaError('No se pudo subir', r.message)
    exito('Video subido')
    onElegir(r.url)
  }
  const borrar = async (v) => {
    if (!(await confirmar({ titulo: '¿Eliminar este video?', text: v.nombre, confirmar: 'Sí, eliminar', peligro: true }))) return
    const r = await eliminarVideo(v.nombre)
    if (r.ok) exito('Video eliminado'); else alertaError('No se pudo eliminar', r.message)
  }
  const Item = ({ url, v }) => (
    <li className={`cw-video-item ${actual === url ? 'is-on' : ''}`}>
      <video src={urlFoto(url)} muted preload="metadata" />
      <span>{v ? `${Math.round(v.tamano / 1048576)} MB` : 'Incluido en la página'}</span>
      <button type="button" className="adm-btn" onClick={() => onElegir(url)}>{actual === url ? 'Elegido' : 'Elegir'}</button>
      {v && <button type="button" className="adm-icon-btn adm-icon-btn--danger" title="Eliminar video" onClick={() => borrar(v)}><Icon icon={faTrash} /></button>}
    </li>
  )
  return (
    <div className="ag-modal-bg" onClick={onClose}>
      <div className="ag-modal cw-fotos-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); subir(e.dataTransfer.files?.[0]) }}>
        <div className="ag-modal-head">
          <h2>Elegir video</h2>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Cerrar"><Icon icon={faXmark} /></button>
        </div>
        <button type="button" className="cw-drop" onClick={() => archivo.current.click()} disabled={subiendo}>
          <Icon icon={faUpload} /> {subiendo ? 'Subiendo… (puede tardar unos minutos)' : 'Subir video nuevo'} <small>o arrástralo aquí · MP4 horizontal 16:9, hasta 400 MB</small>
        </button>
        <input ref={archivo} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => { subir(e.target.files?.[0]); e.target.value = '' }} />
        <ul className="cw-videos">
          {videos.map((v) => <Item key={v.url} url={v.url} v={v} />)}
          {VIDEOS_PAGINA.map((u) => <Item key={u} url={u} />)}
        </ul>
      </div>
    </div>
  )
}

/* ------------------------------------ Campos ------------------------------------ */
function Tags({ valor, onChange, max }) {
  const [t, setT] = useState('')
  const agregar = () => {
    const v = t.trim().slice(0, max || 30)
    if (v && !valor.includes(v) && valor.length < 8) onChange([...valor, v])
    setT('')
  }
  return (
    <div className="cw-tags">
      {valor.map((x) => (
        <span key={x} className="cw-tag">{x}<button type="button" onClick={() => onChange(valor.filter((y) => y !== x))} aria-label={`Quitar ${x}`}><Icon icon={faXmark} /></button></span>
      ))}
      {valor.length < 8 && (
        <input value={t} placeholder="Agregar…" onChange={(e) => setT(e.target.value)} onBlur={agregar}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); agregar() } }} />
      )}
    </div>
  )
}

function Campo({ campo, valor, onChange }) {
  const [elegir, setElegir] = useState(false)
  const comun = { value: valor ?? '', placeholder: campo.placeholder, onChange: (e) => onChange(e.target.value) }
  let control
  switch (campo.tipo) {
    case 'textoLargo':
      control = <><textarea rows={3} maxLength={campo.max} {...comun} />{campo.max && <small className="cw-cuenta">{(valor || '').length}/{campo.max}</small>}</>
      break
    case 'numero':
      control = <input type="number" min={campo.min} max={campo.max} step="any" value={valor ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />
      break
    case 'tags':
      control = <Tags valor={valor || []} onChange={onChange} max={campo.max} />
      break
    case 'booleano':
      control = <span className="mt-switch"><input type="checkbox" checked={Boolean(valor)} onChange={(e) => onChange(e.target.checked)} /><span /></span>
      break
    case 'color':
      control = <span className="cw-color"><input type="color" value={valor || '#ffe600'} onChange={(e) => onChange(e.target.value)} /><code>{valor}</code></span>
      break
    case 'opcion':
      control = <select value={valor} onChange={(e) => onChange(e.target.value)}>{campo.opciones.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}</select>
      break
    case 'foto':
      control = (
        <span className="cw-foto">
          {valor ? <img src={urlFoto(valor)} alt="" /> : <span className="cw-foto-vacia"><Icon icon={faImage} /></span>}
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setElegir(true)}><Icon icon={faImage} /> {valor ? 'Cambiar foto' : 'Elegir foto'}</button>
          {valor && <button type="button" className="adm-icon-btn" title="Quitar foto" onClick={() => onChange('')}><Icon icon={faXmark} /></button>}
          {elegir && <SelectorFotos actual={valor} onClose={() => setElegir(false)} onElegir={(u) => { onChange(u); setElegir(false) }} />}
        </span>
      )
      break
    case 'video':
      control = (
        <span className="cw-foto">
          {valor ? <video className="cw-video-prev" src={urlFoto(valor)} muted preload="metadata" /> : <span className="cw-foto-vacia"><Icon icon={faImage} /></span>}
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setElegir(true)}><Icon icon={faUpload} /> {valor ? 'Cambiar video' : 'Elegir o subir video'}</button>
          {valor && <small className="cw-ayuda">{nombreVideo(valor)}</small>}
          {elegir && <SelectorVideos actual={valor} onClose={() => setElegir(false)} onElegir={(u) => { onChange(u); setElegir(false) }} />}
        </span>
      )
      break
    case 'telefono':
      control = <input inputMode="numeric" {...comun} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} />
      break
    case 'url':
      control = <input type="url" {...comun} />
      break
    default:
      control = <input maxLength={campo.max} {...comun} />
  }
  return (
    <label className={`cw-campo cw-campo--${campo.tipo}`}>
      <span>{campo.etiqueta}{campo.requerido && <b className="cw-req"> *</b>}</span>
      {control}
      {campo.ayuda && <small className="cw-ayuda">{campo.ayuda}</small>}
    </label>
  )
}

const Formulario = ({ seccion, valor, onChange }) => (
  <div className="adm-form cw-grid">
    {seccion.campos.map((c) => (
      <Campo key={c.clave} campo={c} valor={valor[c.clave]} onChange={(v) => onChange({ ...valor, [c.clave]: v })} />
    ))}
  </div>
)

/* ------------------------------------- Listas ------------------------------------- */
function EditorLista({ seccion, items, onChange }) {
  const [abierto, setAbierto] = useState(null)
  const [q, setQ] = useState('')
  const fotoCampo = seccion.campos.find((c) => c.tipo === 'foto')
  const titular = (it) => it[seccion.titular] || `${seccion.nombreItem || 'Elemento'} sin nombre`
  const lleno = items.length >= (seccion.maxItems || 50)
  const visibles = q ? items.filter((it) => JSON.stringify(it).toLowerCase().includes(q.toLowerCase())) : items

  const cambiar = (id, nuevo) => onChange(items.map((it) => (it.id === id ? nuevo : it)))
  const mover = (i, d) => { const l = [...items]; [l[i], l[i + d]] = [l[i + d], l[i]]; onChange(l) }
  const agregar = () => {
    const nuevo = { ...normalizarItem(seccion, {}), id: nuevoId() }
    onChange([...items, nuevo]); setAbierto(nuevo.id); setQ('')
    setTimeout(() => document.getElementById(`cw-${nuevo.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
  }
  const duplicar = (it, i) => {
    const copia = { ...structuredClone(it), id: nuevoId(), [seccion.titular]: `${it[seccion.titular]} (copia)` }
    const l = [...items]; l.splice(i + 1, 0, copia); onChange(l); setAbierto(copia.id)
  }
  const eliminar = async (it) => {
    const ok = await confirmar({
      titulo: `¿Eliminar ${seccion.nombreItem || 'elemento'}?`,
      html: `<b>${escapar(titular(it))}</b> se quitará de la página al publicar.<br>Si solo quieres esconderlo por un tiempo, usa el ojo para ocultarlo.`,
      confirmar: 'Sí, eliminar', peligro: true,
    })
    if (ok) onChange(items.filter((x) => x.id !== it.id))
  }

  return (
    <>
      {items.length > 6 && (
        <div className="adm-buscar cw-buscar"><Icon icon={faMagnifyingGlass} /><input placeholder={`Buscar en ${seccion.titulo.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} /></div>
      )}
      <ul className="mt-items cw-items">
        {visibles.map((it) => {
          const i = items.indexOf(it)
          return (
            <li key={it.id} id={`cw-${it.id}`} className={`${it.oculto ? 'is-oculto' : ''} ${abierto === it.id ? 'is-abierto' : ''}`}>
              <div className="mt-item-head">
                {fotoCampo && (it[fotoCampo.clave] ? <img src={urlFoto(it[fotoCampo.clave])} alt="" /> : <span className="mt-item-sinfoto" />)}
                <button type="button" className="mt-item-t" onClick={() => setAbierto(abierto === it.id ? null : it.id)}>
                  <b>{titular(it)}</b><small>{it.oculto ? 'Oculto en la página' : 'Visible'}</small>
                </button>
                <div className="cw-item-btns">
                  <button type="button" className="adm-icon-btn" disabled={i === 0 || !!q} onClick={() => mover(i, -1)} title="Subir"><Icon icon={faArrowUp} /></button>
                  <button type="button" className="adm-icon-btn" disabled={i === items.length - 1 || !!q} onClick={() => mover(i, 1)} title="Bajar"><Icon icon={faArrowDown} /></button>
                  <button type="button" className="adm-icon-btn" title={it.oculto ? 'Mostrar en la página' : 'Ocultar de la página'} onClick={() => cambiar(it.id, { ...it, oculto: !it.oculto })}>
                    <Icon icon={it.oculto ? faEyeSlash : faEye} />
                  </button>
                  <button type="button" className="adm-icon-btn" disabled={lleno} title="Duplicar" onClick={() => duplicar(it, i)}><Icon icon={faCopy} /></button>
                  <button type="button" className="adm-icon-btn adm-icon-btn--danger" title="Eliminar" onClick={() => eliminar(it)}><Icon icon={faTrash} /></button>
                  <button type="button" className={`adm-icon-btn cw-abrir ${abierto === it.id ? 'is-on' : ''}`} title="Editar" onClick={() => setAbierto(abierto === it.id ? null : it.id)}><Icon icon={faChevronDown} /></button>
                </div>
              </div>
              {abierto === it.id && (
                <div className="mt-item-form">
                  <Formulario seccion={seccion} valor={it} onChange={(v) => cambiar(it.id, v)} />
                </div>
              )}
            </li>
          )
        })}
        {!items.length && <li className="adm-vacio">No hay {seccion.titulo.toLowerCase()}. La sección no se mostrará en la página.</li>}
      </ul>
      <button type="button" className="adm-btn adm-btn--ghost cw-agregar" disabled={lleno} onClick={agregar}>
        <Icon icon={faPlus} /> {lleno ? `Máximo ${seccion.maxItems}` : `Agregar ${seccion.nombreItem || 'elemento'}`}
      </button>
    </>
  )
}

/* ------------------------------ Versiones y fotos ------------------------------ */
const fechaHora = (iso) => new Date(iso).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function Versiones({ sucio, onAntes }) {
  const { versiones, saving, restaurarVersion } = useContenidoStore()
  const volver = async (v) => {
    const ok = await confirmar({
      titulo: '¿Volver a esta versión?',
      html: `La página quedará como estaba el <b>${fechaHora(v.fecha)}</b> (${escapar(v.secciones)}).${sucio ? '<br><br>Los cambios sin publicar se perderán.' : ''}<br>El contenido actual queda guardado como una versión más.`,
      confirmar: 'Sí, volver',
    })
    if (!ok) return
    onAntes()
    const r = await restaurarVersion(v.id)
    if (r.ok) exito('Versión restaurada y publicada'); else alertaError('No se pudo restaurar', r.message)
  }
  return (
    <section className="st-card">
      <header><h2>Versiones anteriores</h2><span>Se guarda una cada vez que se publica (últimas 15)</span></header>
      <ul className="mt-checks">
        {versiones.map((v) => (
          <li key={v.id} className="is-info">
            <Icon icon={faClockRotateLeft} className="mt-check-ico" />
            <div><b>{fechaHora(v.fecha)} · {v.usuario}</b><span>{v.motivo} · tenía: {v.secciones}</span></div>
            <button className="adm-btn adm-btn--ghost" disabled={saving} onClick={() => volver(v)}><Icon icon={faRotateLeft} /> Volver</button>
          </li>
        ))}
        {!versiones.length && <li className="adm-vacio">Todavía no hay versiones: se crean al publicar cambios.</li>}
      </ul>
    </section>
  )
}

function Fotos({ usadas }) {
  const { fotos, subiendo, subirFoto, eliminarFoto } = useContenidoStore()
  const archivo = useRef(null)
  const subir = async (lista) => {
    for (const f of lista) {
      if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 6 * 1024 * 1024) { alertaError('No se pudo subir', `${f.name}: debe ser JPG, PNG o WEBP de hasta 6 MB.`); continue }
      const r = await subirFoto(f)
      if (!r.ok) alertaError('No se pudo subir', r.message)
    }
    exito(lista.length > 1 ? 'Fotos subidas' : 'Foto subida')
  }
  const borrar = async (f) => {
    const ok = await confirmar({ titulo: '¿Eliminar esta foto?', html: `<img src="${urlFoto(f.url)}" alt="" style="max-width:100%;border-radius:12px">`, confirmar: 'Sí, eliminar', peligro: true })
    if (!ok) return
    const r = await eliminarFoto(f.nombre)
    if (r.ok) exito('Foto eliminada'); else alertaError('No se pudo eliminar', r.message)
  }
  return (
    <section className="st-card" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); subir([...e.dataTransfer.files]) }}>
      <header><h2>Fotos subidas</h2><span>{fotos.length} fotos · arrastra fotos aquí para subirlas</span></header>
      <button type="button" className="cw-drop" onClick={() => archivo.current.click()} disabled={subiendo}>
        <Icon icon={faUpload} /> {subiendo ? 'Subiendo…' : 'Subir fotos'} <small>JPG, PNG o WEBP hasta 6 MB · puedes elegir varias</small>
      </button>
      <input ref={archivo} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { subir([...e.target.files]); e.target.value = '' }} />
      <div className="cw-galeria">
        {fotos.map((f) => (
          <figure key={f.nombre}>
            <img src={urlFoto(f.url)} alt="" loading="lazy" />
            <figcaption>
              {usadas.has(f.url) ? <span className="cw-usada"><Icon icon={faCircleCheck} /> En uso</span> : <span>{Math.round(f.tamano / 1024)} KB</span>}
              <button className="adm-icon-btn adm-icon-btn--danger" title="Eliminar" disabled={usadas.has(f.url)} onClick={() => borrar(f)}><Icon icon={faTrash} /></button>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------ Principal ------------------------------------ */
export default function ContenidoWeb({ onSucio }) {
  const { esquema, guardado, loading, saving, error, fetchTodo, guardar, restaurarOriginal } = useContenidoStore()
  const [borrador, setBorrador] = useState(null)
  const [vista, setVista] = useState('negocio')
  const importar = useRef(null)
  const tomarPublicado = useRef(false) // después de restaurar una versión, el borrador se reemplaza

  useEffect(() => { fetchTodo() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const publicado = useMemo(() => (esquema.length && guardado ? efectivo(esquema, guardado) : null), [esquema, guardado])
  const original = useMemo(() => (esquema.length ? efectivo(esquema, {}) : null), [esquema])

  // Cuando cambia lo publicado (yo u otro usuario) y no hay cambios pendientes, se toma lo nuevo
  const pendientes = borrador && publicado ? esquema.filter((s) => !igual(borrador[s.clave], publicado[s.clave])) : []
  useEffect(() => {
    if (publicado && (!borrador || !pendientes.length || tomarPublicado.current)) {
      tomarPublicado.current = false
      setBorrador(publicado)
    }
  }, [publicado]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { onSucio?.(pendientes.length > 0) }, [pendientes.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Aviso del navegador si se cierra la pestaña con cambios sin publicar
  useEffect(() => {
    if (!pendientes.length) return
    const f = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', f)
    return () => window.removeEventListener('beforeunload', f)
  }, [pendientes.length])

  if (error && !borrador) return <p className="adm-error">{error}</p>
  if (loading || !borrador) return <p className="adm-muted">Cargando contenido…</p>

  const usadas = new Set(JSON.stringify(borrador).match(/\/uploads\/fotos\/[\w.-]+/g) || [])
  const seccion = esquema.find((s) => s.clave === vista)

  // Solo se guardan las secciones distintas al original: las demás siguen usando el contenido de la página
  const armarPayload = (b) => Object.fromEntries(esquema.filter((s) => !igual(b[s.clave], original[s.clave])).map((s) => [s.clave, b[s.clave]]))

  const publicar = async () => {
    const errores = faltantes(esquema, borrador)
    if (errores.length) return alertaError('Faltan datos obligatorios', errores.join(' · '))
    const ok = await confirmar({
      titulo: '¿Publicar los cambios?',
      html: `Se actualiza en la página: <b>${pendientes.map((s) => escapar(s.titulo)).join(', ')}</b>.<br>Los visitantes lo ven al instante.`,
      confirmar: 'Sí, publicar', icono: 'info',
    })
    if (!ok) return
    const r = await guardar(armarPayload(borrador))
    if (r.ok) exito('Cambios publicados'); else alertaError('No se pudo publicar', r.message)
  }
  const descartar = async () => {
    if (await confirmar({ titulo: '¿Descartar los cambios?', text: 'Vuelves a lo que está publicado ahora.', confirmar: 'Sí, descartar', peligro: true })) {
      setBorrador(publicado); exito('Cambios descartados')
    }
  }
  const volverOriginal = async () => {
    const ok = await confirmar({
      titulo: '¿Volver al contenido original?',
      html: 'Toda la página queda como se entregó al inicio.<br>Lo actual se guarda en <b>Versiones</b>, así que se puede recuperar.',
      confirmar: 'Sí, volver al original', peligro: true,
    })
    if (!ok) return
    tomarPublicado.current = true
    const r = await restaurarOriginal()
    if (r.ok) exito('Contenido original restaurado'); else alertaError('No se pudo restaurar', r.message)
  }
  const exportar = () => {
    bajar(`contenido-vp-unicars-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ app: 'vp-unicars-contenido', version: 2, fecha: new Date().toISOString(), contenido: borrador }, null, 2))
    exito('Contenido exportado')
  }
  const leerImportado = async (f) => {
    if (!f) return
    try {
      const j = JSON.parse(await f.text())
      const c = j.app === 'vp-unicars-contenido' ? j.contenido : j
      const leer = (s) => {
        if (!c[s.clave]) return borrador[s.clave]
        const v = normalizar(s, c[s.clave])
        return s.tipo === 'lista' ? v.map((x) => ({ ...x, id: x.id || nuevoId() })) : v
      }
      const nuevo = Object.fromEntries(esquema.map((s) => [s.clave, leer(s)]))
      const cambian = esquema.filter((s) => !igual(nuevo[s.clave], borrador[s.clave])).map((s) => s.titulo)
      if (!cambian.length) return alertaError('Nada que importar', 'El archivo no trae cambios respecto a lo que tienes.')
      const ok = await confirmar({ titulo: '¿Importar este contenido?', html: `Cambia: <b>${cambian.map(escapar).join(', ')}</b>.<br>Queda como borrador: revisa y luego presiona <b>Publicar</b>.`, confirmar: 'Importar' })
      if (ok) { setBorrador(nuevo); exito('Contenido importado como borrador') }
    } catch {
      alertaError('Archivo inválido', 'No es un archivo de contenido exportado desde este panel.')
    }
  }

  const conteo = (s) => (s.tipo === 'lista' ? borrador[s.clave].filter((x) => !x.oculto).length : null)

  return (
    <div className="cw">
      <div className={`cw-barra ${pendientes.length ? 'is-sucio' : ''}`}>
        <p>
          {pendientes.length
            ? <><b>Cambios sin publicar</b> en {pendientes.map((s) => s.titulo).join(', ')}</>
            : <><Icon icon={faCircleCheck} /> Todo publicado: lo que ves aquí es lo que muestra la página.</>}
        </p>
        <div className="mt-barra-btns">
          {pendientes.length > 0 && <button className="adm-btn adm-btn--ghost" onClick={descartar} disabled={saving}>Descartar</button>}
          <button className="adm-btn" onClick={publicar} disabled={!pendientes.length || saving}><Icon icon={faFloppyDisk} /> {saving ? 'Publicando…' : 'Publicar cambios'}</button>
        </div>
      </div>

      <div className="cw-layout">
        <nav className="cw-nav">
          {esquema.map((s) => (
            <button key={s.clave} className={`cw-nav-item ${vista === s.clave ? 'is-on' : ''}`} onClick={() => setVista(s.clave)}>
              <span>{s.titulo}</span>
              {pendientes.includes(s) ? <i className="cw-punto" title="Cambios sin publicar" /> : conteo(s) != null && <small>{conteo(s)}</small>}
            </button>
          ))}
          <hr />
          <button className={`cw-nav-item ${vista === 'fotos' ? 'is-on' : ''}`} onClick={() => setVista('fotos')}><span><Icon icon={faImage} /> Fotos</span></button>
          <button className={`cw-nav-item ${vista === 'versiones' ? 'is-on' : ''}`} onClick={() => setVista('versiones')}><span><Icon icon={faClockRotateLeft} /> Versiones</span></button>
          <hr />
          <a className="cw-nav-item" href="/" target="_blank" rel="noreferrer"><span><Icon icon={faArrowUpRightFromSquare} /> Ver página</span></a>
          <button className="cw-nav-item" onClick={exportar}><span><Icon icon={faDownload} /> Exportar JSON</span></button>
          <button className="cw-nav-item" onClick={() => importar.current.click()}><span><Icon icon={faUpload} /> Importar JSON</span></button>
          <button className="cw-nav-item cw-nav-peligro" onClick={volverOriginal}><span><Icon icon={faRotateLeft} /> Volver al original</span></button>
          <input ref={importar} type="file" accept="application/json,.json" hidden onChange={(e) => { leerImportado(e.target.files?.[0]); e.target.value = '' }} />
        </nav>

        <div className="cw-panel">
          {seccion && (
            <section className="st-card">
              <header>
                <h2>{seccion.titulo}</h2>
                <span>{seccion.descripcion}</span>
              </header>
              {seccion.tipo === 'objeto'
                ? <Formulario seccion={seccion} valor={borrador[seccion.clave]} onChange={(v) => setBorrador({ ...borrador, [seccion.clave]: v })} />
                : <EditorLista seccion={seccion} items={borrador[seccion.clave]} onChange={(l) => setBorrador({ ...borrador, [seccion.clave]: l })} />}
              {!igual(borrador[seccion.clave], original[seccion.clave]) && (
                <button className="adm-link cw-original" onClick={async () => {
                  if (await confirmar({ titulo: `¿Volver “${seccion.titulo}” al original?`, text: 'Queda como borrador hasta que publiques.', confirmar: 'Sí' })) {
                    setBorrador({ ...borrador, [seccion.clave]: original[seccion.clave] })
                  }
                }}><Icon icon={faRotateLeft} /> Volver esta sección al original</button>
              )}
            </section>
          )}
          {vista === 'fotos' && <Fotos usadas={usadas} />}
          {vista === 'versiones' && <Versiones sucio={pendientes.length > 0} onAntes={() => { tomarPublicado.current = true }} />}
        </div>
      </div>
    </div>
  )

}
