// Draws every placeholder in src/data/media.ts as an original SVG illustration.
// Each file is stamped ILLUSTRATION so it cannot be mistaken for completed StageLiora work.
import fs from 'node:fs';
import path from 'node:path';
import { media } from '../src/data/media.ts';
import { styles, rooms } from '../src/data/taxonomy.ts';

const W = 1500, H = 1000;
const OUT = path.resolve('public/media/placeholders');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const poly = (pts, fill, extra = '') => `<polygon points="${pts}" fill="${fill}" ${extra}/>`;
const circle = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const line = (a, b, c, d, stroke, w = 2) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${stroke}" stroke-width="${w}"/>`;

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
  const [r, g, b] = [f(n >> 16), f((n >> 8) & 255), f(n & 255)];
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Room shell in one-point perspective
const BW = { x: 270, y: 150, w: 960, h: 560 }; // back wall
const FLOOR_Y = BW.y + BW.h;
const floors = { oak: ['#C9A77C', '#B8956A'], tile: ['#D9D6CE', '#C4C1B8'], worn: ['#A58E74', '#8C7760'], walnut: ['#6F4E37', '#5D3F2B'], stone: ['#B9B6AE', '#A3A098'] };

function shell(s, st) {
  const wall = s.wall || st.palette.wall;
  const [f1, f2] = floors[s.floor || (s.room === 'basement' ? 'stone' : s.room === 'kitchen' ? 'tile' : 'oak')];
  let o = '';
  o += rect(0, 0, W, H, shade(wall, -0.06));
  o += poly(`0,0 ${W},0 ${BW.x + BW.w},${BW.y} ${BW.x},${BW.y}`, s.ceiling === 'wood' ? '#A77F58' : shade(wall, 0.05));
  o += poly(`0,0 ${BW.x},${BW.y} ${BW.x},${FLOOR_Y} 0,${H}`, shade(wall, -0.09));
  o += poly(`${W},0 ${BW.x + BW.w},${BW.y} ${BW.x + BW.w},${FLOOR_Y} ${W},${H}`, shade(wall, -0.05));
  o += rect(BW.x, BW.y, BW.w, BW.h, wall);
  o += poly(`0,${H} ${BW.x},${FLOOR_Y} ${BW.x + BW.w},${FLOOR_Y} ${W},${H}`, f1);
  for (let i = 1; i < 12; i++) {
    const t = i / 12;
    o += line(BW.x + BW.w * t, FLOOR_Y, W * t, H, f2, 2.5);
  }
  for (let i = 1; i < 5; i++) {
    const t = (i / 5) ** 2;
    const y = FLOOR_Y + (H - FLOOR_Y) * t;
    const lx = BW.x * (1 - t);
    o += line(lx, y, W - lx, y, f2, 1.5);
  }
  if (s.floor === 'worn') for (const [x, y, r] of [[420, 840, 46], [980, 790, 34], [720, 920, 58]]) o += `<ellipse cx="${x}" cy="${y}" rx="${r * 2}" ry="${r * 0.55}" fill="#7C6853" opacity=".35"/>`;
  // baseboard
  o += rect(BW.x, FLOOR_Y - 18, BW.w, 18, '#FBFAF6');
  o += poly(`0,${H - 30} ${BW.x},${FLOOR_Y - 18} ${BW.x},${FLOOR_Y} 0,${H}`, '#EEECE4');
  o += poly(`${W},${H - 30} ${BW.x + BW.w},${FLOOR_Y - 18} ${BW.x + BW.w},${FLOOR_Y} ${W},${H}`, '#F4F2EB');
  if (s.ceiling === 'beams') {
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      const bx = BW.x + BW.w * t, tx = W * t;
      o += poly(`${tx - 26},0 ${tx + 26},0 ${bx + 9},${BW.y} ${bx - 9},${BW.y}`, '#7A5636');
    }
  }
  return o;
}

