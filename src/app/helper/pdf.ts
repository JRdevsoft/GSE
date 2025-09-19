// /** Convierte claves a etiqueta: "group_destine" -> "Group destine" */
// export function toLabel(key: string): string {
//   return key
//     .replace(/[_\-]+/g, ' ')
//     .replace(/\s+/g, ' ')
//     .trim()
//     .replace(/^\w/, c => c.toUpperCase());
// }

// /** Valor a texto legible */
// export function valToText(v: any): string {
//   if (v === null || v === undefined) return '';
//   if (Array.isArray(v)) return v.map(x => valToText(x)).join(', ');
//   if (typeof v === 'object') return JSON.stringify(v);
//   return String(v);
// }

// /** Inserta puntos de corte (URLs, palabras muy largas) */
// export function softWrap(s: string, maxSegment = 24): string {
//   if (!s) return '';
//   // 1) corte tras signos típicos de URL/paths
//   let out = s.replace(/([/:?&=._-])/g, '$1\u200B');
//   // 2) corte duro cada N caracteres en bloques sin espacios (evita desbordes)
//   const re = new RegExp(`([^\\s\\u200B]{${maxSegment}})`, 'g');
//   out = out.replace(re, '$1\u200B');
//   return out;
// }

// /** Formatea formData como líneas "Etiqueta: valor" (una por renglón) */
// export function prettyFormData(fd: any): string {
//   if (!fd || typeof fd !== 'object') return valToText(fd);
//   const lines = Object.entries(fd).map(([k, v]) => `• ${toLabel(k)}: ${valToText(v)}`);
//   return lines.join('\n'); // 👈 una línea por entrada
// }

export function toLabel(key: string) {
  return key.replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^\w/, c => c.toUpperCase());
}
export function valToText(v: any): string {
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) return v.map(x => valToText(x)).join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
export function softWrap(s: string, maxSegment = 24) {      // 👈 más agresivo que 24
  if (!s) return '';
  let out = s.replace(/([/:?&=._-])/g, '$1\u200B');
  const re = new RegExp(`([^\\s\\u200B]{${maxSegment}})`, 'g');
  out = out.replace(re, '$1\u200B');
  return out;
}
export function prettyFormData(fd: any): string {
  if (!fd || typeof fd !== 'object') return valToText(fd);
  return Object.entries(fd).map(([k, v]) => `• ${toLabel(k)}: ${valToText(v)}`).join('\n');
}

export default { toLabel, valToText, softWrap, prettyFormData };
