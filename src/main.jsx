import React from 'react'
import ReactDOM from 'react-dom/client'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App.jsx'
import { aplicarContenido } from './data.js'
import { publicService } from './services/publicService.js'
import { iniciarMedicion } from './lib/medicion.js'
import './styles.css'

// La página se dibuja al instante con el contenido original (la portada no depende de la base de datos).
// El contenido editado desde el panel llega en paralelo y se aplica apenas responde el servidor.
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
iniciarMedicion()

publicService.getContenido()
  .then((r) => {
    if (!r?.data || !Object.keys(r.data).some((k) => k !== 'version')) return // sin cambios: ya está todo
    aplicarContenido(r.data)
    root.render(<App />)
    // Las secciones con animación al deslizar recalculan su largo (pueden tener más o menos tarjetas)
    requestAnimationFrame(() => ScrollTrigger.refresh())
  })
  .catch(() => {}) // sin conexión al backend: queda el contenido original