function windowFrame(x, y, w, h, kind = 'double') {
  let o = rect(x - 12, y - 12, w + 24, h + 24, '#FBFAF6');
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sky)"/>`;
  o += rect(x, y + h * 0.72, w, h * 0.28, '#BFD7B5', 'opacity=".8"');
  o += circle(x + w * 0.22, y + h * 0.62, Math.min(w, h) * 0.16, '#7FA67A', 'opacity=".85"');
  if (kind === 'double') o += rect(x + w / 2 - 5, y, 10, h, '#FBFAF6');
  o += rect(x, y + h / 2 - 4, w, 8, '#FBFAF6');
  return o;
}

function architecture(room) {
  switch (room) {
    case 'sunroom': return windowFrame(320, 200, 250, 410) + windowFrame(625, 200, 250, 410) + windowFrame(930, 200, 250, 410);
    case 'kitchen': return windowFrame(620, 210, 260, 180);
    case 'basement': return windowFrame(340, 170, 220, 80, 'single') + windowFrame(940, 170, 220, 80, 'single');
    case 'entryway': return `${rect(610, 250, 280, 460, '#FBFAF6')}${rect(630, 270, 240, 440, '#6E5A47')}${windowFrame(655, 295, 190, 120, 'single')}${circle(845, 500, 9, '#C5A04A')}`;
    case 'primary-bedroom': case 'guest-bedroom': return windowFrame(880, 230, 250, 290);
    case 'childrens-bedroom': return windowFrame(860, 230, 260, 260);
    case 'home-office': return windowFrame(340, 220, 280, 320);
    case 'dining-room': return windowFrame(590, 200, 320, 300);
    default: return windowFrame(860, 210, 290, 370);
  }
}

// Furniture ------------------------------------------------------------------
function legs(x, y, w, h, c, round) {
  return (round ? `<rect x="${x + 14}" y="${y}" width="10" height="${h}" rx="5" fill="${c}"/><rect x="${x + w - 24}" y="${y}" width="10" height="${h}" rx="5" fill="${c}"/>`
    : rect(x + 8, y, 9, h, c) + rect(x + w - 17, y, 9, h, c));
}
function shadow(x, y, w) { return `<ellipse cx="${x + w / 2}" cy="${y}" rx="${w * 0.54}" ry="16" fill="#1a1a1a" opacity=".16"/>`; }

