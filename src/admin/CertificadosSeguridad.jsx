import { useEffect, useRef, useState } from 'react'
import CertificadoSeguridad from './CertificadoSeguridad.jsx'
import FormularioSeguridad, { superficieVacia } from './FormularioSeguridad.jsx'
import Vista from './Vista.jsx'
import Paginacion from './Paginacion.jsx'
import { fechaLocal } from './store.js'
import { generarPDF, descargar, compartir, nombreArchivoSeguridad } from './pdf.js'
import { exito, info, error as alertaError, confirmar, escapar, pedirTexto } from './alertas.js'
import { folioSeguridad, m2, urlVerificacionSeguridad } from './config.js'
import { useAuthStore } from '../stores/authStore.js'
import { useAgendaStore } from '../stores/agendaStore.js'
import { useCertificadoSeguridadStore } from '../stores/certificadoSeguridadStore.js'
import {
  Icon, faPlus, faMagnifyingGlass, faFilePdf, faArrowLeft, faCopy, faTrash, faWhatsapp, faEye, faQrcode, faBuilding,
} from './iconos.js'

// Sección "Lámina de seguridad": certificados para casas, locales y oficinas (numeración propia LS-0000).
const fechaCorta = (iso) => iso.split('-').reverse().join('/')
const fichaVacia = () => ({ id: '', nombre: '', producto: 'Lámina de seguridad transparente', marca: '', espesorMil: '', caracteristicas: [] })

export const vacioSeguridad = (ficha) => ({
  fecha: fechaLocal(), instalador: '', razonSocial: '', rut: '', inmueble: 'Local comercial', direccion: '', comuna: '',
  contacto: '', telefono: '', superficies: [superficieVacia()], ficha: ficha ? structuredClone(ficha) : fichaVacia(),
  garantia: '', observaciones: '',
})

