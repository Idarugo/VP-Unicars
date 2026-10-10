import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// Escena 3D de la portada: logo VP extruido en metal dorado, una lámina de
// polarizado que lo cruza y estelas de luz que reaccionan a la velocidad del scroll.
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 72">
  <path d="M2 8 H20 L32 42 L50 8 H66 L38 64 H26 Z"/>
  <path fill-rule="evenodd" d="M70 8 H104 C115 8 120 15 117 25 L115 32 C112 42 105 46 95 46 H80 L73 64 H58 Z M84 21 L79 33 H95 C99 33 101 31 102 28 L103 25 C104 22 102 21 99 21 Z"/>
</svg>`

export function crearEscena(canvas, { movil = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, movil ? 1.5 : 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200)
  camera.position.set(0, 0, 14)

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  // Luces de acento (amarilla y fría) para reflejos tipo estudio de autos
  const key = new THREE.PointLight(0xffc800, 60, 40)
  key.position.set(-6, 4, 6)
  const rim = new THREE.PointLight(0x7fb8ff, 40, 40)
  rim.position.set(7, -2, 4)
  scene.add(key, rim)

  // --- Logo VP extruido ---
  const data = new SVGLoader().parse(LOGO_SVG)
  const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p))
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: 14, bevelEnabled: true, bevelThickness: 2.2, bevelSize: 1.4, bevelSegments: 6, curveSegments: 24,
  })
  geo.center()
  geo.computeVertexNormals()
  const oro = new THREE.MeshPhysicalMaterial({
    color: 0xffc400, metalness: 1, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4,
  })
  const logo = new THREE.Mesh(geo, oro)
  const grupo = new THREE.Group()
  grupo.add(logo)
  scene.add(grupo)

  // --- Lámina de polarizado: vidrio oscuro que cruza el logo ---
  const lamina = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 7, 1, 1),
    new THREE.MeshPhysicalMaterial({
      color: 0x0a0d12, metalness: 0.1, roughness: 0.05, transmission: 0.55, thickness: 0.4,
      transparent: true, opacity: 0.85, clearcoat: 1, envMapIntensity: 2, side: THREE.DoubleSide,
    }),
  )
  lamina.position.set(-9, 0, 1.6)
  lamina.rotation.y = -0.35
  scene.add(lamina)

  // --- Estelas de luz (como un túnel a alta velocidad) ---
  const N = movil ? 110 : 240
  const estelas = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.025, 0.025, 1),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    N,
  )
  const colA = new THREE.Color(0xffc800).multiplyScalar(2.2)
  const colB = new THREE.Color(0xffffff).multiplyScalar(1.6)
  const pos = []
  const dummy = new THREE.Object3D()
  for (let i = 0; i < N; i++) {
    const ang = Math.random() * Math.PI * 2
    const r = 3.2 + Math.random() * 7
    pos.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r * 0.62, z: -80 + Math.random() * 90, l: 0.6 + Math.random() * 2.2, v: 0.6 + Math.random() })
    estelas.setColorAt(i, Math.random() < 0.35 ? colA : colB)
  }
  scene.add(estelas)

  // --- Estado controlado desde afuera ---
  const estado = {
    mx: 0, my: 0,          // mouse normalizado (-1..1)
    rx: 0, ry: 0,          // rotación actual (seguimiento con resorte)
    vrx: 0, vry: 0,        // velocidad del resorte
    scroll: 0,             // 0..1 progreso del hero
    velocidad: 0,          // velocidad de scroll (Lenis)
    intro: 0,              // 0..1 animación de entrada
    lamina: 0,             // 0..1 recorrido de la lámina
    activo: true,
  }

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    // El logo ocupa ~60% del ancho visible, con tope en pantallas grandes
    const visW = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect
    const s = Math.min(0.056, (visW * 0.6) / 124)
    logo.scale.set(s, -s, s) // el eje Y del SVG está invertido
  }
  resize()

  const reloj = new THREE.Clock()
  let raf = 0
  const frame = () => {
    raf = requestAnimationFrame(frame)
    if (!estado.activo) return
    const dt = Math.min(reloj.getDelta(), 0.05)
    const t = reloj.elapsedTime

    // Resorte críticamente amortiguado hacia el mouse (sin rebote, interrumpible)
    const k = 38, c = 2 * Math.sqrt(k)
    const tx = estado.my * 0.35, ty = estado.mx * 0.6
    estado.vrx += ((tx - estado.rx) * k - estado.vrx * c) * dt
    estado.vry += ((ty - estado.ry) * k - estado.vry * c) * dt
    estado.rx += estado.vrx * dt
    estado.ry += estado.vry * dt

    const sc = estado.scroll
    grupo.rotation.x = estado.rx + Math.sin(t * 0.6) * 0.04 + sc * 0.6
    grupo.rotation.y = estado.ry + (1 - estado.intro) * -2.4 + sc * 2.2
    grupo.position.z = (1 - estado.intro) * -12 + sc * 7
    grupo.position.y = (movil ? 0.35 : 0.75) + Math.sin(t * 0.8) * 0.08 + sc * 1.2
    oro.opacity = 1

    // La lámina cruza de izquierda a derecha frente al logo
    lamina.position.x = -9 + estado.lamina * 18
    lamina.material.opacity = 0.85 * Math.sin(Math.PI * Math.min(1, estado.lamina))

    // Luces que orbitan para que el metal "respire"
    key.position.x = Math.cos(t * 0.5) * 7
    key.position.y = 3 + Math.sin(t * 0.7) * 2

    // Estelas: más rápidas cuando el usuario hace scroll rápido
    const vel = 14 + Math.min(Math.abs(estado.velocidad) * 4, 120) + sc * 40
    for (let i = 0; i < N; i++) {
      const p = pos[i]
      p.z += vel * p.v * dt
      if (p.z > 8) p.z = -80
      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.set(1, 1, p.l * (1 + Math.abs(estado.velocidad) * 0.08))
      dummy.updateMatrix()
      estelas.setMatrixAt(i, dummy.matrix)
    }
    estelas.instanceMatrix.needsUpdate = true

    camera.position.x += (estado.mx * 0.6 - camera.position.x) * 0.04
    camera.position.y += (-estado.my * 0.4 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera)
  }
  frame()

  window.addEventListener('resize', resize)
  return {
    estado,
    destruir() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      geo.dispose(); oro.dispose(); estelas.geometry.dispose(); estelas.material.dispose()
      lamina.geometry.dispose(); lamina.material.dispose(); pmrem.dispose(); renderer.dispose()
    },
  }
}
