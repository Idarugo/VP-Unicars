#!/usr/bin/env bash
# Respaldo diario: base de datos + fotos subidas. Guarda los últimos 14 días.
# Se programa con: sudo crontab -e  →  30 3 * * * /var/www/vpunicars/deploy/respaldo.sh
set -euo pipefail
DESTINO=/var/backups/vpunicars
FECHA=$(date +%F)
mkdir -p "$DESTINO"
# Credenciales en /root/.my.cnf (no en este archivo)
mysqldump --single-transaction --routines vp_unicars | gzip > "$DESTINO/bd-$FECHA.sql.gz"
tar -czf "$DESTINO/fotos-$FECHA.tar.gz" -C /var/www/vpunicars/backend uploads
find "$DESTINO" -type f -mtime +14 -delete
echo "Respaldo $FECHA listo"