function sofa(x, y, w, p) {
  const c = p.sofa, r = p.round ? 34 : 8;
  return shadow(x, y + 6, w) + legs(x + 18, y - 22, w - 36, 24, p.metal, p.round)
    + `<rect x="${x + 22}" y="${y - 200}" width="${w - 44}" height="130" rx="${r}" fill="${shade(c, -0.04)}"/>`
    + `<rect x="${x}" y="${y - 120}" width="58" height="100" rx="${r}" fill="${shade(c, -0.08)}"/><rect x="${x + w - 58}" y="${y - 120}" width="58" height="100" rx="${r}" fill="${shade(c, -0.08)}"/>`
    + `<rect x="${x + 50}" y="${y - 94}" width="${w - 100}" height="72" rx="${r / 2}" fill="${c}"/>`
    + line(x + w / 2, y - 94, x + w / 2, y - 22, shade(c, -0.14), 3)
    + `<rect x="${x + 70}" y="${y - 165}" width="88" height="76" rx="14" fill="${p.accent}" transform="rotate(-6 ${x + 114} ${y - 127})"/>`
    + `<rect x="${x + w - 160}" y="${y - 163}" width="88" height="74" rx="14" fill="${shade(p.rug, -0.1)}" transform="rotate(5 ${x + w - 116} ${y - 126})"/>`;
}
function rug(y, w, p, cx = 750) {
  const half = w / 2;
  const inset = 80;
  return poly(`${cx - half + inset},${y} ${cx + half - inset},${y} ${cx + half},${y + 120} ${cx - half},${y + 120}`, p.rug)
    + poly(`${cx - half + inset + 24},${y + 12} ${cx + half - inset - 24},${y + 12} ${cx + half - 34},${y + 108} ${cx - half + 34},${y + 108}`, 'none', `stroke="${shade(p.rug, -0.16)}" stroke-width="4"`);
}
function coffeeTable(x, y, w, p) {
  const shape = p.round ? `<ellipse cx="${x + w / 2}" cy="${y - 44}" rx="${w / 2}" ry="17" fill="${p.wood}"/>` : rect(x, y - 54, w, 15, p.wood);
  return shadow(x, y + 4, w) + rect(x + w * 0.2, y - 42, 9, 44, p.metal) + rect(x + w * 0.8 - 9, y - 42, 9, 44, p.metal) + shape
    + rect(x + w * 0.3, y - 68, 80, 10, p.accent) + rect(x + w * 0.33, y - 77, 60, 9, '#F6F4EC');
}
function lamp(x, y, p) {
  return shadow(x - 34, y + 4, 68) + rect(x - 3, y - 300, 6, 300, p.metal) + rect(x - 28, y - 8, 56, 8, p.metal)
    + (p.round ? `<ellipse cx="${x}" cy="${y - 320}" rx="50" ry="48" fill="#F6E7BE"/>` : poly(`${x - 32},${y - 362} ${x + 32},${y - 362} ${x + 56},${y - 292} ${x - 56},${y - 292}`, '#F6E7BE'));
}
function art(x, y, w, h, p) {
  return rect(x + 6, y + 8, w, h, '#000', 'opacity=".1"') + rect(x, y, w, h, p.metal) + rect(x + 8, y + 8, w - 16, h - 16, '#FBFAF6')
    + `<circle cx="${x + w * 0.38}" cy="${y + h * 0.42}" r="${h * 0.2}" fill="${p.accent}"/>` + poly(`${x + 18},${y + h - 18} ${x + w * 0.56},${y + h * 0.42} ${x + w - 18},${y + h - 18}`, shade(p.sofa, -0.05));
}
function plant(x, y, p) {
  let o = shadow(x - 34, y + 4, 68) + poly(`${x - 32},${y - 74} ${x + 32},${y - 74} ${x + 24},${y} ${x - 24},${y}`, p.round ? '#E8E2D2' : p.metal);
  for (const [dx, h, rot] of [[0, 170, 0], [-22, 130, -24], [22, 130, 24], [-34, 90, -48], [34, 92, 48]]) o += `<ellipse cx="${x + dx}" cy="${y - 74 - h / 2}" rx="17" ry="${h / 2}" fill="#4F7A5B" transform="rotate(${rot} ${x + dx} ${y - 74})"/>`;
  return o;
}
function armchair(x, y, p) {
  const c = p.accent;
  return shadow(x, y + 5, 150) + legs(x + 12, y - 20, 126, 22, p.metal, p.round)
    + `<rect x="${x + 16}" y="${y - 165}" width="118" height="120" rx="${p.round ? 36 : 8}" fill="${shade(c, -0.05)}"/><rect x="${x}" y="${y - 82}" width="150" height="62" rx="${p.round ? 26 : 8}" fill="${c}"/>`;
}
function bed(x, y, w, p, kid = false) {
  const hb = kid ? 130 : 210;
  let o = shadow(x, y + 6, w) + `<rect x="${x + 6}" y="${y - hb - 70}" width="${w - 12}" height="${hb + 50}" rx="${p.round ? 26 : 5}" fill="${p.round ? p.sofa : p.wood}"/>`;
  o += legs(x, y - 22, w, 24, p.metal, p.round);
  o += rect(x, y - 95, w, 75, '#F4F1E8', 'rx="8"');
  o += `<rect x="${x + 28}" y="${y - 190}" width="${w * 0.38}" height="84" rx="16" fill="#FBFAF6"/><rect x="${x + w - 28 - w * 0.38}" y="${y - 190}" width="${w * 0.38}" height="84" rx="16" fill="#FBFAF6"/>`;
  o += `<rect x="${x - 6}" y="${y - 118}" width="${w + 12}" height="86" rx="12" fill="${p.accent}" opacity=".88"/>`;
  return o;
}
function nightstand(x, y, p, withLamp = true) {
  let o = shadow(x, y + 3, 96) + rect(x, y - 84, 96, 72, p.wood) + line(x + 8, y - 48, x + 88, y - 48, shade(p.wood, -0.14), 3) + rect(x + 10, y - 12, 8, 12, p.metal) + rect(x + 78, y - 12, 8, 12, p.metal);
  if (withLamp) o += rect(x + 45, y - 136, 6, 52, p.metal) + `<path d="M${x + 22} ${y - 136} L${x + 74} ${y - 136} L${x + 62} ${y - 180} L${x + 34} ${y - 180} Z" fill="#F6E7BE"/>`;
  return o;
}
function chair(x, y, p) {
  return rect(x + 4, y - 150, 56, 86, shade(p.sofa, -0.04), `rx="${p.round ? 16 : 3}"`) + rect(x, y - 72, 64, 14, p.sofa, 'rx="4"') + rect(x + 4, y - 58, 7, 58, p.metal) + rect(x + 53, y - 58, 7, 58, p.metal);
}
function diningTable(x, y, w, p) {
  let o = shadow(x, y + 5, w);
  const n = Math.floor(w / 110);
  for (let i = 0; i < n; i++) o += chair(x + 26 + i * ((w - 60) / n), y - 8, p);
  o += rect(x, y - 120, w, 20, p.wood, p.round ? 'rx="10"' : '') + legs(x + 22, y - 100, w - 44, 100, shade(p.wood, -0.1), p.round);
  o += `<ellipse cx="${x + w / 2}" cy="${y - 124}" rx="52" ry="9" fill="${p.accent}"/>`;
  for (let i = 0; i < 3; i++) o += circle(x + w / 2 - 22 + i * 22, y - 138, 15, '#6F9A73');
  return o;
}
function pendant(x, p) {
  return line(x, 150, x, 300, p.metal, 4) + `<path d="M${x - 72} 350 Q${x} 262 ${x + 72} 350 Z" fill="${p.metal}"/>`;
}
function desk(x, y, w, p) {
  let o = shadow(x, y + 5, w) + rect(x, y - 150, w, 16, p.wood) + legs(x + 8, y - 134, w - 16, 134, p.metal, p.round);
  o += rect(x + w * 0.38, y - 256, 170, 100, '#22282E', 'rx="5"') + rect(x + w * 0.38 + 80, y - 158, 12, 10, p.metal);
  o += rect(x + 30, y - 196, 16, 46, p.accent) + rect(x + 48, y - 186, 16, 36, shade(p.sofa, 0.05));
  return o;
}
function officeChair(x, y, p) {
  return shadow(x, y + 3, 110) + rect(x + 48, y - 80, 12, 70, p.metal) + rect(x + 12, y - 12, 84, 8, p.metal) + `<rect x="${x + 14}" y="${y - 190}" width="82" height="96" rx="16" fill="${p.accent}"/>` + `<rect x="${x + 6}" y="${y - 94}" width="96" height="22" rx="10" fill="${shade(p.accent, -0.1)}"/>`;
}
function shelf(x, y, w, h, p) {
  let o = rect(x, y - h, w, h, shade(p.wood, 0.03));
  const rows = 4;
  for (let i = 0; i < rows; i++) {
    const ry = y - h + 14 + i * ((h - 18) / rows);
    o += rect(x + 10, ry, w - 20, (h - 18) / rows - 12, shade(p.wood, -0.18));
    for (let k = 0; k < 5; k++) o += rect(x + 16 + k * 14, ry + 14, 11, (h - 18) / rows - 26, [p.accent, '#F3EFE3', p.sofa, shade(p.accent, -0.2), '#D8CBA9'][(k + i) % 5]);
  }
  return o;
}
function kitchen(p) {
  const cab = shade(p.sofa, 0.12);
  let o = '';
  o += rect(290, 410, 290, 300, cab) + rect(920, 410, 290, 300, cab);
  o += rect(290, 396, 290, 16, '#E9E6DF') + rect(920, 396, 290, 16, '#E9E6DF');
  o += rect(290, 180, 290, 150, cab) + rect(920, 180, 290, 150, cab);
  for (const bx of [290, 386, 482, 920, 1016, 1112]) { o += rect(bx + 2, 182, 92, 146, 'none', `stroke="${shade(cab, -0.12)}" stroke-width="3"`); o += rect(bx + 2, 416, 92, 288, 'none', `stroke="${shade(cab, -0.12)}" stroke-width="3"`); }
  o += rect(580, 396, 340, 16, '#E9E6DF') + rect(580, 412, 340, 298, cab);
  return o;
}
function island(p) {
  let o = shadow(420, 880, 660) + rect(430, 700, 640, 170, shade(p.sofa, -0.06)) + rect(410, 682, 680, 22, '#EFEDE6');
  for (const x of [500, 690, 880]) o += `<rect x="${x}" y="760" width="110" height="24" rx="12" fill="${p.wood}"/>` + rect(x + 16, 782, 8, 100, p.metal) + rect(x + 86, 782, 8, 100, p.metal);
  o += pendant(620, p) + pendant(880, p);
  o += `<ellipse cx="750" cy="672" rx="70" ry="14" fill="${p.accent}"/>`;
  return o;
}
function oldFurniture() {
  // Dated, cluttered movable pieces for the removal example.
  const c = '#7A5F4A';
  return shadow(390, 790, 620)
    + `<rect x="400" y="580" width="600" height="150" rx="30" fill="${c}"/><rect x="380" y="640" width="90" height="140" rx="28" fill="#6A5240"/><rect x="930" y="640" width="90" height="140" rx="28" fill="#6A5240"/><rect x="460" y="670" width="480" height="100" rx="18" fill="#8C7059"/>`
    + rect(300, 560, 110, 180, '#5A4634') + rect(1060, 500, 150, 250, '#4F3D2E') + rect(1078, 520, 114, 90, '#2A2F35')
    + rect(610, 800, 180, 18, '#5A4634') + rect(630, 818, 10, 50, '#47372A') + rect(760, 818, 10, 50, '#47372A')
    + rect(640, 776, 60, 24, '#C7BBA3') + rect(710, 770, 42, 30, '#9D8B73')
    + `<rect x="480" y="880" width="130" height="70" rx="6" fill="#B79E7D"/><rect x="860" y="850" width="150" height="86" rx="6" fill="#A58B6B"/>`
    + rect(430, 300, 130, 170, '#5A4634') + rect(440, 310, 110, 150, '#B7AE9C') + rect(820, 310, 90, 110, '#5A4634') + rect(828, 318, 74, 94, '#C9BFA9');
}
function outdoor(room, s, p) {
  // Patio, porch and deck: unattached outdoor furniture only.
  const ground = room === 'deck' ? '#B28B62' : room === 'porch' ? '#C9C2B2' : '#CBC6BA';
  let o = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  o += rect(0, 400, W, 240, '#8DB48A') + `<ellipse cx="260" cy="420" rx="310" ry="150" fill="#6E9A70"/><ellipse cx="1240" cy="430" rx="340" ry="170" fill="#5F8C64"/>`;
  if (room === 'porch') {
    o += rect(0, 0, W, 120, '#F3F0E8') + rect(120, 110, 40, 600, '#FBFAF6') + rect(1340, 110, 40, 600, '#FBFAF6') + rect(730, 110, 40, 600, '#FBFAF6');
  }
  if (room === 'patio') o += rect(0, 170, 300, 500, s.wall || p.wall) + rect(40, 240, 200, 300, '#6E8C99') + rect(40, 240, 200, 300, 'none', 'stroke="#FBFAF6" stroke-width="10"');
  o += poly(`0,${H} 90,640 1410,640 ${W},${H}`, ground);
  for (let i = 1; i < 10; i++) o += line(90 + 1320 * (i / 10), 640, W * (i / 10), H, shade(ground, -0.08), 3);
  if (room === 'deck' || room === 'porch') { for (let x = 90; x <= 1410; x += 40) o += rect(x, 540, 8, 100, '#FBFAF6'); o += rect(90, 530, 1320, 12, '#FBFAF6'); }
  if (s.furnish !== 'none') {
    const q = { ...p, round: p.round };
    o += rug(720, 880, { ...q, rug: shade(p.rug, -0.02) }) + sofa(430, 790, 640, q) + coffeeTable(640, 900, 240, q) + plant(310, 800, q) + plant(1190, 800, q);
  }
  return o;
}

