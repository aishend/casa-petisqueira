#!/usr/bin/env bash
# Converte as fotos originais em versões leves para o site.
#
#   fotos-originais/<casa>/NN.webp|jpg  ->  static/img/<casa>/NN-{480,1024,1920}.webp
#   fotos-originais/videos/<casa>.mov   ->  static/video/<casa>.mp4 (+ poster .webp)
#
# A ordem das fotos no site é a ordem alfabética dos ficheiros (01, 02, ...).
# Requer: vips, ffmpeg.  Uso: scripts/optimize-images.sh [--force]
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=fotos-originais
OUT=static
WIDTHS=(480 1024 1920)
QUALITY=72
FORCE=${1:-}

export VIPS_WARNING=0

convert_one() {
  local src=$1 dest_base=$2 w
  for w in "${WIDTHS[@]}"; do
    local dest="${dest_base}-${w}.webp"
    [[ -f $dest && $FORCE != --force ]] && continue
    # --size down: nunca aumenta imagens pequenas; strip remove metadados (EXIF/GPS)
    vips thumbnail "$src" "${dest}[Q=${QUALITY},strip,smart_subsample]" "$w" --size down 2>/dev/null
  done
}
export -f convert_one
export WIDTHS_STR="${WIDTHS[*]}" QUALITY FORCE

for dir in "$SRC"/*/; do
  casa=$(basename "$dir")
  [[ $casa == videos || $casa == *-marca ]] && continue
  mkdir -p "$OUT/img/$casa"
  find "$dir" -maxdepth 1 -type f \( -iname '*.webp' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) | sort |
    while read -r f; do
      name=$(basename "${f%.*}")
      printf '%s\0%s\0' "$f" "$OUT/img/$casa/$name"
    done |
    xargs -0 -n2 -P"$(nproc)" bash -c 'WIDTHS=($WIDTHS_STR); convert_one "$0" "$1"'
  echo "✓ $casa: $(ls "$OUT/img/$casa" | wc -l) ficheiros, $(du -sh "$OUT/img/$casa" | cut -f1)"
done

# Logótipo
mkdir -p "$OUT/img"
for f in logo logo-horizontal; do [[ -f $SRC/$f.webp ]] && cp "$SRC/$f.webp" "$OUT/img/$f.webp"; done

# Vídeos: H.264 até 720p, com "faststart" para começar a tocar logo
if [[ -d $SRC/videos ]]; then
  mkdir -p "$OUT/video"
  for v in "$SRC"/videos/*; do
    name=$(basename "${v%.*}")
    out="$OUT/video/$name.mp4"
    if [[ ! -f $out || $FORCE == --force ]]; then
      ffmpeg -loglevel error -y -i "$v" -map 0:v:0 -map 0:a:0? \
        -vf "scale=-2:'min(720,ih)'" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p \
        -c:a aac -b:a 96k -movflags +faststart "$out"
      ffmpeg -loglevel error -y -ss 2 -i "$out" -frames:v 1 "$OUT/video/$name.webp"
    fi
    echo "✓ vídeo $name: $(du -sh "$out" | cut -f1)"
  done
fi

echo "Total: $(du -sh "$OUT" | cut -f1)"
