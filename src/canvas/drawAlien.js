/* 外星人绘制（逐行移植自原始页面） */
import { ALIEN_SPECIES } from '../data/species.js';

const TAU = Math.PI * 2;

export const drawAlien = (ctx, x, y, time, alpha, variantIndex, scale = 1, action, phase) => {
  const s = ALIEN_SPECIES[variantIndex % 20];
  const totalScale = s.scale * scale;
  const mainRgb = s.mainRgb;
  const accentRgb = s.accentRgb;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(totalScale, totalScale);
  let offsetY = 0;
  let rot = 0;
  let al = alpha;
  const ph = phase || 0;
  if (action === 'jump') offsetY = -15 * Math.abs(Math.sin(3 * (time + ph)));
  else if (action === 'spin') rot = 2 * (time + ph);
  else if (action === 'blink') al = alpha * (0.3 + 0.7 * Math.abs(Math.sin(4 * (time + ph))));
  else if (action === 'float') offsetY = 12 * Math.sin(1.5 * (time + ph));
  ctx.translate(0, offsetY);
  ctx.rotate(rot);

  /* 光环 */
  const aura = ctx.createRadialGradient(0, 0, 5, 0, 0, 100);
  aura.addColorStop(0, `rgba(${mainRgb}, ${0.2 * al})`);
  aura.addColorStop(0.3, `rgba(${mainRgb}, ${0.08 * al})`);
  aura.addColorStop(0.6, `rgba(${mainRgb}, ${0.03 * al})`);
  aura.addColorStop(1, `rgba(${mainRgb}, 0)`);
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, 100, 0, TAU);
  ctx.fill();

  /* 脉动圆环 ×3 */
  for (let i = 0; i < 3; i++) {
    const r = 25 + 20 * i + ((15 * time + 20 * i) % 50);
    const a = 0.12 * al * Math.max(0, 1 - r / 100);
    ctx.strokeStyle = `rgba(${mainRgb}, ${a})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.stroke();
  }

  /* 环绕粒子 ×8 */
  for (let i = 0; i < 8; i++) {
    const ang = 0.5 * time + (i / 8) * TAU;
    const dist = 20 + 12 * Math.sin(2 * time + 0.8 * i) + 3 * i;
    const sx = Math.cos(ang) * dist;
    const sy = Math.sin(ang) * dist * 0.7;
    const a = al * (0.3 + 0.3 * Math.sin(3 * time + i));
    ctx.fillStyle = `rgba(${accentRgb}, ${a})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5 + 0.5 * Math.sin(2 * time + i), 0, TAU);
    ctx.fill();
  }

  const headY = -0.5 * s.headHeight - 0.3 * s.bodyHeight;
  const bodyY = 0.2 * s.bodyHeight;

  /* 翅膀 */
  if (s.hasWings) {
    const wingSpan = s.armStyle === 'wing' ? 30 : 20;
    const wingH = 12;
    for (let side = -1; side <= 1; side += 2) {
      const flap = 0.15 * Math.sin(2 * time + 0.5 * side);
      ctx.save();
      ctx.translate(side * s.bodyWidth * 0.5, bodyY);
      ctx.rotate(flap * side);
      ctx.fillStyle = `rgba(${accentRgb}, ${0.35 * al})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(side * wingSpan * 0.6, -wingH, side * wingSpan, -0.3 * wingH);
      ctx.quadraticCurveTo(side * wingSpan * 0.8, 0.5 * wingH, 0, 0.3 * wingH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(${mainRgb}, ${0.4 * al})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(side * wingSpan * 0.8, -0.2 * wingH);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* 尾巴 */
  if (s.hasTail) {
    ctx.strokeStyle = `rgba(${mainRgb}, ${0.5 * al})`;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, bodyY + 0.5 * s.bodyHeight);
    const tailLen = 25;
    const wag = 8 * Math.sin(2 * time);
    ctx.quadraticCurveTo(wag, bodyY + 0.5 * s.bodyHeight + 0.5 * tailLen, 1.5 * wag, bodyY + 0.5 * s.bodyHeight + tailLen);
    ctx.stroke();
    ctx.fillStyle = `rgba(${accentRgb}, ${0.6 * al})`;
    ctx.beginPath();
    ctx.arc(1.5 * wag, bodyY + 0.5 * s.bodyHeight + tailLen, 3, 0, TAU);
    ctx.fill();
  }

  /* 腿 */
  if (s.legCount > 0 && s.legStyle !== 'none') {
    const legTop = bodyY + 0.5 * s.bodyHeight;
    for (let i = 0; i < s.legCount; i++) {
      const lx = (i - (s.legCount - 1) / 2) * (2 * s.bodyWidth / s.legCount);
      const legLen = s.legStyle === 'thick' ? 18 : 14;
      const lw = s.legStyle === 'thick' ? 3 : 1.5;
      const sway = 3 * Math.sin(1.5 * time + 0.8 * i);
      ctx.strokeStyle = `rgba(${mainRgb}, ${0.5 * al})`;
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      if (s.legStyle === 'tentacle') {
        ctx.beginPath();
        ctx.moveTo(lx, legTop);
        ctx.quadraticCurveTo(lx + sway, legTop + 0.5 * legLen, lx + 1.5 * sway, legTop + legLen);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(lx, legTop);
        ctx.lineTo(lx + sway, legTop + legLen);
        ctx.stroke();
        ctx.fillStyle = `rgba(${accentRgb}, ${0.5 * al})`;
        ctx.beginPath();
        ctx.arc(lx + sway, legTop + legLen, lw + 1, 0, TAU);
        ctx.fill();
      }
    }
  }

  /* 身体 */
  ctx.fillStyle = `rgba(${mainRgb}, ${0.5 * al})`;
  switch (s.bodyShape) {
    case 'slim':
      ctx.beginPath();
      ctx.ellipse(0, bodyY, s.bodyWidth, s.bodyHeight, 0, 0, TAU);
      ctx.fill();
      break;
    case 'round':
      ctx.beginPath();
      ctx.arc(0, bodyY, Math.max(s.bodyWidth, s.bodyHeight), 0, TAU);
      ctx.fill();
      break;
    case 'tall':
      ctx.beginPath();
      ctx.ellipse(0, bodyY, 0.8 * s.bodyWidth, 1.2 * s.bodyHeight, 0, 0, TAU);
      ctx.fill();
      break;
    case 'short':
      ctx.beginPath();
      ctx.ellipse(0, bodyY, 1.2 * s.bodyWidth, 0.7 * s.bodyHeight, 0, 0, TAU);
      ctx.fill();
      break;
    case 'insectoid': {
      const segs = 3;
      for (let i = 0; i < segs; i++) {
        const sy = bodyY - 0.3 * s.bodyHeight + i * s.bodyHeight * 0.35;
        const sw = s.bodyWidth * (0.7 + 0.2 * i);
        const sh = 0.3 * s.bodyHeight;
        ctx.beginPath();
        ctx.ellipse(0, sy, sw, sh, 0, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'blob': {
      ctx.beginPath();
      const n = 8;
      for (let i = 0; i <= n; i++) {
        const ang = (i / n) * TAU;
        const wob = 1 + 0.08 * Math.sin(2 * time + 1.5 * i);
        const px = Math.cos(ang) * s.bodyWidth * wob;
        const py = bodyY + Math.sin(ang) * s.bodyHeight * wob;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
  }

  /* 尖刺 */
  if (s.hasSpikes) {
    const n = 8;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * TAU;
      const bx = Math.cos(ang) * s.bodyWidth * 0.9;
      const by = bodyY + Math.sin(ang) * s.bodyHeight * 0.9;
      const len = 8 + 2 * Math.sin(3 * time + i);
      const dx = Math.cos(ang) * len;
      const dy = Math.sin(ang) * len;
      ctx.fillStyle = `rgba(${accentRgb}, ${0.6 * al})`;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + dx - 2 * Math.sin(ang), by + dy + 2 * Math.cos(ang));
      ctx.lineTo(bx + dx + 2 * Math.sin(ang), by + dy - 2 * Math.cos(ang));
      ctx.closePath();
      ctx.fill();
    }
  }

  /* 手臂 */
  if (s.armCount > 0) {
    for (let p = 0; p < s.armCount; p++) {
      const side = p < s.armCount / 2 ? -1 : 1;
      const row = p % Math.ceil(s.armCount / 2);
      const rows = Math.ceil(s.armCount / 2);
      const ay = bodyY - 0.2 * s.bodyHeight + row * (0.4 * s.bodyHeight / rows);
      const waveSway = action === 'wave' ? 0.5 * Math.sin(4 * time + p) : 0;
      switch (s.armStyle) {
        case 'tentacle': {
          ctx.strokeStyle = `rgba(${mainRgb}, ${0.4 * al})`;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          const armLen = 25;
          ctx.beginPath();
          ctx.moveTo(side * s.bodyWidth * 0.8, ay);
          const tipX = side * (s.bodyWidth + 0.6 * armLen + 5 * Math.sin(2 * time + p));
          const tipY = ay + 8 * Math.sin(1.5 * time + 0.8 * p) + 10;
          const cx = side * (s.bodyWidth + 0.3 * armLen);
          const cy = ay + 5 * Math.sin(2 * time + p);
          ctx.quadraticCurveTo(cx, cy, tipX, tipY);
          ctx.stroke();
          break;
        }
        case 'claw': {
          const armLen = 20;
          ctx.strokeStyle = `rgba(${mainRgb}, ${0.5 * al})`;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(side * s.bodyWidth * 0.8, ay);
          const tipX = side * (s.bodyWidth + armLen);
          const tipY = ay + 5 + 3 * Math.sin(1.5 * time + p);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();
          ctx.strokeStyle = `rgba(${accentRgb}, ${0.6 * al})`;
          ctx.lineWidth = 2;
          const clawOpen = 4 + 2 * Math.sin(3 * time + p);
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX + 5 * side, tipY - clawOpen);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX + 5 * side, tipY + clawOpen);
          ctx.stroke();
          break;
        }
        case 'wing':
          break;
        case 'flipper': {
          const armLen = 18;
          ctx.fillStyle = `rgba(${mainRgb}, ${0.4 * al})`;
          ctx.save();
          ctx.translate(side * s.bodyWidth * 0.7, ay);
          ctx.rotate(side * (0.3 + 0.2 * Math.sin(1.5 * time + p) + waveSway));
          ctx.beginPath();
          ctx.ellipse(side * armLen * 0.5, 0, armLen, 5, 0, 0, TAU);
          ctx.fill();
          ctx.restore();
          break;
        }
      }
    }
  }

  /* 头部光晕 + 头 */
  const headGlow = ctx.createRadialGradient(0, headY, 3, 0, headY, s.headWidth + 10);
  headGlow.addColorStop(0, `rgba(${mainRgb}, ${0.4 * al})`);
  headGlow.addColorStop(0.5, `rgba(${mainRgb}, ${0.15 * al})`);
  headGlow.addColorStop(1, `rgba(${mainRgb}, 0)`);
  ctx.fillStyle = headGlow;
  ctx.beginPath();
  ctx.arc(0, headY, s.headWidth + 10, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(${mainRgb}, ${0.7 * al})`;
  switch (s.headShape) {
    case 'oval':
      ctx.beginPath();
      ctx.ellipse(0, headY, s.headWidth, s.headHeight, 0, 0, TAU);
      ctx.fill();
      break;
    case 'round':
      ctx.beginPath();
      ctx.arc(0, headY, Math.max(s.headWidth, s.headHeight), 0, TAU);
      ctx.fill();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(0, headY - s.headHeight);
      ctx.lineTo(-s.headWidth, headY + 0.5 * s.headHeight);
      ctx.lineTo(s.headWidth, headY + 0.5 * s.headHeight);
      ctx.closePath();
      ctx.fill();
      break;
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(0, headY - s.headHeight);
      ctx.lineTo(s.headWidth, headY);
      ctx.lineTo(0, headY + 0.6 * s.headHeight);
      ctx.lineTo(-s.headWidth, headY);
      ctx.closePath();
      ctx.fill();
      break;
    case 'elongated':
      ctx.beginPath();
      ctx.ellipse(0, headY, 0.7 * s.headWidth, 1.2 * s.headHeight, 0, 0, TAU);
      ctx.fill();
      break;
    case 'flat':
      ctx.beginPath();
      ctx.ellipse(0, headY, 1.2 * s.headWidth, 0.6 * s.headHeight, 0, 0, TAU);
      ctx.fill();
      break;
    case 'heart':
      ctx.beginPath();
      ctx.moveTo(0, headY + 0.3 * s.headHeight);
      ctx.bezierCurveTo(-1.2 * s.headWidth, headY - 0.4 * s.headHeight, -0.5 * s.headWidth, headY - s.headHeight, 0, headY - 0.3 * s.headHeight);
      ctx.bezierCurveTo(0.5 * s.headWidth, headY - s.headHeight, 1.2 * s.headWidth, headY - 0.4 * s.headHeight, 0, headY + 0.3 * s.headHeight);
      ctx.fill();
      break;
    case 'crescent':
      ctx.beginPath();
      ctx.arc(0, headY, s.headWidth, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      break;
  }

  /* 角 */
  if (s.hasHorns && s.hornCount > 0) {
    for (let p = 0; p < s.hornCount; p++) {
      const hx = (p < s.hornCount / 2 ? -1 : 1) * (0.5 * s.headWidth + 3 * p);
      const hh = 10 + 2 * p;
      ctx.fillStyle = `rgba(${accentRgb}, ${0.6 * al})`;
      ctx.beginPath();
      ctx.moveTo(hx - 3, headY - 0.5 * s.headHeight);
      ctx.lineTo(hx, headY - 0.5 * s.headHeight - hh);
      ctx.lineTo(hx + 3, headY - 0.5 * s.headHeight);
      ctx.closePath();
      ctx.fill();
    }
  }

  /* 眼睛 */
  const shineT = 0.3 * time;
  const eyes = [];
  if (s.eyePosition === 'front') {
    if (s.eyeCount === 1) {
      eyes.push({ ex: 0, ey: headY - 0.1 * s.headHeight });
    } else if (s.eyeCount === 2) {
      const d = 0.4 * s.headWidth;
      eyes.push({ ex: -d, ey: headY - 0.1 * s.headHeight });
      eyes.push({ ex: d, ey: headY - 0.1 * s.headHeight });
    } else if (s.eyeCount === 3) {
      const d = 0.35 * s.headWidth;
      eyes.push({ ex: -d, ey: headY - 0.1 * s.headHeight });
      eyes.push({ ex: 0, ey: headY - 0.3 * s.headHeight });
      eyes.push({ ex: d, ey: headY - 0.1 * s.headHeight });
    } else {
      const topN = Math.ceil(s.eyeCount / 2);
      const botN = s.eyeCount - topN;
      for (let i = 0; i < topN; i++) eyes.push({ ex: (i - (topN - 1) / 2) * (0.4 * s.headWidth), ey: headY - 0.3 * s.headHeight });
      for (let i = 0; i < botN; i++) eyes.push({ ex: (i - (botN - 1) / 2) * (0.5 * s.headWidth), ey: headY + 0.05 * s.headHeight });
    }
  } else if (s.eyePosition === 'side') {
    const per = Math.ceil(s.eyeCount / 2);
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < per; i++) {
        eyes.push({ ex: side * s.headWidth * 0.7, ey: headY - 0.2 * s.headHeight + i * (0.4 * s.headHeight / Math.max(1, per - 1)) });
      }
    }
  } else {
    for (let p = 0; p < s.eyeCount; p++) {
      eyes.push({ ex: (p - (s.eyeCount - 1) / 2) * (0.3 * s.headWidth), ey: headY - 0.6 * s.headHeight });
    }
  }
  eyes.forEach((eye, idx) => {
    const { ex, ey } = eye;
    const es = s.eyeSize;
    const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, 2 * es);
    glow.addColorStop(0, `rgba(${mainRgb}, ${0.6 * al})`);
    glow.addColorStop(0.5, `rgba(${mainRgb}, ${0.15 * al})`);
    glow.addColorStop(1, `rgba(${mainRgb}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ex, ey, 2 * es, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(0, 10, 5, ${0.9 * al})`;
    switch (s.eyeShape) {
      case 'round':
        ctx.beginPath();
        ctx.arc(ex, ey, es, 0, TAU);
        ctx.fill();
        break;
      case 'oval':
        ctx.beginPath();
        ctx.ellipse(ex, ey, 0.7 * es, es, 0, 0, TAU);
        ctx.fill();
        break;
      case 'slit':
        ctx.beginPath();
        ctx.ellipse(ex, ey, 0.3 * es, es, 0, 0, TAU);
        ctx.fill();
        break;
      case 'compound': {
        const sub = 4;
        for (let i = 0; i < sub; i++) {
          const a = (i / sub) * TAU;
          const r = 0.4 * es;
          ctx.beginPath();
          ctx.arc(ex + Math.cos(a) * r, ey + Math.sin(a) * r, 0.35 * es, 0, TAU);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(ex, ey, 0.3 * es, 0, TAU);
        ctx.fill();
        break;
      }
    }
    ctx.fillStyle = `rgba(${mainRgb}, ${al})`;
    ctx.beginPath();
    ctx.arc(ex + 2 * Math.cos(shineT + idx), ey + 2 * Math.sin(shineT + idx), 0.35 * es, 0, TAU);
    ctx.fill();
  });

  /* 触角 */
  if (s.hasAntenna && s.antennaCount > 0) {
    for (let p = 0; p < s.antennaCount; p++) {
      const ax = (s.antennaCount === 1 ? 0 : p < s.antennaCount / 2 ? -1 : 1) * (0.4 * s.headWidth + 3 * p);
      const ay = headY - 0.8 * s.headHeight;
      const tipX = ax + 5 * Math.sin(2.5 * time + p);
      const tipY = ay - 20;
      ctx.strokeStyle = `rgba(${mainRgb}, ${0.6 * al})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(ax + 5 * Math.sin(2 * time + p), ay - 10, tipX, tipY);
      ctx.stroke();
      const tipGlow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 8);
      tipGlow.addColorStop(0, `rgba(${accentRgb}, ${0.8 * al})`);
      tipGlow.addColorStop(0.5, `rgba(${accentRgb}, ${0.2 * al})`);
      tipGlow.addColorStop(1, `rgba(${accentRgb}, 0)`);
      ctx.fillStyle = tipGlow;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(${accentRgb}, ${al})`;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 3, 0, TAU);
      ctx.fill();
    }
  }

  ctx.restore();
};
