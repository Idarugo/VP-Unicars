import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { aplicarContenido } from './data.js'
import { publicService } from './services/publicService.js'
import { iniciarMedicion } from './lib/medicion.js'
import './fuentes.css'
import './styles.css'

const dibujar = () => ReactDOM.createRoot(document.getElementById('root')).render(<App />)

// El contenido editable viene de la base de datos. Si tarda más de 1,5 s se muestra el contenido base.
const control = new AbortController()
const espera = setTimeout(() => control.abort(), 1500)
publicService.getContenido(control.signal)
  .then((r) => aplicarContenido(r?.data || {}))
  .catch(() => {})
  .finally(() => { clearTimeout(espera); dibujar(); iniciarMedicion() })
