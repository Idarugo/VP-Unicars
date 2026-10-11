#!/usr/bin/env bash
# Instala VP Unicars en un VPS Ubuntu 24.04 limpio (Hostinger KVM 1 o similar).
# Uso, como root en el servidor:
#   curl -fsSL https://raw.githubusercontent.com/Idarugo/VP-Unicars/main/deploy/instalar.sh -o instalar.sh
#   bash instalar.sh
# Antes: el dominio vpunicars.cl (y www) debe apuntar a la IP del VPS (registro A en NIC Chile).
set -euo pipefail

DOMINIO=vpunicars.cl
REPO=https://github.com/Idarugo/VP-Unicars.git
APP=/var/www/vpunicars
read -rp "Correo para avisos del certificado SSL: " CORREO
read -rp "Nombre del usuario soporte [Marcelo Hidalgo]: " SOPORTE_NOMBRE; SOPORTE_NOMBRE=${SOPORTE_NOMBRE:-Marcelo Hidalgo}

echo "== 1/8 Sistema, firewall y actualizaciones automáticas de seguridad"
apt-get update -y && apt-get upgrade -y
apt-get install -y nginx mysql-server git ufw fail2ban certbot python3-certbot-nginx unattended-upgrades curl
dpkg-reconfigure -f noninteractive unattended-upgrades
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable
systemctl enable --now fail2ban
timedatectl set-timezone America/Santiago

echo "== 2/8 Node.js 20 y pm2"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

echo "== 3/8 Usuario sin privilegios para la app"
id vp >/dev/null 2>&1 || adduser --system --group --home /home/vp --shell /bin/bash vp
mkdir -p "$APP" /var/log/vpunicars && chown -R vp:vp "$APP" /var/log/vpunicars

echo "== 4/8 Base de datos (usuario propio, sin root)"
CLAVE_BD=$(openssl rand -hex 24)
mysql <<SQL
CREATE DATABASE IF NOT EXISTS vp_unicars CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'vp_app'@'localhost' IDENTIFIED BY '$CLAVE_BD';
ALTER USER 'vp_app'@'localhost' IDENTIFIED BY '$CLAVE_BD';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON vp_unicars.* TO 'vp_app'@'localhost';
FLUSH PRIVILEGES;
SQL
# Para los respaldos (solo root puede leerlo)
printf "[client]\nuser=root\n" > /root/.my.cnf && chmod 600 /root/.my.cnf

echo "== 5/8 Código y configuración"
[ -d "$APP/.git" ] || sudo -u vp git clone "$REPO" "$APP"
CLAVE_SOPORTE=$(openssl rand -base64 12 | tr -d '/+=')
CLAVE_ADMIN=$(openssl rand -base64 12 | tr -d '/+=')
if [ ! -f "$APP/backend/.env" ]; then
  cat > "$APP/backend/.env" <<ENV
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=vp_app
DB_PASSWORD=$CLAVE_BD
DB_NAME=vp_unicars
JWT_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=https://$DOMINIO,https://www.$DOMINIO
SEED_SOPORTE_NOMBRE="$SOPORTE_NOMBRE"
SEED_SOPORTE_USUARIO=soporte
SEED_SOPORTE_CLAVE=$CLAVE_SOPORTE
SEED_ADMIN_NOMBRE="Marco Niño"
SEED_ADMIN_USUARIO=marco
SEED_ADMIN_CLAVE=$CLAVE_ADMIN
ENV
  chown vp:vp "$APP/backend/.env" && chmod 600 "$APP/backend/.env"
fi

echo "== 6/8 Compilar página y backend, crear tablas"
cd "$APP" && sudo -u vp npm ci && sudo -u vp npm run build
cd "$APP/backend" && sudo -u vp npm ci && sudo -u vp npm run build && sudo -u vp npm run db:init
mkdir -p "$APP/backend/uploads/fotos" && chown -R vp:vp "$APP/backend/uploads"

echo "== 7/8 Backend siempre encendido (pm2)"
sudo -u vp pm2 start "$APP/deploy/ecosystem.config.cjs"
sudo -u vp pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u vp --hp /home/vp

echo "== 8/8 nginx, HTTPS y respaldos diarios"
cp "$APP/deploy/seguridad-headers.conf" /etc/nginx/snippets/vpunicars-seguridad.conf
cp "$APP/deploy/nginx-vpunicars.conf" /etc/nginx/sites-available/vpunicars
ln -sf /etc/nginx/sites-available/vpunicars /etc/nginx/sites-enabled/vpunicars
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot --nginx -d "$DOMINIO" -d "www.$DOMINIO" --non-interactive --agree-tos -m "$CORREO" --redirect
chmod +x "$APP/deploy/respaldo.sh" "$APP/deploy/actualizar.sh"
( crontab -l 2>/dev/null | grep -v respaldo.sh; echo "30 3 * * * $APP/deploy/respaldo.sh >> /var/log/vpunicars/respaldo.log 2>&1" ) | crontab -

echo
echo "================ LISTO: https://$DOMINIO ================"
echo "Guarda estas claves en tu gestor de contraseñas (no se vuelven a mostrar):"
echo "  Panel soporte -> usuario: soporte  clave: $CLAVE_SOPORTE"
echo "  Panel Marco   -> usuario: marco    clave: $CLAVE_ADMIN  (deberá cambiarla al entrar)"
