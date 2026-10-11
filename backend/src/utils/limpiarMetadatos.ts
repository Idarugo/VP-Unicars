// Quita los metadatos de las fotos (EXIF con ubicación GPS, modelo del celular, fecha, XMP, IPTC)
// antes de guardarlas: las fotos se publican en la página y no deben revelar dónde se tomaron.
// Solo se eliminan bloques de metadatos; la imagen no se vuelve a comprimir.

const limpiarJpg = (b: Buffer): Buffer => {
  const partes: Buffer[] = [b.subarray(0, 2)]; // SOI
  let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) break;
    const marca = b[i + 1];
    if (marca === 0xda) { partes.push(b.subarray(i)); return Buffer.concat(partes); } // inicio de la imagen: el resto se copia
    const largo = b.readUInt16BE(i + 2);
    const segmento = b.subarray(i, i + 2 + largo);
    // APP1 (EXIF/XMP), APP13 (IPTC/Photoshop) y comentarios fuera; APP0 (JFIF), APP2 (perfil de color) y el resto se mantienen
    if (marca !== 0xe1 && marca !== 0xed && marca !== 0xfe) partes.push(segmento);
    i += 2 + largo;
  }
  throw new Error("JPG inválido");
};

const limpiarPng = (b: Buffer): Buffer => {
  const quitar = new Set(["eXIf", "tEXt", "iTXt", "zTXt", "tIME"]);
  const partes: Buffer[] = [b.subarray(0, 8)];
  let i = 8;
  while (i + 12 <= b.length) {
    const largo = b.readUInt32BE(i);
    const tipo = b.subarray(i + 4, i + 8).toString("latin1");
    const chunk = b.subarray(i, i + 12 + largo);
    if (!quitar.has(tipo)) partes.push(chunk);
    i += 12 + largo;
    if (tipo === "IEND") return Buffer.concat(partes);
  }
  throw new Error("PNG inválido");
};

const limpiarWebp = (b: Buffer): Buffer => {
  const partes: Buffer[] = [];
  let i = 12;
  while (i + 8 <= b.length) {
    const tipo = b.subarray(i, i + 4).toString("latin1");
    const largo = b.readUInt32LE(i + 4);
    const total = 8 + largo + (largo % 2); // los chunks se rellenan a número par
    const chunk = Buffer.from(b.subarray(i, i + total));
    if (tipo === "VP8X") chunk[8] &= ~(0x08 | 0x04); // apaga las banderas de EXIF y XMP
    if (tipo !== "EXIF" && tipo !== "XMP ") partes.push(chunk);
    i += total;
  }
  const cuerpo = Buffer.concat(partes);
  const cabecera = Buffer.from(b.subarray(0, 12));
  cabecera.writeUInt32LE(cuerpo.length + 4, 4);
  return Buffer.concat([cabecera, cuerpo]);
};

export const limpiarMetadatos = (b: Buffer, tipo: "jpg" | "png" | "webp"): Buffer =>
  tipo === "jpg" ? limpiarJpg(b) : tipo === "png" ? limpiarPng(b) : limpiarWebp(b);
