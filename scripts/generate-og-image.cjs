/**
 * Gera a imagem de compartilhamento social (Open Graph) da marca HF.
 *
 * Desenha o monograma oficial a partir dos mesmos poligonos do SVG aprovado
 * (kit de identidade v2), sem redesenhar a marca: as coordenadas abaixo sao
 * copia literal de public/brand/hf-simbolo-claro.svg.
 *
 * Uso:  node scripts/generate-og-image.cjs
 * Saida: public/brand/hf-og.png (1200x630)
 */
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const NAVY = '#0B1426';
const GOLD = '#D4A336';
const ICE = '#F4F6F8';

// Poligonos do simbolo oficial - viewBox 0 0 752 618.
const SYMBOL_VIEWBOX = { w: 752, h: 618 };
const SYMBOL_PATHS = [
  { fill: ICE, points: '127.64,24.00 28.00,115.18 28.00,595.52 130.46,508.10 129.52,347.36 294.02,347.36 385.20,260.88 130.46,263.70' },
  { fill: ICE, points: '294.02,241.14 397.42,241.14 398.36,120.82 634.30,120.82 723.60,37.16 364.52,37.16 294.02,101.08' },
  { fill: ICE, points: '401.18,366.16 294.02,367.10 294.02,594.58 401.18,506.22' },
  { fill: GOLD, points: '294.02,348.30 545.94,348.30 634.30,260.88 383.32,260.88' },
];

function drawSymbol(ctx, x, y, width) {
  const scale = width / SYMBOL_VIEWBOX.w;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  for (const poly of SYMBOL_PATHS) {
    const pts = poly.points.trim().split(/\s+/).map((p) => p.split(',').map(Number));
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
    ctx.closePath();
    ctx.fillStyle = poly.fill;
    ctx.fill();
  }
  ctx.restore();
  return SYMBOL_VIEWBOX.h * scale;
}

/** Texto com tracking controlado (node-canvas nao tem letterSpacing). */
function drawTracked(ctx, text, x, y, tracking) {
  let cursor = x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + tracking;
  }
  return cursor - x - tracking;
}

function measureTracked(ctx, text, tracking) {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + tracking;
  return w - tracking;
}

const W = 1200;
const H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Fundo azul-marinho com leve profundidade radial.
ctx.fillStyle = NAVY;
ctx.fillRect(0, 0, W, H);
const glow = ctx.createRadialGradient(W * 0.72, H * 0.5, 0, W * 0.72, H * 0.5, W * 0.6);
glow.addColorStop(0, 'rgba(212,163,54,0.10)');
glow.addColorStop(1, 'rgba(212,163,54,0)');
ctx.fillStyle = glow;
ctx.fillRect(0, 0, W, H);

// Filete dourado de assinatura.
ctx.fillStyle = GOLD;
ctx.fillRect(0, H - 8, W, 8);

// Monograma.
drawSymbol(ctx, 96, 150, 230);

// Nome.
const textLeft = 96;
ctx.textBaseline = 'alphabetic';
ctx.fillStyle = ICE;
ctx.font = '600 64px "Segoe UI", Arial, sans-serif';
drawTracked(ctx, 'HENRIQUE FUJIMOTO', textLeft, 470, 6);

// Slogan.
ctx.fillStyle = GOLD;
ctx.font = '600 28px "Segoe UI", Arial, sans-serif';
drawTracked(ctx, 'UM TREINO DE CADA VEZ.', textLeft, 522, 5);

// Descritor discreto a direita.
ctx.fillStyle = 'rgba(244,246,248,0.55)';
ctx.font = '500 24px "Segoe UI", Arial, sans-serif';
const descriptor = 'JUDÔ · BRASÍLIA — DF';
const descriptorWidth = measureTracked(ctx, descriptor, 4);
drawTracked(ctx, descriptor, W - 96 - descriptorWidth, 522, 4);

const out = path.join(__dirname, '..', 'public', 'brand', 'hf-og.png');
fs.writeFileSync(out, canvas.toBuffer('image/png'));
console.log('OG image gerada em', out, W + 'x' + H);