function furnishings(s, p) {
  switch (s.room) {
    case 'living-room': return art(640, 250, 220, 150, p) + rug(720, 960, p) + lamp(1030, 730, p) + sofa(440, 790, 620, p) + coffeeTable(640, 890, 230, p) + plant(340, 780, p);
    case 'primary-bedroom': return art(520, 220, 220, 130, p) + rug(740, 900, p, 620) + nightstand(260, 740, p) + nightstand(880, 740, p) + bed(360, 800, 510, p) + plant(1100, 760, p);
    case 'guest-bedroom': return art(450, 240, 170, 130, p) + rug(760, 760, p, 600) + nightstand(800, 745, p) + bed(390, 800, 400, p) + armchair(1020, 790, p);
    case 'childrens-bedroom': return art(380, 250, 130, 130, p) + art(530, 280, 90, 90, p) + rug(770, 720, { ...p, rug: shade(p.accent, 0.3) }, 620) + bed(390, 800, 360, p, true) + shelf(1040, 800, 170, 300, p) + `<circle cx="880" cy="840" r="44" fill="${p.accent}"/>` + rect(780, 790, 70, 70, '#E0B44A');
    case 'dining-room': return art(330, 270, 180, 130, p) + art(990, 270, 180, 130, p) + rug(730, 960, p) + diningTable(400, 830, 700, p) + pendant(750, p);
    case 'home-office': return shelf(990, 720, 200, 460, p) + rug(760, 820, p, 640) + desk(350, 800, 540, p) + officeChair(600, 900, p) + plant(960, 850, p);
    case 'kitchen': return island(p);
    case 'basement': return art(610, 280, 280, 170, p) + rug(730, 980, p) + sofa(420, 790, 660, p) + coffeeTable(640, 895, 230, p) + shelf(1100, 730, 120, 320, p);
    case 'entryway': return rug(760, 560, p) + art(340, 300, 180, 200, { ...p, accent: p.accent }) + rect(330, 620, 200, 16, p.wood) + legs(340, 636, 180, 90, p.metal, p.round) + plant(1040, 780, p) + `<rect x="990" y="310" width="110" height="180" rx="${p.round ? 55 : 4}" fill="#D8E3E5" stroke="${p.metal}" stroke-width="6"/>`;
    case 'sunroom': return rug(730, 960, p) + sofa(480, 790, 560, p) + armchair(1090, 810, p) + coffeeTable(640, 895, 220, p) + plant(330, 780, p);
    default: return '';
  }
}

