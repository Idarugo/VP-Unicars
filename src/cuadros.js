// Cuadros para las secciones que avanzan con el scroll (portada y procesos).
//
// Por qué así: si se dibuja un <img> en un canvas, el navegador vuelve a decodificar la imagen
// en ese mismo cuadro (≈10 ms cada vez en un celular) y el scroll se traba. Con ImageBitmap la
// decodificación se hace en segundo plano y dibujar es instantáneo. Para no llenar la memoria
// del teléfono, solo se mantienen decodificados los cuadros cercanos a la posición actual;
// los demás quedan comprimidos (pesan poco) y se decodifican cuando hacen falta.
export class Secuencia {
  constructor(urls, { alListo, antes = 8, despues = 16 } = {}) {
    this.urls = urls
    this.blobs = new Array(urls.length)
    this.bitmaps = new Array(urls.length)
    this.pendientes = new Set()
    this.alListo = alListo
    this.antes = antes
    this.despues = despues
    this.actual = 0
    this.vivo = true
  }

  // Descarga (comprimido) los cuadros indicados; los cercanos a la posición actual se decodifican
  descargar(indices, prioridad) {
    for (const i of indices) {
      if (this.blobs[i] || this.blobs[i] === null) continue
      this.blobs[i] = null // en camino
      fetch(this.urls[i], prioridad ? { priority: prioridad } : undefined)
        .then((r) => r.blob())
        .then((b) => { if (!this.vivo) return; this.blobs[i] = b; if (this.cerca(i)) this.decodificar(i) })
        .catch(() => { this.blobs[i] = undefined })
    }
  }

  cerca(i) { return i >= this.actual - this.antes && i <= this.actual + this.despues }

  decodificar(i) {
    if (this.bitmaps[i] || this.pendientes.has(i) || !(this.blobs[i] instanceof Blob)) return
    this.pendientes.add(i)
    createImageBitmap(this.blobs[i])
      .then((bmp) => {
        this.pendientes.delete(i)
        if (!this.vivo || !this.cerca(i)) { bmp.close(); return }
        this.bitmaps[i] = bmp
        this.alListo?.(i)
      })
      .catch(() => this.pendientes.delete(i))
  }

  // Avisa la posición actual: decodifica alrededor y libera lo que quedó lejos
  mover(i) {
    this.actual = i
    const n = this.urls.length
    for (let k = Math.max(0, i - this.antes); k <= Math.min(n - 1, i + this.despues); k++) this.decodificar(k)
    for (let k = 0; k < n; k++) {
      if (this.bitmaps[k] && (k < i - this.antes * 2 || k > i + this.despues * 2)) { this.bitmaps[k].close(); this.bitmaps[k] = undefined }
    }
  }

  // El cuadro decodificado más cercano al pedido (o -1 si todavía no hay ninguno)
  cercano(i) {
    for (let d = 0; d < this.urls.length; d++) {
      if (this.bitmaps[i - d]) return i - d
      if (this.bitmaps[i + d]) return i + d
    }
    return -1
  }

  destruir() {
    this.vivo = false
    this.bitmaps.forEach((b) => b?.close())
  }
}

// Ejecuta cuando el navegador está libre (sin competir con la animación de entrada)
export const cuandoLibre = (fn, espera = 1500) =>
  (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: espera }) : setTimeout(fn, 300))
