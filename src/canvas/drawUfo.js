/* UFO 绘制（逐行移植自原始页面） */
import { UFO_VARIANTS } from '../data/species.js';

const TAU = Math.PI * 2;

export const drawUfo = (ctx, x, y, time, alpha, variantIndex) => {
  const s = UFO_VARIANTS[variantIndex % 20];
  const mainRgb = s.mainRgb;
  const accentRgb = s.accentRgb;
  const lightRgb = s.lightRgb;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s.scale, s.scale);

  /* 光束 */
  if (s.hasBeam) {
    const beam = ctx.createLinearGradient(0, 8, 0, 140);
    beam.addColorStop(0, `rgba(${mainRgb}, ${0.12 + 0.05 * Math.sin(2 * time)})`);
    beam.addColorStop(0.3, `rgba(${mainRgb}, 0.06)`);
    beam.addColorStop(0.7, `rgba(${mainRgb}, 0.02)`);
    beam.addColorStop(1, `rgba(${mainRgb}, 0)`);
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(-12, 8);
    ctx.lineTo(-55, 140);
    ctx.lineTo(55, 140);
    ctx.lineTo(12, 8);
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const py = 20 + (30 * time + 18 * i) % 120;
      const spread = (py / 140) * 45;
      const px = Math.sin(2 * time + 1.2 * i) * spread * 0.3;
      const a = 0.4 * alpha * (1 - py / 140);
      ctx.fillStyle = `rgba(${mainRgb}, ${a})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.5 + 0.5 * Math.sin(time + i), 0, TAU);
      ctx.fill();
    }
  }

  /* 光环 */
  const aura = ctx.createRadialGradient(0, 0, 10, 0, 0, 80);
  aura.addColorStop(0, `rgba(${mainRgb}, ${0.25 * alpha})`);
  aura.addColorStop(0.3, `rgba(${mainRgb}, ${0.1 * alpha})`);
  aura.addColorStop(0.6, `rgba(${mainRgb}, ${0.03 * alpha})`);
  aura.addColorStop(1, `rgba(${mainRgb}, 0)`);
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, 80, 0, TAU);
  ctx.fill();

  /* 环带 */
  if (s.hasRing) {
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(0.3 * time);
    ctx.scale(1, 0.3);
    ctx.strokeStyle = `rgba(${accentRgb}, ${0.4 * alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 1.3 * s.bodyWidth, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${accentRgb}, ${0.25 * alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 1.5 * s.bodyWidth, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  /* 翅膀 */
  if (s.hasWings && s.wingSize > 0) {
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = `rgba(${accentRgb}, ${0.4 * alpha})`;
      ctx.beginPath();
      ctx.moveTo(side * s.bodyWidth * 0.6, 0);
      ctx.lineTo(side * (s.bodyWidth + s.wingSize), -0.3 * -s.wingSize);
      ctx.lineTo(side * (s.bodyWidth + 0.8 * s.wingSize), 0.5 * s.bodyHeight);
      ctx.lineTo(side * s.bodyWidth * 0.6, 0.3 * s.bodyHeight);
      ctx.closePath();
      ctx.fill();
      const blink = 0.5 + 0.5 * Math.sin(3 * time + side);
      ctx.fillStyle = `rgba(${lightRgb}, ${blink * alpha})`;
      ctx.beginPath();
      ctx.arc(side * (s.bodyWidth + s.wingSize), -0.3 * -s.wingSize, 2, 0, TAU);
      ctx.fill();
    }
  }

  /* 机身 */
  const bw = s.bodyWidth;
  const bh = s.bodyHeight;
  const bodyGrad = ctx.createLinearGradient(-bw, 0, bw, 0);
  bodyGrad.addColorStop(0, `rgba(100, 120, 160, ${0.5 * alpha})`);
  bodyGrad.addColorStop(0.3, `rgba(180, 200, 230, ${0.8 * alpha})`);
  bodyGrad.addColorStop(0.5, `rgba(220, 230, 245, ${0.9 * alpha})`);
  bodyGrad.addColorStop(0.7, `rgba(180, 200, 230, ${0.8 * alpha})`);
  bodyGrad.addColorStop(1, `rgba(100, 120, 160, ${0.5 * alpha})`);
  ctx.fillStyle = bodyGrad;
  switch (s.shape) {
    case 'saucer':
      ctx.beginPath();
      ctx.ellipse(0, 4, bw, bh, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(60, 80, 120, ${0.4 * alpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 8, 0.92 * bw, 6, 0, 0, Math.PI);
      ctx.fill();
      break;
    case 'cylinder':
      ctx.beginPath();
      ctx.roundRect(-0.5 * bw, -0.5 * bh, bw, 1.5 * bh, 4);
      ctx.fill();
      ctx.fillStyle = `rgba(${accentRgb}, ${0.3 * alpha})`;
      ctx.beginPath();
      ctx.ellipse(-0.5 * bw, 0.25 * bh, 4, 0.5 * bh, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0.5 * bw, 0.25 * bh, 4, 0.5 * bh, 0, 0, TAU);
      ctx.fill();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(0, -bh);
      ctx.lineTo(-bw, bh);
      ctx.lineTo(bw, bh);
      ctx.closePath();
      ctx.fill();
      break;
    case 'sphere': {
      ctx.beginPath();
      ctx.arc(0, 0, 0.5 * Math.max(bw, bh), 0, TAU);
      ctx.fill();
      const hl = ctx.createRadialGradient(-0.15 * bw, -0.15 * bh, 0, 0, 0, 0.5 * bw);
      hl.addColorStop(0, `rgba(255, 255, 255, ${0.15 * alpha})`);
      hl.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = hl;
      ctx.beginPath();
      ctx.arc(0, 0, 0.5 * Math.max(bw, bh), 0, TAU);
      ctx.fill();
      break;
    }
    case 'ring':
      ctx.beginPath();
      ctx.arc(0, 0, 0.5 * bw, 0, TAU);
      ctx.arc(0, 0, 0.3 * bw, 0, TAU, true);
      ctx.fill();
      ctx.fillStyle = `rgba(${accentRgb}, ${0.5 * alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, 0.2 * bw, 0, TAU);
      ctx.fill();
      break;
    case 'arrow':
      ctx.beginPath();
      ctx.moveTo(bw, 0);
      ctx.lineTo(-0.6 * bw, -bh);
      ctx.lineTo(-0.25 * bw, 0);
      ctx.lineTo(-0.6 * bw, bh);
      ctx.closePath();
      ctx.fill();
      break;
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(0, -bh);
      ctx.lineTo(bw, 0);
      ctx.lineTo(0, bh);
      ctx.lineTo(-bw, 0);
      ctx.closePath();
      ctx.fill();
      break;
    case 'cross': {
      const t = 0.25 * bw;
      const a = 0.8 * bw;
      ctx.beginPath();
      ctx.rect(-t, -a, 2 * t, 2 * a);
      ctx.rect(-a, -t, 2 * a, 2 * t);
      ctx.fill();
      break;
    }
  }

  /* 驾驶舱 */
  if (s.domeShape !== 'none') {
    const dw = s.domeWidth;
    const dh = s.domeHeight;
    const domeGrad = ctx.createRadialGradient(-3, -6, 2, 0, -2, dw);
    domeGrad.addColorStop(0, `rgba(200, 220, 255, ${0.7 * alpha})`);
    domeGrad.addColorStop(0.5, `rgba(120, 160, 220, ${0.5 * alpha})`);
    domeGrad.addColorStop(1, `rgba(80, 120, 180, ${0.4 * alpha})`);
    ctx.fillStyle = domeGrad;
    switch (s.domeShape) {
      case 'round':
        ctx.beginPath();
        ctx.ellipse(0, -2, dw, dh, 0, Math.PI, 0);
        ctx.fill();
        break;
      case 'pointed':
        ctx.beginPath();
        ctx.moveTo(-dw, 0);
        ctx.quadraticCurveTo(-0.5 * dw, -1.5 * dh, 0, -1.5 * dh);
        ctx.quadraticCurveTo(0.5 * dw, -1.5 * dh, dw, 0);
        ctx.fill();
        break;
      case 'flat':
        ctx.beginPath();
        ctx.ellipse(0, -2, dw, 0.4 * dh, 0, Math.PI, 0);
        ctx.fill();
        break;
      case 'double':
        ctx.beginPath();
        ctx.ellipse(0, -2, dw, 0.7 * dh, 0, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, -2 - 0.5 * dh, 0.6 * dw, 0.5 * dh, 0, Math.PI, 0);
        ctx.fill();
        break;
    }
  }

  /* 灯光 */
  for (let i = 0; i < s.lightCount; i++) {
    const ang = (i / s.lightCount) * TAU + 2.5 * time;
    let lx;
    let ly;
    if (s.shape === 'sphere') {
      lx = Math.cos(ang) * bw * 0.4;
      ly = Math.sin(ang) * bh * 0.4;
    } else if (s.shape === 'ring') {
      lx = Math.cos(ang) * bw * 0.4;
      ly = Math.sin(ang) * bw * 0.4;
    } else if (s.shape === 'cross') {
      const edge = 0.8 * bw;
      const t = (i / s.lightCount) * edge * 4;
      if (t < edge) { lx = 0; ly = -t; }
      else if (t < 2 * edge) { lx = t - edge; ly = 0; }
      else if (t < 3 * edge) { lx = 0; ly = t - 2 * edge; }
      else { lx = -(t - 3 * edge); ly = 0; }
    } else {
      lx = Math.cos(ang) * 0.79 * bw;
      ly = Math.sin(ang) * 0.7 * bh + 4;
    }
    const blink = 0.5 + 0.5 * Math.sin(5 * time + 0.8 * i);
    const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 6 + s.lightSize);
    glow.addColorStop(0, `rgba(${lightRgb}, ${0.6 * blink})`);
    glow.addColorStop(1, `rgba(${lightRgb}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lx, ly, 6 + s.lightSize, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(${lightRgb}, ${blink})`;
    ctx.beginPath();
    ctx.arc(lx, ly, s.lightSize, 0, TAU);
    ctx.fill();
  }

  /* 引擎 */
  for (let i = 0; i < s.engineCount; i++) {
    let ex;
    let ey;
    if (s.enginePosition === 'bottom') {
      ex = (i - (s.engineCount - 1) / 2) * (1.5 * bw / s.engineCount);
      ey = bh + 8 + 2 * Math.sin(4 * time + i);
    } else if (s.enginePosition === 'back') {
      ex = -0.5 * bw - 5;
      ey = 8 * (i - (s.engineCount - 1) / 2);
    } else {
      ex = (i < s.engineCount / 2 ? -1 : 1) * (0.8 * bw + 5);
      ey = (i % Math.ceil(s.engineCount / 2)) * 6 - 3;
    }
    const flicker = alpha * (0.3 + 0.2 * Math.sin(6 * time + 2 * i));
    const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey + 10, 12);
    glow.addColorStop(0, `rgba(${mainRgb}, ${flicker})`);
    glow.addColorStop(0.5, `rgba(${mainRgb}, ${0.4 * flicker})`);
    glow.addColorStop(1, `rgba(${mainRgb}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ex, ey + 5, 12, 0, TAU);
    ctx.fill();
  }

  /* 天线 */
  if (s.hasAntenna) {
    ctx.strokeStyle = `rgba(${mainRgb}, ${0.6 * alpha})`;
    ctx.lineWidth = 1.5;
    const tipX = 3 * Math.sin(2 * time);
    ctx.beginPath();
    ctx.moveTo(0, -s.domeHeight - 4);
    ctx.lineTo(tipX, -s.domeHeight - 18);
    ctx.stroke();
    const glow = ctx.createRadialGradient(tipX, -s.domeHeight - 18, 0, tipX, -s.domeHeight - 18, 6);
    glow.addColorStop(0, `rgba(${lightRgb}, ${0.8 * alpha})`);
    glow.addColorStop(1, `rgba(${lightRgb}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(tipX, -s.domeHeight - 18, 6, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
};