function interior(s) {
  const st = styles.find((x) => x.id === s.style);
  const p = st.palette;
  const isOut = rooms.find((r) => r.id === s.room).outdoor;
  if (isOut) return outdoor(s.room, s, p);
  let o = shell(s, st) + architecture(s.room);
  if (s.room === 'kitchen') o += kitchen(p);
  if (s.furnish === 'staged') o += furnishings(s, p);
  if (s.furnish === 'old') o += oldFurniture();
  return o;
}

function palm(x, y, h, dusk) {
  const c = dusk ? '#20372F' : '#3F7A58';
  let o = `<path d="M${x - 9} ${y} Q${x + 12} ${y - h / 2} ${x} ${y - h} L${x + 12} ${y - h} Q${x + 26} ${y - h / 2} ${x + 9} ${y} Z" fill="${dusk ? '#2A2622' : '#8B6F52'}"/>`;
  for (const a of [-75, -40, -8, 25, 60, 95, 130, 170]) o += `<ellipse cx="${x + 6}" cy="${y - h - 62}" rx="15" ry="66" fill="${c}" transform="rotate(${a} ${x + 6} ${y - h})"/>`;
  return o;
}
function shrub(x, y, r, dusk) { return `<ellipse cx="${x}" cy="${y}" rx="${r * 1.3}" ry="${r}" fill="${dusk ? '#23403A' : '#55885C'}"/><circle cx="${x - r * 0.4}" cy="${y - r * 0.3}" r="${r * 0.15}" fill="#E8735A" opacity="${dusk ? 0.4 : 1}"/><circle cx="${x + r * 0.5}" cy="${y - r * 0.4}" r="${r * 0.13}" fill="#F2C14E" opacity="${dusk ? 0.4 : 1}"/>`; }

