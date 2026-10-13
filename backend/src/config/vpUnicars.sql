-- Esquema de la base de datos de VP Unicars (MySQL 8 / MariaDB 10.4+)

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  usuario VARCHAR(40) NOT NULL UNIQUE,
  clave_hash VARCHAR(100) NOT NULL,
  rol ENUM('soporte', 'admin', 'tecnico') NOT NULL DEFAULT 'tecnico',
  descripcion VARCHAR(120) NULL,
  -- WhatsApp para avisarle sus trabajos desde la agenda
  telefono VARCHAR(16) NULL,
  color CHAR(7) NOT NULL DEFAULT '#ffc800',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  -- Sube al cambiar/restablecer la clave o desactivar: invalida todas las sesiones abiertas
  sesion_version INT NOT NULL DEFAULT 0,
  -- Clave temporal: debe cambiarla al entrar
  debe_cambiar_clave TINYINT(1) NOT NULL DEFAULT 0,
  ultimo_acceso DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS certificados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero INT NOT NULL UNIQUE,
  codigo VARCHAR(8) NOT NULL,
  fecha DATE NOT NULL,
  cliente VARCHAR(120) NOT NULL,
  direccion VARCHAR(160) NULL,
  telefono VARCHAR(20) NULL,
  instalador VARCHAR(100) NOT NULL,
  tipo VARCHAR(40) NOT NULL,
  marca VARCHAR(60) NOT NULL,
  modelo VARCHAR(80) NOT NULL,
  anio SMALLINT NOT NULL,
  patente VARCHAR(8) NOT NULL,
  delanteros TINYINT UNSIGNED NOT NULL,
  traseros TINYINT UNSIGNED NOT NULL,
  luneta TINYINT UNSIGNED NOT NULL,
  observaciones VARCHAR(160) NULL,
  creado_por INT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Los certificados no se borran: se anulan, para no reutilizar números de un documento legal
  anulado_en DATETIME NULL,
  anulado_por INT NULL,
  INDEX idx_cert_patente (patente),
  INDEX idx_cert_fecha (fecha),
  CONSTRAINT fk_cert_creado FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT fk_cert_anulado FOREIGN KEY (anulado_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trabajos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  servicio VARCHAR(60) NOT NULL,
  encargado_id INT NULL,
  lugar ENUM('local', 'domicilio') NOT NULL DEFAULT 'local',
  direccion VARCHAR(160) NULL,
  cliente VARCHAR(120) NOT NULL,
  telefono VARCHAR(20) NULL,
  marca VARCHAR(60) NULL,
  modelo VARCHAR(80) NULL,
  patente VARCHAR(8) NULL,
  estado ENUM('pendiente', 'confirmado', 'terminado') NOT NULL DEFAULT 'pendiente',
  notas VARCHAR(255) NULL,
  creado_por INT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trab_fecha (fecha),
  CONSTRAINT fk_trab_encargado FOREIGN KEY (encargado_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT fk_trab_creado FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contenido editable de la página y configuración (JSON por clave)
CREATE TABLE IF NOT EXISTS ajustes (
  clave VARCHAR(40) PRIMARY KEY,
  valor LONGTEXT NOT NULL,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  actualizado_por INT NULL,
  CONSTRAINT fk_ajuste_usuario FOREIGN KEY (actualizado_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS historial (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario_id INT NULL,
  usuario_nombre VARCHAR(100) NOT NULL,
  accion VARCHAR(80) NOT NULL,
  detalle VARCHAR(255) NULL,
  INDEX idx_hist_fecha (fecha),
  CONSTRAINT fk_hist_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Visitas a la página y clics en los botones de WhatsApp (sin datos personales)
CREATE TABLE IF NOT EXISTS eventos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('visita', 'whatsapp') NOT NULL,
  servicio VARCHAR(60) NULL,
  origen VARCHAR(40) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_evento_tipo_fecha (tipo, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tareas_mantencion (
  mes CHAR(7) NOT NULL,
  clave VARCHAR(30) NOT NULL,
  hecho TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (mes, clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
