# VP Unicars

Página web + panel de administración (agenda, certificados, estadísticas y mantención) con base de datos MySQL.

```
backend/   Express + TypeScript + MySQL (routes → controllers → models)
src/       Vite + React
  services/  llamadas a la API (apiClient con token)
  stores/    estado con Zustand
  admin/     panel (/admin) y verificación pública de certificados (/verificar)
```

## Correr en local

Requisitos: Node 18+ y MySQL/MariaDB (XAMPP sirve).

1. Backend

   ```bash
   cd backend
   npm install
   cp .env.example .env    # completar JWT_SECRET (32+ caracteres) y las claves iniciales
   npm run db:init         # crea la base vp_unicars, las tablas y los usuarios soporte/admin
   npm run dev             # http://localhost:3001
   ```

2. Frontend (en otra terminal, desde la raíz)

   ```bash
   npm install
   npm run dev             # http://localhost:5173 · panel en /admin.html
   ```

   En desarrollo Vite redirige `/api` al backend. En producción se define `VITE_API_URL` con la URL del backend.

## Roles

| Rol | Puede |
|---|---|
| Soporte | Todo + Mantención (contenido web, configuración, usuarios, respaldos, historial) |
| Administrador | Agenda de todo el equipo, certificados (emitir y anular), estadísticas |
| Técnico | Solo su agenda, ver y emitir certificados |

Los permisos se validan en el backend. Los certificados no se borran: se anulan y su número no se reutiliza.

## Contenido de la página (Mantención → Contenido web)

Todo el contenido de la página se puede agregar, editar, eliminar, reordenar y ocultar desde el panel: datos del
negocio, servicios, más servicios, trabajos del garage, autos de la cinta, números destacados, niveles de polarizado,
pasos y preguntas frecuentes. También se suben fotos, hay versiones para deshacer y se puede exportar/importar en JSON.

- El contenido original está en `src/data.js`. La BD guarda solo las secciones que se cambiaron.
- **Los formularios se arman solos** desde `backend/src/utils/contenidoEsquema.ts`. El mismo archivo valida lo que se guarda.

### Cómo agregar algo editable que pida el cliente

1. **Un campo nuevo en una sección existente** (ej: precio en los servicios): agregarlo en `contenidoEsquema.ts`
   (`{ clave: "precio", etiqueta: "Precio desde", tipo: "texto", max: 20 }`) y mostrarlo en el componente
   (`src/components/Services.jsx` → `{s.precio}`). El panel ya muestra el campo.
2. **Una sección nueva** (ej: testimonios): agregar la sección en `contenidoEsquema.ts`, su contenido original en
   `base` de `src/data.js`, una línea en `aplicarContenido` y el componente que la muestre.

Tipos de campo: `texto`, `textoLargo`, `numero`, `tags`, `foto`, `color`, `opcion`, `booleano`, `url`, `telefono`.

Las fotos subidas quedan en `backend/uploads/fotos` (no se suben a git: respaldar esa carpeta en el servidor).

## Tiempo real

El panel mantiene una conexión abierta con el backend (`GET /api/tiempo-real`, Server-Sent Events). Después de cada
cambio (agenda, certificados, usuarios, configuración, contenido, visitas) el backend avisa **qué** cambió y cada panel
vuelve a pedir esos datos con su propio token, así cada rol sigue viendo solo lo que le corresponde.

- El indicador **En vivo** de la barra lateral muestra si la conexión está activa; si se corta, se reconecta sola y
  vuelve a cargar todo.
- Si soporte desactiva a un usuario, su panel se cierra al instante.
- En producción, si hay un proxy (nginx), no debe acumular la respuesta (`X-Accel-Buffering: no` ya va en el header).

## Producción (lista para la puesta en marcha)

**En producción desde el 13/10/2026: https://vpunicars.cl** — todo en un VPS Hostinger KVM 1 (página, panel,
backend, MySQL y fotos), DNS en Cloudflare (registros A en "Solo DNS", sin proxy, por el tiempo real) y HTTPS de
Let's Encrypt con renovación automática. Guía e instalador en [`deploy/README.md`](deploy/README.md); publicar
cambios: `sudo -u vp /var/www/vpunicars/deploy/actualizar.sh`. Los pasos de abajo son el detalle del instalador.

1. **Base de datos**: MySQL 8 / MariaDB 10.4+. Crear un usuario solo para la app (nunca `root`):
   ```sql
   CREATE USER 'vp_app'@'localhost' IDENTIFIED BY 'una-clave-larga-y-aleatoria';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON vp_unicars.* TO 'vp_app'@'localhost';
   ```
2. **`backend/.env` de producción** (nunca se sube a git):
   - `JWT_SECRET` nuevo: `openssl rand -hex 32`
   - `CORS_ORIGIN=https://vpunicars.cl,https://www.vpunicars.cl`
   - `DB_USER=vp_app` y su clave; claves iniciales nuevas en `SEED_*_CLAVE`
3. **Backend**: `npm ci && npm run build && npm run db:init && npm start` (con pm2 o el gestor del hosting).
   `db:init` también aplica las migraciones. El usuario admin inicial debe cambiar su clave al primer ingreso.
4. **nginx**: sirve la página y pasa `/api` y `/uploads` al backend; las cabeceras de seguridad (CSP, HSTS,
   anti-clickjacking) están en `deploy/seguridad-headers.conf`. La antigua demo de Vercel solo redirige a vpunicars.cl
   (`vercel.json`).
5. **Datos de prueba**: `npm run db:limpiar` (muestra qué borra) y `npm run db:limpiar -- --confirmar`.
6. **Respaldos**: `deploy/respaldo.sh` corre todos los días a las 3:30 (BD + fotos, 14 días en `/var/backups/vpunicars`).

### Seguridad incluida

- Claves con bcrypt; login limitado a 10 intentos cada 15 min por IP; mismo mensaje si el usuario o la clave fallan.
- Token JWT (HS256, 12 h). Cambiar o restablecer una clave, o desactivar un usuario, cierra todas sus sesiones.
- Las claves temporales obligan a crear una clave personal antes de usar el panel (validado en el backend).
- Permisos por rol validados en el backend; el técnico solo ve y edita su agenda.
- SQL siempre con parámetros; contenido validado contra el esquema; HTML de las alertas escapado.
- Fotos: se revisa el tipo real del archivo, nombre aleatorio y se borran los metadatos (GPS, celular, fecha).
- Verificación pública del certificado sin nombre ni dirección del cliente y con la patente oculta.
- La medición de visitas no usa cookies ni guarda datos personales.