function exterior(s) {
  const dusk = s.time === 'dusk';
  const body = s.color || '#E2D9C5', trim = s.trim || '#FBFAF6', door = s.door || '#2F6170';
  const tone = (c) => (dusk ? shade(c, -0.32) : c);
  let o = `<rect width="${W}" height="${H}" fill="url(#${dusk ? 'dusk' : 'sky'})"/>`;
  o += dusk ? circle(1240, 500, 90, '#FFC98A', 'opacity=".55"') : circle(1240, 170, 62, '#FFE08A');
  o += rect(0, 690, W, 310, dusk ? '#2E4A3F' : s.yard === 'bare' ? '#B9B48C' : '#7EAA6F');
  o += poly('560,1000 940,1000 800,690 680,690', dusk ? '#4A4A4C' : '#C7C3B8');
  // Bungalow elevation
  o += poly('240,360 750,160 1260,360', tone('#6B5B4F'));
  o += rect(290, 360, 920, 340, tone(body));
  for (let y = 380; y < 700; y += 26) o += line(290, y, 1210, y, shade(tone(body), -0.05), 2);
  o += poly('290,360 1210,360 1210,376 290,376', tone(trim));
  const lit = dusk ? '#FFD98A' : '#9CC4D6';
  for (const x of [360, 1000]) o += rect(x - 14, 424, 168, 188, tone(trim)) + rect(x, 438, 140, 160, lit) + rect(x + 67, 438, 6, 160, tone(trim)) + rect(x, 514, 140, 6, tone(trim));
  o += rect(668, 414, 164, 286, tone(trim)) + rect(684, 430, 132, 270, tone(door)) + circle(800, 570, 7, '#E0C068');
  o += rect(620, 690, 260, 18, dusk ? '#55524D' : '#D9D5CB');
  o += poly('600,420 900,420 860,370 640,370', tone('#6B5B4F'));
  if (s.yard !== 'bare') o += shrub(340, 700, 58, dusk) + shrub(490, 708, 44, dusk) + shrub(1010, 708, 46, dusk) + shrub(1160, 700, 60, dusk) + palm(170, 760, 400, dusk) + palm(1370, 780, 340, dusk);
  else o += rect(310, 690, 880, 14, '#A29C74') + `<ellipse cx="420" cy="810" rx="120" ry="20" fill="#A29C74"/><ellipse cx="1120" cy="860" rx="150" ry="24" fill="#A29C74"/>`;
  return o;
}

