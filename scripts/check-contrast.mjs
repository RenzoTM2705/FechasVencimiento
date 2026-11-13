/**
 * Auditoría de contraste WCAG de los tokens de docs/UX.md.
 * Uso: pnpm run check:contrast
 */
const PAIRS = [
    ['Tinta sobre lienzo', '#0b1220', '#f4f6f8', 4.5],
    ['Tinta sobre tarjeta', '#0b1220', '#ffffff', 4.5],
    ['Texto secundario sobre tarjeta', '#334155', '#ffffff', 4.5],
    ['Metadatos sobre tarjeta', '#5f6e85', '#ffffff', 4.5],
    ['Metadatos sobre lienzo', '#5f6e85', '#f4f6f8', 4.5],
    ['Azul de marca sobre amarillo (cabecera)', '#173e89', '#ffbc00', 4.5],
    ['Blanco sobre azul de marca (botón)', '#ffffff', '#173e89', 4.5],
    ['Azul de marca sobre tarjeta', '#173e89', '#ffffff', 4.5],
    ['Acento sobre tarjeta', '#24509e', '#ffffff', 4.5],
    ['Vigente', '#166534', '#e8f5ec', 4.5],
    ['Próximo a vencer', '#92400e', '#fdf4e3', 4.5],
    ['Crítico', '#b42318', '#fdecea', 4.5],
    ['Vencido', '#7a271a', '#fbe9e7', 4.5],
    ['Vence hoy (texto blanco)', '#ffffff', '#b42318', 4.5],
    ['Chip de retiro vencido', '#7a271a', '#fbe9e7', 4.5],
    ['Riel de estado vigente vs tarjeta', '#166534', '#ffffff', 3],
];

function channel(value) {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a, b) {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05);
}

let failures = 0;

for (const [label, fg, bg, minimum] of PAIRS) {
    const value = ratio(fg, bg);
    const ok = value >= minimum;
    if (!ok) failures += 1;
    console.log(`${ok ? 'OK ' : 'FALLA'} ${label}: ${value.toFixed(2)}:1 (mínimo ${minimum}:1)`);
}

console.log(`\n${PAIRS.length - failures}/${PAIRS.length} combinaciones cumplen el mínimo.`);
process.exit(failures > 0 ? 1 : 0);
