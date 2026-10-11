#!/usr/bin/env bash
# Publica la última versión desde GitHub: compila página y backend, aplica migraciones y reinicia.
# Uso (en el servidor): sudo -u vp /var/www/vpunicars/deploy/actualizar.sh
set -euo pipefail
cd /var/www/vpunicars
git pull --ff-only
npm ci
npm run build
cd backend
npm ci
npm run build
npm run db:init
pm2 reload vpunicars-api
echo "Versión publicada: $(git log --oneline -1)"