function stamp(label) {
  const text = esc(label.toUpperCase());
  const w = Math.min(1440, 250 + text.length * 12.6);
  return `<g font-family="Verdana, Arial, sans-serif"><rect x="28" y="${H - 76}" width="${w}" height="48" rx="4" fill="#0E2233" opacity=".82"/><text x="46" y="${H - 45}" font-size="18" font-weight="700" fill="#FFC53D" letter-spacing="2">ILLUSTRATION</text><text x="236" y="${H - 45}" font-size="17" fill="#FFFFFF">${text}</text></g>`;
}

const defs = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8EC8E8"/><stop offset="1" stop-color="#E6F3F7"/></linearGradient><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2A52"/><stop offset=".55" stop-color="#6A4C7E"/><stop offset=".8" stop-color="#E5825B"/><stop offset="1" stop-color="#F7BE7C"/></linearGradient></defs>`;

let count = 0;
for (const m of media) {
  if (!m.src.startsWith('/media/placeholders/')) continue; // a real photo has replaced this slot
  const body = m.scene.kind === 'exterior' ? exterior(m.scene) : interior(m.scene);
  const dim = m.scene.dim ? `<rect width="${W}" height="${H}" fill="#2A2438" opacity=".46"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(m.alt)}"><title>${esc('Illustration: ' + m.label)}</title>${defs}${body}${dim}${stamp(m.label)}</svg>`;
  fs.writeFileSync(path.join(OUT, `${m.id}.svg`), svg.replace(/\s+\/>/g, '/>'));
  count++;
}
console.log(`Generated ${count} illustrations in public/media/placeholders`);
