// pm2: mantiene el backend corriendo y lo reinicia si se cae o si el servidor se reinicia.
module.exports = {
  apps: [
    {
      name: "vpunicars-api",
      cwd: "/var/www/vpunicars/backend",
      script: "dist/server.js",
      instances: 1, // una sola instancia: el canal en tiempo real vive en memoria
      max_memory_restart: "400M",
      env: { NODE_ENV: "production", TZ: "America/Santiago" },
      out_file: "/var/log/vpunicars/api.log",
      error_file: "/var/log/vpunicars/api-error.log",
      time: true,
    },
  ],
};
