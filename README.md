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

## Producción

- El backend necesita un hosting con Node.js y MySQL (no sirve un hosting solo estático).
- `CORS_ORIGIN` en `backend/.env` debe ser el dominio de la página.
- Hacer un respaldo desde Mantención → Respaldos al menos una vez al mes.