export default function CertificadosSeguridad({ inicial, onInicialUsado }) {
  const usuario = useAuthStore((s) => s.usuario)
  const puede = useAuthStore((s) => s.puede)
  const equipo = useAgendaStore((s) => s.equipo)
  const st = useCertificadoSeguridadStore()

  const [vista, setVista] = useState('lista') // lista | nuevo | ver
  const [form, setForm] = useState(() => vacioSeguridad())
  const [actual, setActual] = useState(null)
  const [q, setQ] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const exportar = useRef(null)

  const nuevoForm = () => ({ ...vacioSeguridad(useCertificadoSeguridadStore.getState().fichas[0]), instalador: usuario.nombre })

  useEffect(() => { st.fetchResumen(); st.fetchFichas() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cuando llegan las fichas, el formulario vacío toma la primera
  useEffect(() => {
    if (st.fichas.length && !form.ficha.id && !form.ficha.marca) setForm((f) => ({ ...f, ficha: structuredClone(st.fichas[0]) }))
  }, [st.fichas]) // eslint-disable-line react-hooks/exhaustive-deps

  // Desde la agenda: trabajo de láminas de seguridad en domicilio
  useEffect(() => {
    if (!inicial) return
    setForm({ ...nuevoForm(), ...inicial })
    setVista('nuevo')
    onInicialUsado?.()
    info('Datos del trabajo cargados: completa las superficies y la lámina')
  }, [inicial]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (vista !== 'lista') return
    const t = setTimeout(() => st.fetchCertificados({ q, page: 1 }), 250)
    return () => clearTimeout(t)
  }, [q, vista]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (st.error) { alertaError('No se pudo completar', st.error); st.limpiarError() } }, [st.error]) // eslint-disable-line react-hooks/exhaustive-deps

  const payload = () => ({
    ...form,
    superficies: form.superficies.filter((s) => s.ubicacion || s.m2).map((s) => ({ ubicacion: s.ubicacion.trim(), m2: Number(s.m2) })),
    ficha: { ...form.ficha, espesorMil: Number(form.ficha.espesorMil), caracteristicas: form.ficha.caracteristicas.filter((c) => c.k || c.v) },
  })

  const emitir = async () => {
    const c = await st.createCertificado(payload())
    if (!c) return
    setActual(c)
    setVista('ver')
    setForm(nuevoForm())
    exito(`Certificado N° ${folioSeguridad(c.numero)} emitido`)
  }

  const guardarFicha = async () => {
    const f = form.ficha
    const existente = st.fichas.find((x) => x.id === f.id)
    const sugerido = existente?.nombre || `${f.producto.replace(/^Lámina de /i, '').replace(/^\w/, (l) => l.toUpperCase())} ${f.espesorMil || ''} mil`.trim()
    const nombre = await pedirTexto({
      titulo: existente ? 'Guardar ficha de la lámina' : 'Nueva ficha de lámina',
      texto: existente ? 'Deja el mismo nombre para actualizarla, o cámbialo para guardarla como una ficha nueva.' : 'Queda disponible para los próximos certificados.',
      placeholder: 'Ej: Seguridad 8 mil', valor: sugerido, confirmar: 'Guardar ficha',
    })
    if (!nombre?.trim()) return
    const actualiza = existente && nombre.trim() === existente.nombre
    const ficha = {
      ...f, nombre: nombre.trim(), espesorMil: Number(f.espesorMil),
      id: actualiza ? existente.id : '', caracteristicas: f.caracteristicas.filter((c) => c.k || c.v),
    }
    if (await st.guardarFicha(ficha)) {
      const guardada = useCertificadoSeguridadStore.getState().fichas.find((x) => x.nombre === ficha.nombre)
      if (guardada) setForm((prev) => ({ ...prev, ficha: structuredClone(guardada) }))
      exito(actualiza ? `Ficha “${ficha.nombre}” actualizada` : `Ficha “${ficha.nombre}” guardada para los próximos certificados`)
    }
  }

  const pdf = async (accion) => {
    if (!actual || ocupado) return
    setOcupado(true)
    try {
      const blob = await generarPDF(exportar.current, 'a4')
      const nombre = nombreArchivoSeguridad(actual)
      if (accion === 'descargar') { descargar(blob, nombre); exito('PDF descargado') }
      else {
        const saludo = actual.contacto ? `Hola ${actual.contacto.split(' ')[0]}!` : 'Hola!'
        const texto = `${saludo} Les enviamos el certificado de instalación de lámina de seguridad N° ${folioSeguridad(actual.numero)} (${m2(actual.totalM2)} m²) de ${actual.razonSocial}. Pueden verificar su autenticidad con el código QR. Gracias por preferir VP Unicars.`
        const r = await compartir(actual, blob, { nombre, texto })
        if (r === 'descargado') info('PDF descargado: adjúntalo en el chat de WhatsApp')
      }
    } finally { setOcupado(false) }
  }

  const duplicar = (c) => {
    setForm({
      ...nuevoForm(), razonSocial: c.razonSocial, rut: c.rut || '', inmueble: c.inmueble, direccion: c.direccion, comuna: c.comuna || '',
      contacto: c.contacto || '', telefono: c.telefono || '', ficha: structuredClone(c.ficha), garantia: c.garantia || '',
      superficies: c.superficies.map((s) => ({ ubicacion: s.ubicacion, m2: String(s.m2) })),
    })
    setVista('nuevo')
    info('Datos copiados: revisa la fecha y las superficies')
  }

  const anular = async (c) => {
    const ok = await confirmar({
      titulo: `¿Anular el certificado N° ${folioSeguridad(c.numero)}?`,
      html: `De <b>${escapar(c.razonSocial)}</b> · ${escapar(m2(c.totalM2))} m².<br>Queda registrado en el historial y su número no se vuelve a usar.`,
      confirmar: 'Sí, anular', peligro: true,
    })
    if (!ok) return
    if (await st.anularCertificado(c.numero)) { exito(`Certificado N° ${folioSeguridad(c.numero)} anulado`); setVista('lista') }
  }

  const siguiente = st.resumen.siguiente

  return (
    <>
      {vista === 'lista' && (
        <main className="adm-main">
          <div className="adm-list-head">
            <h1 className="adm-h1"><Icon icon={faBuilding} /> Lámina de seguridad</h1>
            {puede('certificados.crear') && (
              <button className="adm-btn" onClick={() => { setForm(nuevoForm()); setVista('nuevo') }}><Icon icon={faPlus} /> Nuevo certificado</button>
            )}
          </div>
          <p className="adm-muted ls-intro">Certificados para casas, locales y oficinas, con el detalle de las superficies y la ficha técnica de la lámina. Numeración propia, separada de los certificados de autos.</p>
          <div className="adm-stats adm-stats--4">
            <div><span>Total emitidos</span><b>{st.resumen.total}</b></div>
            <div><span>Este mes</span><b>{st.resumen.delMes}</b></div>
            <div><span>m² certificados</span><b>{m2(st.resumen.totalM2)}</b></div>
            <div><span>Próximo N°</span><b>{siguiente ? folioSeguridad(siguiente) : '—'}</b></div>
          </div>

          <div className="adm-buscar">
            <Icon icon={faMagnifyingGlass} />
            <input placeholder="Buscar por razón social, RUT, N°, dirección o comuna…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <ul className={`adm-lista ${st.loading ? 'is-loading' : ''}`}>
            {st.certificados.map((c) => (
              <li key={c.numero}>
                <button className="adm-item ls-item" onClick={() => { setActual(c); setVista('ver') }}>
                  <span className="adm-item-num">N° {folioSeguridad(c.numero)}</span>
                  <span className="ls-item-m2">{m2(c.totalM2)} m²</span>
                  <span className="adm-item-cli"><b>{c.razonSocial}</b><small>{c.inmueble} · {[c.direccion, c.comuna].filter(Boolean).join(', ')}</small></span>
                  <span className="adm-item-fecha">{fechaCorta(c.fecha)}</span>
                  <Icon icon={faEye} className="adm-item-ico" />
                </button>
              </li>
            ))}
            {!st.loading && st.certificados.length === 0 && (
              <li className="adm-vacio">{q ? `No hay certificados que coincidan con “${q}”.` : 'Todavía no hay certificados de lámina de seguridad. Emite el primero con “Nuevo certificado”.'}</li>
            )}
          </ul>

          {st.meta.total > st.meta.limite && (
            <Paginacion
              pagina={st.meta.pagina} total={st.meta.paginas} items={st.meta.total} porPagina={st.meta.limite}
              onCambio={(n) => { st.fetchCertificados({ q, page: n }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            />
          )}
        </main>
      )}

      {vista === 'nuevo' && (
        <main className="adm-main adm-split">
          <div>
            <button className="adm-back" onClick={() => setVista('lista')}><Icon icon={faArrowLeft} /> Lámina de seguridad</button>
            <h1 className="adm-h1"><Icon icon={faBuilding} /> Nuevo certificado</h1>
            <FormularioSeguridad
              f={form} set={setForm} instaladores={equipo.map((p) => p.nombre)} fichas={st.fichas}
              onGuardarFicha={puede('certificados.crear') ? guardarFicha : null} onSubmit={emitir}
              numero={siguiente ? folioSeguridad(siguiente) : '—'} guardando={st.saving}
            />
          </div>
          <aside className="adm-preview">
            <p className="adm-preview-t">Vista previa en vivo</p>
            <Vista c={{ ...payload(), numeroPreview: siguiente }} Documento={CertificadoSeguridad} ancho={794} alto={1123} />
          </aside>
        </main>
      )}

      {vista === 'ver' && actual && (
        <main className="adm-main">
          <button className="adm-back" onClick={() => setVista('lista')}><Icon icon={faArrowLeft} /> Lámina de seguridad</button>
          <div className="adm-ver-head">
            <h1 className="adm-h1">N° {folioSeguridad(actual.numero)} · {actual.razonSocial}</h1>
            <div className="adm-acciones">
              <button className="adm-btn" disabled={ocupado} onClick={() => pdf('descargar')}><Icon icon={faFilePdf} /> {ocupado ? 'Generando…' : 'Descargar PDF'}</button>
              <button className="adm-btn adm-btn--wa" disabled={ocupado} onClick={() => pdf('compartir')}><Icon icon={faWhatsapp} /> Enviar por WhatsApp</button>
              <a className="adm-btn adm-btn--ghost" href={urlVerificacionSeguridad(actual)} target="_blank" rel="noreferrer"><Icon icon={faQrcode} /> Verificación</a>
              {puede('certificados.crear') && <button className="adm-btn adm-btn--ghost" onClick={() => duplicar(actual)}><Icon icon={faCopy} /> Usar datos</button>}
              {puede('certificados.anular') && (
                <button className="adm-icon-btn adm-icon-btn--danger" title="Anular" onClick={() => anular(actual)}><Icon icon={faTrash} /></button>
              )}
            </div>
          </div>
          <div className="ls-ver"><Vista c={actual} Documento={CertificadoSeguridad} ancho={794} alto={1123} /></div>
        </main>
      )}

      {actual && (
        <div className="adm-export" aria-hidden="true">
          <CertificadoSeguridad c={actual} ref={exportar} />
        </div>
      )}
    </>
  )
}
