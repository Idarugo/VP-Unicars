# Puesta en marcha en un VPS (todo en un servidor)

Página, panel, backend, base de datos y fotos en un solo VPS Ubuntu 24.04 (recomendado: Hostinger KVM 1,
datacenter de Sudamérica). nginx sirve la página y pasa `/api` y `/uploads` al backend: mismo dominio, sin CORS.

| Archivo | Para qué |
|---|---|
| `instalar.sh` | Instala todo en un VPS limpio: firewall, Node 20, MySQL con usuario propio, pm2, nginx, HTTPS y respaldos |
| `nginx-vpunicars.conf` + `seguridad-headers.conf` | Sitio y cabeceras de seguridad (las mismas de `vercel.json`) |
| `ecosystem.config.cjs` | pm2: backend siempre encendido |
| `actualizar.sh` | Publica la última versión de GitHub (compila, migra y reinicia sin cortar) |
| `respaldo.sh` | Respaldo diario de la BD y las fotos, guarda 14 días (cron 03:30) |

## Pasos

1. Comprar el VPS con **Ubuntu 24.04** y anotar su IP.
2. En NIC Chile, en el dominio `vpunicars.cl`: registros **A** para `vpunicars.cl` y `www` → IP del VPS.
3. Entrar por SSH como root y ejecutar:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/Idarugo/VP-Unicars/main/deploy/instalar.sh -o instalar.sh
   bash instalar.sh
   ```
4. Guardar las claves que muestra al final. Marco cambia la suya en su primer ingreso.
5. Probar: página, `/admin`, emitir un certificado, el QR de verificación, subir una foto y el indicador **En vivo**.

## Después

- Publicar cambios: `sudo -u vp /var/www/vpunicars/deploy/actualizar.sh`
- Ver el backend: `sudo -u vp pm2 logs vpunicars-api`
- Respaldos: `/var/backups/vpunicars` (copiar de vez en cuando fuera del servidor). Hostinger además hace uno semanal.
