#!/usr/bin/env bash
# Prepara las fotos que manda el cliente para subirlas a la página o al panel.
# Convierte jpg/png/heic a .webp de máx. 1440 px de ancho, sin datos de ubicación ni EXIF.
#
# Uso: scripts/preparar-fotos.sh <carpeta-con-fotos> [carpeta-salida]
#   Las subcarpetas se mantienen y su nombre pasa a ser el prefijo del archivo:
#   entrada/polarizado/IMG_1234.HEIC  ->  salida/polarizado/polarizado-01.webp
# Requiere: cwebp (brew install webp) y sips (viene con macOS).
set -euo pipefail

ENTRADA=${1:?Uso: scripts/preparar-fotos.sh <carpeta-con-fotos> [carpeta-salida]}
SALIDA=${2:-"$ENTRADA-web"}
ANCHO=1440
CALIDAD=80
command -v cwebp >/dev/null || { echo "Falta cwebp: brew install webp"; exit 1; }

slug() { echo "$1" | iconv -f utf-8 -t ascii//TRANSLIT | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g'; }
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
total=0; antes=0; despues=0

while IFS= read -r -d '' carpeta; do
  rel=${carpeta#"$ENTRADA"}; rel=${rel#/}
  prefijo=$(slug "${rel:-$(basename "$ENTRADA")}")
  n=0
  while IFS= read -r -d '' foto; do
    n=$((n + 1)); total=$((total + 1))
    destino="$SALIDA/${rel:+$rel/}$(printf '%s-%02d.webp' "${prefijo:-foto}" "$n")"
    mkdir -p "$(dirname "$destino")"
    # HEIC (iPhone) y cualquier otro formato: primero a JPG con sips
    origen="$foto"
    case "${foto##*.}" in heic|HEIC|heif|HEIF) origen="$TMP/$n.jpg"; sips -s format jpeg "$foto" --out "$origen" >/dev/null ;; esac
    w=$(sips -g pixelWidth "$origen" | awk '/pixelWidth/{print $2}')
    redim=(); [ "$w" -gt "$ANCHO" ] && redim=(-resize "$ANCHO" 0)
    cwebp -quiet -q "$CALIDAD" -metadata none "${redim[@]+"${redim[@]}"}" "$origen" -o "$destino"
    a=$(stat -f %z "$foto"); d=$(stat -f %z "$destino"); antes=$((antes + a)); despues=$((despues + d))
    printf '  %-45s %6s KB -> %5s KB\n' "${rel:+$rel/}$(basename "$foto")" $((a / 1024)) $((d / 1024))
  done < <(find "$carpeta" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.heic' -o -iname '*.heif' -o -iname '*.webp' \) -print0 | sort -z)
done < <(find "$ENTRADA" -type d -print0 | sort -z)

[ "$total" -eq 0 ] && { echo "No encontré fotos en $ENTRADA"; exit 1; }
awk -v n="$total" -v s="$SALIDA" -v a="$antes" -v d="$despues" 'BEGIN { printf "Listo: %d fotos en %s (%.1f MB -> %.1f MB)\n", n, s, a / 1048576, d / 1048576 }'
