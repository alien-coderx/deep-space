/* 深空背景动画（逐行移植自原始页面，去掉分析师人物） */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { drawAlien } from '../canvas/drawAlien.js';
import { drawUfo } from '../canvas/drawUfo.js';
import { UFO_VARIANTS } from '../data/species.js';
import { PLANET_TEXTS, UFO_DROP_DIALOGUE, ALIEN_ACTIONS, MAX_ALIENS } from '../data/spaceTexts.js';

const TAU = Math.PI * 2;

const BackgroundAnimation = () => {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const [tooltip, setTooltip] = useState({ name: '', text: '', x: 0, y: 0, visible: false });
  const [dialogue, setDialogue] = useState({ text: '', x: 0, y: 0, visible: 0 });
  const ufoRef = useRef({ state: 'idle', x: 0, y: 0, variantIndex: 0, startTime: 0, trail: [], alienPickedUp: false });
  const residentVisibleRef = useRef(true);
  const residentVariantRef = useRef(0);
  const hoverRef = useRef({ type: '', index: -1, name: '' });
  const dialogueTimerRef = useRef(null);
  const aliensRef = useRef([]);
  const meteorsRef = useRef([]);
  const starsRef = useRef([]);

  const { farStars, midStars, nearStars, nebulae, spiralParticles, planets } = useMemo(() => {
    const rand = (a, b) => Math.random() * (b - a) + a;

    const farStars = Array.from({ length: 600 }, () => ({
      x: rand(0, 1), y: rand(0, 1), r: rand(0.3, 0.8),
      brightness: rand(0.15, 0.4), twinkleSpeed: rand(0.5, 2), twinkleOffset: rand(0, TAU)
    }));

    const midStars = Array.from({ length: 180 }, () => {
      const t = Math.random();
      let color;
      if (t < 0.3) color = '180, 210, 255';
      else if (t < 0.5) color = '255, 220, 180';
      else if (t < 0.65) color = '200, 180, 255';
      else if (t < 0.8) color = '180, 255, 220';
      else color = '255, 200, 200';
      return {
        x: rand(0, 1), y: rand(0, 1), r: rand(0.8, 1.8), brightness: rand(0.4, 0.8),
        twinkleSpeed: rand(0.3, 1.5), twinkleOffset: rand(0, TAU), color
      };
    });

    const nearStars = Array.from({ length: 40 }, () => {
      const t = Math.random();
      let color;
      if (t < 0.35) color = '88, 166, 255';
      else if (t < 0.55) color = '136, 46, 224';
      else if (t < 0.75) color = '35, 213, 171';
      else color = '255, 200, 100';
      return {
        x: rand(0, 1), y: rand(0, 1), r: rand(1.5, 3), brightness: rand(0.6, 1),
        twinkleSpeed: rand(0.2, 0.8), twinkleOffset: rand(0, TAU), glowR: rand(8, 20), color
      };
    });

    const nebulae = Array.from({ length: 10 }, () => {
      const t = Math.random();
      let color;
      if (t < 0.3) color = '88, 166, 255';
      else if (t < 0.5) color = '136, 46, 224';
      else if (t < 0.7) color = '35, 213, 171';
      else color = '255, 100, 150';
      return {
        x: rand(0.05, 0.95), y: rand(0.05, 0.95), rx: rand(150, 400), ry: rand(100, 300),
        rotation: rand(0, 360), opacity: rand(0.02, 0.05), color
      };
    });

    const spiralParticles = [];
    const palettes = [
      ['88, 166, 255', '136, 46, 224', '200, 180, 255'],
      ['136, 46, 224', '255, 100, 150', '200, 180, 255'],
      ['35, 213, 171', '88, 166, 255', '180, 255, 220'],
      ['255, 200, 100', '255, 150, 80', '255, 220, 180']
    ];
    for (let arm = 0; arm < 4; arm++) {
      const baseAngle = (arm / 4) * TAU;
      for (let i = 0; i < 800; i++) {
        const dist = rand(0.05, 1.2);
        const angle = baseAngle + 3 * dist + rand(-0.4, 0.4);
        const spread = rand(-1, 1) * (0.02 + 0.1 * dist);
        const palette = palettes[arm];
        spiralParticles.push({
          angle, dist, spread,
          brightness: rand(0.08, 0.4) * (1 - 0.35 * dist),
          size: rand(0.3, 1.5) * (1 - 0.2 * dist),
          color: palette[Math.floor(Math.random() * palette.length)]
        });
      }
    }
    for (let i = 0; i < 500; i++) {
      const t = Math.random();
      let color;
      if (t < 0.4) color = '255, 220, 150';
      else if (t < 0.7) color = '255, 200, 100';
      else color = '255, 240, 200';
      spiralParticles.push({
        angle: rand(0, TAU), dist: rand(0, 0.18), spread: rand(-0.05, 0.05),
        brightness: rand(0.3, 0.7), size: rand(0.5, 1.5), color
      });
    }

    const planets = [
      { name: '水星', orbitRadius: 0.1, size: 3, speed: 4.15, color: '180, 160, 140', glowColor: '180, 160, 140', angle: rand(0, TAU) },
      { name: '金星', orbitRadius: 0.16, size: 4.5, speed: 1.62, color: '255, 200, 100', glowColor: '255, 200, 100', angle: rand(0, TAU) },
      { name: '地球', orbitRadius: 0.24, size: 5, speed: 1, color: '88, 166, 255', glowColor: '88, 166, 255', angle: rand(0, TAU), hasMoon: true, moonDist: 12, moonSize: 1.5, moonSpeed: 12, moonAngle: rand(0, TAU) },
      { name: '火星', orbitRadius: 0.32, size: 4, speed: 0.53, color: '255, 120, 80', glowColor: '255, 120, 80', angle: rand(0, TAU) },
      { name: '木星', orbitRadius: 0.44, size: 10, speed: 0.084, color: '255, 180, 100', glowColor: '255, 180, 100', angle: rand(0, TAU) },
      { name: '土星', orbitRadius: 0.56, size: 8, speed: 0.034, color: '230, 200, 150', glowColor: '230, 200, 150', angle: rand(0, TAU), hasRing: true },
      { name: '天王星', orbitRadius: 0.68, size: 6, speed: 0.012, color: '150, 220, 255', glowColor: '150, 220, 255', angle: rand(0, TAU) },
      { name: '海王星', orbitRadius: 0.8, size: 6, speed: 0.006, color: '60, 100, 255', glowColor: '60, 100, 255', angle: rand(0, TAU) }
    ];

    return { farStars, midStars, nearStars, nebulae, spiralParticles, planets };
  }, []);

  const hitTest = useCallback(
    (px, py, time, w, h) => {
      const sunX = 0.5 * w;
      const sunY = 0.5 * h;
      const solarR = 0.42 * Math.min(w, h);
      const sunSize = 0.028 * Math.min(w, h);
      if (Math.sqrt((px - sunX) ** 2 + (py - sunY) ** 2) < 2 * sunSize) {
        return { type: 'planet', index: -1, name: '太阳' };
      }
      for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        const orbit = p.orbitRadius * solarR;
        const ang = p.angle + time * p.speed * 0.12;
        const cx = sunX + Math.cos(ang) * orbit;
        const cy = sunY + Math.sin(ang) * orbit;
        if (Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) < 2 * p.size) {
          return { type: 'planet', index: i, name: p.name };
        }
      }
      const ufo = ufoRef.current;
      const homeX = 0.15 * w + 15 * Math.sin(0.6 * time);
      const homeY = 0.78 * h + 8 * Math.cos(0.5 * time);
      const ux = ufo.state === 'idle' ? homeX : ufo.x;
      const uy = ufo.state === 'idle' ? homeY : ufo.y;
      if (Math.sqrt((px - ux) ** 2 + (py - uy) ** 2) < 45) {
        return { type: 'ufo', index: 0, name: '' };
      }
      /* 已生成的外星人（可点击推动） */
      const spawned = aliensRef.current;
      for (let i = 0; i < spawned.length; i++) {
        const sa = spawned[i];
        if (!sa.merging && !sa.becomingStar && Math.sqrt((px - sa.x) ** 2 + (py - sa.y) ** 2) < 40) {
          return { type: 'spawned-alien', index: i, name: '' };
        }
      }
      const alienX = 0.82 * w;
      const alienY = 0.18 * h + 8 * Math.sin(0.8 * time);
      if (Math.sqrt((px - alienX) ** 2 + (py - alienY) ** 2) < 50) {
        return { type: 'alien', index: 0, name: '' };
      }
      return { type: '', index: -1, name: '' };
    },
    [planets]
  );

  const handleMouseMove = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const time = performance.now() / 1000;
      const hit = hitTest(x, y, time, canvas.width, canvas.height);
      hoverRef.current = hit;
      canvas.style.cursor = hit.type ? 'pointer' : 'default';
      if (hit.type === 'planet') {
        const text = PLANET_TEXTS[hit.name];
        if (text) {
          setTooltip((prev) =>
            prev.name === hit.name && prev.visible
              ? prev
              : { name: hit.name, text, x: e.clientX, y: e.clientY, visible: true }
          );
        }
      } else {
        setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      }
    },
    [hitTest]
  );

  const handleClick = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const time = performance.now() / 1000;
      const w = canvas.width;
      const h = canvas.height;
      const hit = hitTest(x, y, time, w, h);
      if (hit.type === 'planet') {
        const text = PLANET_TEXTS[hit.name];
        if (text) setTooltip({ name: hit.name, text, x: e.clientX, y: e.clientY, visible: true });
      } else if (hit.type === 'spawned-alien') {
        /* 点击外星人：50% 闪一下变成星星 / 50% 原地自旋飞向别处（太空惯性滑行） */
        const sa = aliensRef.current[hit.index];
        if (sa && !sa.merging && !sa.becomingStar) {
          if (Math.random() < 0.5) {
            sa.becomingStar = true;
            sa.starFlash = 0;
          } else {
            sa.pushed = true;
            const ang = Math.random() * TAU;
            const speed = 8 + 7 * Math.random();
            sa.pushVX = Math.cos(ang) * speed;
            sa.pushVY = Math.sin(ang) * speed;
            sa.pushRotSpeed = (Math.random() < 0.5 ? -1 : 1) * (0.3 + 0.25 * Math.random());
          }
        }
      } else if (hit.type === 'ufo') {
        const ufo = ufoRef.current;
        if (ufo.state === 'idle') {
          ufo.state = 'flying_to_alien';
          ufo.startTime = performance.now();
          ufo.x = 0.15 * w + 15 * Math.sin(0.6 * time);
          ufo.y = 0.78 * h + 8 * Math.cos(0.5 * time);
          ufo.trail = [];
          ufo.alienPickedUp = false;
          /* 点击 UFO：所有已生成的外星人飞回常驻外星人处合体 */
          aliensRef.current.forEach((a) => {
            a.merging = true;
            a.pushed = false;
            a.becomingStar = false;
            a.targetX = 0.82 * w;
            a.targetY = 0.18 * h;
          });
        }
      } else if (hit.type === 'alien') {
        if (!residentVisibleRef.current) return;
        const aliens = aliensRef.current;
        if (aliens.length < MAX_ALIENS) {
          const variant = Math.floor(20 * Math.random());
          residentVariantRef.current = variant;
          aliens.push({
            x: 0.82 * w,
            y: 0.18 * h,
            targetX: Math.random() * w * 0.94 + 0.03 * w,
            targetY: Math.random() * h * 0.9 + 0.05 * h,
            variantIndex: variant,
            action: ALIEN_ACTIONS[Math.floor(Math.random() * ALIEN_ACTIONS.length)],
            createdAt: performance.now(),
            merging: false,
            mergeProgress: 0,
            scale: 1,
            actionPhase: Math.random() * TAU
          });
        }
      }
    },
    [hitTest]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    let lastMeteor = 0;

    const frame = (timestamp) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const t = timestamp / 1000;
      const drift = 0.012 * t;
      const dx = 20 * Math.sin(drift);
      const dy = 12 * Math.cos(0.7 * drift);

      /* 星云 */
      nebulae.forEach((neb) => {
        ctx.save();
        ctx.translate(neb.x * w + 2 * dx, neb.y * h + 2 * dy);
        ctx.rotate((neb.rotation * Math.PI) / 180 + 0.1 * drift);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, neb.rx);
        grad.addColorStop(0, `rgba(${neb.color}, ${1.5 * neb.opacity})`);
        grad.addColorStop(0.4, `rgba(${neb.color}, ${neb.opacity})`);
        grad.addColorStop(1, `rgba(${neb.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.scale(1, neb.ry / neb.rx);
        ctx.beginPath();
        ctx.arc(0, 0, neb.rx, 0, TAU);
        ctx.fill();
        ctx.restore();
      });

      /* 旋涡星系（居中，与太阳同位） */
      const gx = 0.5 * w;
      const gy = 0.5 * h;
      const galR = 0.75 * Math.max(w, h);
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(drift);
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 0.5 * galR);
      core.addColorStop(0, 'rgba(255, 220, 150, 0.08)');
      core.addColorStop(0.1, 'rgba(255, 200, 100, 0.05)');
      core.addColorStop(0.25, 'rgba(255, 180, 80, 0.025)');
      core.addColorStop(0.5, 'rgba(136, 46, 224, 0.008)');
      core.addColorStop(1, 'rgba(88, 166, 255, 0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, 0.5 * galR, 0, TAU);
      ctx.fill();
      const falloffR = 0.6 * Math.min(w, h);
      spiralParticles.forEach((p) => {
        const dist = p.dist * galR;
        const ang = p.angle + p.spread;
        const px = Math.cos(ang) * dist;
        const py = Math.sin(ang) * dist * 0.5;
        const distC = Math.sqrt(px * px + py * py);
        const fall = Math.max(0.15, 1 - (distC / falloffR) ** 1.5);
        const twinkle = 0.6 + 0.4 * Math.sin(1.5 * t + 3 * p.angle);
        const alpha = p.brightness * twinkle * fall;
        if (alpha < 0.01) return;
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * (0.6 + 0.4 * fall), 0, TAU);
        ctx.fill();
      });
      ctx.restore();

      /* 恒星层（受太阳系位置压暗） */
      const sunX = 0.5 * w;
      const sunY = 0.5 * h;
      const dimR = 0.65 * Math.max(w, h);
      farStars.forEach((s) => {
        const tw = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
        const px = s.x * w + 0.5 * dx;
        const py = s.y * h + 0.5 * dy;
        const d = Math.sqrt((px - sunX) ** 2 + (py - sunY) ** 2);
        const fall = Math.max(0.2, 1 - (d / dimR) ** 1.8);
        const alpha = s.brightness * tw * fall;
        if (alpha < 0.01) return;
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, TAU);
        ctx.fill();
      });
      midStars.forEach((s) => {
        const tw = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
        const px = s.x * w + dx;
        const py = s.y * h + dy;
        const d = Math.sqrt((px - sunX) ** 2 + (py - sunY) ** 2);
        const fall = Math.max(0.2, 1 - (d / dimR) ** 1.8);
        const alpha = s.brightness * tw * fall;
        if (alpha < 0.01) return;
        ctx.fillStyle = `rgba(${s.color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, TAU);
        ctx.fill();
      });

      /* 太阳系 */
      const solarR = 0.42 * Math.min(w, h);
      ctx.save();
      ctx.translate(sunX, sunY);
      const sunSize = 0.028 * Math.min(w, h);
      const halo = ctx.createRadialGradient(2 * sunSize, 2 * sunSize, 0.5 * sunSize, 2 * sunSize, 2 * sunSize, 16 * sunSize);
      halo.addColorStop(0, 'rgba(255, 200, 50, 0.14)');
      halo.addColorStop(0.15, 'rgba(255, 150, 30, 0.08)');
      halo.addColorStop(0.4, 'rgba(255, 100, 20, 0.03)');
      halo.addColorStop(1, 'rgba(255, 80, 10, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(2 * sunSize, 2 * sunSize, 16 * sunSize, 0, TAU);
      ctx.fill();
      const glow = ctx.createRadialGradient(0, 0, 0.3 * sunSize, 0, 0, 4 * sunSize);
      glow.addColorStop(0, 'rgba(255, 220, 100, 0.35)');
      glow.addColorStop(0.5, 'rgba(255, 180, 50, 0.12)');
      glow.addColorStop(1, 'rgba(255, 150, 30, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 4 * sunSize, 0, TAU);
      ctx.fill();
      const sunCore = ctx.createRadialGradient(0, 0, 0, 0, 0, sunSize);
      sunCore.addColorStop(0, 'rgba(255, 255, 230, 1)');
      sunCore.addColorStop(0.3, 'rgba(255, 230, 120, 0.95)');
      sunCore.addColorStop(0.7, 'rgba(255, 190, 60, 0.85)');
      sunCore.addColorStop(1, 'rgba(255, 160, 40, 0.6)');
      ctx.fillStyle = sunCore;
      ctx.beginPath();
      ctx.arc(0, 0, sunSize, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * TAU + 0.2 * t;
        const len = sunSize * (3 + 1.2 * Math.sin(1.5 * t + 0.8 * i));
        const alpha = 0.06 + 0.03 * Math.sin(2.5 * t + 0.6 * i);
        ctx.save();
        ctx.rotate(ang);
        const ray = ctx.createLinearGradient(1.2 * sunSize, 0, len, 0);
        ray.addColorStop(0, `rgba(255, 210, 80, ${alpha})`);
        ray.addColorStop(1, 'rgba(255, 180, 50, 0)');
        ctx.strokeStyle = ray;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(1.2 * sunSize, 0);
        ctx.lineTo(len, 0);
        ctx.stroke();
        ctx.restore();
      }
      planets.forEach((p) => {
        const orbit = p.orbitRadius * solarR;
        ctx.strokeStyle = `rgba(${p.color}, 0.08)`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([6, 10]);
        ctx.beginPath();
        ctx.arc(0, 0, orbit, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        const ang = p.angle + t * p.speed * 0.12;
        const px = Math.cos(ang) * orbit;
        const py = Math.sin(ang) * orbit;
        const pGlow = ctx.createRadialGradient(px, py, 0, px, py, 5 * p.size);
        pGlow.addColorStop(0, `rgba(${p.glowColor}, 0.3)`);
        pGlow.addColorStop(0.4, `rgba(${p.glowColor}, 0.1)`);
        pGlow.addColorStop(1, `rgba(${p.glowColor}, 0)`);
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(px, py, 5 * p.size, 0, TAU);
        ctx.fill();
        if (p.hasRing) {
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(1, 0.3);
          ctx.strokeStyle = `rgba(${p.color}, 0.35)`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 2.2 * p.size, 0, TAU);
          ctx.stroke();
          ctx.strokeStyle = `rgba(${p.color}, 0.2)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 3 * p.size, 0, TAU);
          ctx.stroke();
          ctx.strokeStyle = `rgba(${p.color}, 0.1)`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 3.6 * p.size, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
        const body = ctx.createRadialGradient(px - 0.3 * p.size, py - 0.3 * p.size, 0, px, py, p.size);
        body.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        body.addColorStop(0.3, `rgba(${p.color}, 0.9)`);
        body.addColorStop(1, `rgba(${p.color}, 0.6)`);
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, TAU);
        ctx.fill();
        if (p.hasMoon && p.moonDist && p.moonSize && p.moonSpeed && p.moonAngle !== undefined) {
          const ma = p.moonAngle + t * p.moonSpeed * 0.12;
          const mx = px + Math.cos(ma) * p.moonDist;
          const my = py + Math.sin(ma) * p.moonDist;
          ctx.fillStyle = 'rgba(200, 200, 210, 0.8)';
          ctx.beginPath();
          ctx.arc(mx, my, p.moonSize, 0, TAU);
          ctx.fill();
        }
      });
      ctx.restore();

      /* 近景亮星 */
      nearStars.forEach((s) => {
        const tw = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
        const px = s.x * w + 1.5 * dx;
        const py = s.y * h + 1.5 * dy;
        const d = Math.sqrt((px - sunX) ** 2 + (py - sunY) ** 2);
        const fall = Math.max(0.15, 1 - (d / dimR) ** 1.5);
        const alpha = s.brightness * tw * fall;
        if (alpha < 0.02) return;
        const g = ctx.createRadialGradient(px, py, 0, px, py, s.glowR);
        g.addColorStop(0, `rgba(${s.color}, ${0.4 * alpha})`);
        g.addColorStop(0.3, `rgba(${s.color}, ${0.15 * alpha})`);
        g.addColorStop(1, `rgba(${s.color}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, s.glowR, 0, TAU);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, TAU);
        ctx.fill();
        if (alpha > 0.7) {
          ctx.strokeStyle = `rgba(${s.color}, ${0.3 * alpha})`;
          ctx.lineWidth = 0.5;
          const cross = 0.8 * s.glowR;
          ctx.beginPath();
          ctx.moveTo(px - cross, py);
          ctx.lineTo(px + cross, py);
          ctx.moveTo(px, py - cross);
          ctx.lineTo(px, py + cross);
          ctx.stroke();
        }
      });

      /* 外星人变成的星星（点击触发，永久留在星空中） */
      starsRef.current.forEach((s) => {
        const tw = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.glowR);
        g.addColorStop(0, `rgba(${s.color}, ${0.4 * s.brightness * tw})`);
        g.addColorStop(0.3, `rgba(${s.color}, ${0.15 * s.brightness * tw})`);
        g.addColorStop(1, `rgba(${s.color}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.glowR, 0, TAU);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, ${s.brightness * tw})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fill();
      });

      /* 常驻外星人 */
      const alienX = 0.82 * w;
      const alienY = 0.18 * h + 8 * Math.sin(0.8 * t);
      const alienAlpha = 0.6 + 0.2 * Math.sin(1.2 * t);
      if (residentVisibleRef.current) {
        drawAlien(ctx, alienX, alienY, t, alienAlpha, residentVariantRef.current);
      }

      /* 点击生成的外星人（上限 50，散布整个空间；点击 UFO 时飞回常驻外星人处合体） */
      const now = performance.now();
      const aliens = aliensRef.current;
      for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        /* 闪一下变成星星 */
        if (a.becomingStar) {
          a.starFlash += 0.05;
          if (a.starFlash >= 1) {
            const roll = Math.random();
            let starColor;
            if (roll < 0.3) starColor = '88, 166, 255';
            else if (roll < 0.55) starColor = '136, 46, 224';
            else if (roll < 0.8) starColor = '35, 213, 171';
            else starColor = '255, 200, 100';
            starsRef.current.push({
              x: a.x,
              y: a.y,
              r: 1.5 + 1.5 * Math.random(),
              brightness: 0.7 + 0.3 * Math.random(),
              twinkleSpeed: 0.3 + 1.2 * Math.random(),
              twinkleOffset: Math.random() * TAU,
              glowR: 10 + 12 * Math.random(),
              color: starColor
            });
            aliens.splice(i, 1);
            continue;
          }
          const flashR = 20 + 90 * Math.sin(a.starFlash * Math.PI);
          const flashGrad = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, flashR);
          flashGrad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * (1 - 0.4 * a.starFlash)})`);
          flashGrad.addColorStop(0.4, `rgba(200, 220, 255, ${0.45 * (1 - a.starFlash)})`);
          flashGrad.addColorStop(1, 'rgba(200, 220, 255, 0)');
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(a.x, a.y, flashR, 0, TAU);
          ctx.fill();
          drawAlien(ctx, a.x, a.y, t, alienAlpha * (1 - a.starFlash) * a.scale, a.variantIndex, a.scale * (1 + 0.4 * a.starFlash), a.action, a.actionPhase);
          continue;
        }
        /* 被推一下：自旋着惯性滑行到别处（宇航员太空漂移） */
        if (a.pushed) {
          a.x += a.pushVX;
          a.y += a.pushVY;
          a.pushVX *= 0.992;
          a.pushVY *= 0.992;
          if (a.x < 20) {
            a.x = 20;
            a.pushVX = Math.abs(a.pushVX);
          } else if (a.x > w - 20) {
            a.x = w - 20;
            a.pushVX = -Math.abs(a.pushVX);
          }
          if (a.y < 20) {
            a.y = 20;
            a.pushVY = Math.abs(a.pushVY);
          } else if (a.y > h - 20) {
            a.y = h - 20;
            a.pushVY = -Math.abs(a.pushVY);
          }
          if (Math.hypot(a.pushVX, a.pushVY) < 0.4) {
            a.pushed = false;
            a.targetX = Math.random() * w * 0.94 + 0.03 * w;
            a.targetY = Math.random() * h * 0.9 + 0.05 * h;
          }
          drawAlien(ctx, a.x, a.y, t, alienAlpha * a.scale, a.variantIndex, a.scale, 'spin', a.actionPhase);
          continue;
        }
        if (a.merging) {
          a.mergeProgress = Math.min(1, a.mergeProgress + 0.02);
          a.scale = 1 - 0.8 * a.mergeProgress;
          a.x += 0.05 * (a.targetX - a.x);
          a.y += 0.05 * (a.targetY - a.y);
          if (a.mergeProgress >= 1) {
            aliens.splice(i, 1);
            continue;
          }
        } else {
          a.x += 0.01 * (a.targetX - a.x);
          a.y += 0.01 * (a.targetY - a.y);
          if (Math.abs(a.x - a.targetX) < 10 && Math.abs(a.y - a.targetY) < 10) {
            a.targetX = Math.random() * w * 0.94 + 0.03 * w;
            a.targetY = Math.random() * h * 0.9 + 0.05 * h;
          }
        }
        drawAlien(ctx, a.x, a.y, t, alienAlpha * a.scale, a.variantIndex, a.scale, a.action, a.actionPhase);
      }

      /* UFO 状态机 */
      const ufo = ufoRef.current;
      const homeX = 0.15 * w + 15 * Math.sin(0.6 * t);
      const homeY = 0.78 * h + 8 * Math.cos(0.5 * t);
      const ufoAlpha = 0.6 + 0.2 * Math.sin(1.5 * t);
      const targetX = 0.82 * w;
      const targetY = 0.18 * h;
      if (ufo.state === 'idle') {
        drawUfo(ctx, homeX, homeY, t, ufoAlpha, ufo.variantIndex);
      } else {
        const elapsed = (now - ufo.startTime) / 1000;
        if (ufo.state === 'flying_to_alien') {
          const p = Math.min(1, elapsed / 2);
          const ease = 1 - Math.pow(1 - p, 3);
          ufo.x = homeX + (targetX - homeX) * ease;
          ufo.y = homeY + (targetY - homeY) * ease;
          ufo.trail.push({ x: ufo.x, y: ufo.y, alpha: 1 });
          if (ufo.trail.length > 30) ufo.trail.shift();
          if (p >= 1) {
            ufo.state = 'picking_up';
            ufo.startTime = now;
            residentVisibleRef.current = false;
          }
        } else if (ufo.state === 'picking_up') {
          const p = Math.min(1, elapsed / 0.8);
          ufo.x = targetX + 3 * Math.sin(8 * t);
          ufo.y = targetY + 2 * Math.cos(6 * t);
          if (p >= 1) {
            ufo.state = 'flying_away';
            ufo.startTime = now;
            ufo.alienPickedUp = true;
          }
        } else if (ufo.state === 'flying_away') {
          const p = Math.min(1, elapsed / 1.5);
          const ease = p * p;
          ufo.x = targetX + (1.2 * w - targetX) * ease;
          ufo.y = targetY + (-0.3 * h - targetY) * ease;
          ufo.trail.push({ x: ufo.x, y: ufo.y, alpha: 1 });
          if (ufo.trail.length > 30) ufo.trail.shift();
          if (p >= 1) {
            ufo.state = 'returning';
            ufo.startTime = now;
            ufo.variantIndex = Math.floor(20 * Math.random());
            residentVariantRef.current = Math.floor(20 * Math.random());
          }
        } else if (ufo.state === 'returning') {
          if (elapsed < 3) {
            ufo.trail = [];
          } else {
            const p = Math.min(1, (elapsed - 3) / 2);
            const ease = 1 - Math.pow(1 - p, 3);
            const startX = -0.2 * w;
            const startY = 1.2 * h;
            ufo.x = startX + (targetX - startX) * ease;
            ufo.y = startY + (targetY - startY) * ease;
            ufo.trail.push({ x: ufo.x, y: ufo.y, alpha: 1 });
            if (ufo.trail.length > 30) ufo.trail.shift();
            if (p >= 1) {
              ufo.state = 'dropping_off';
              ufo.startTime = now;
              residentVisibleRef.current = true;
              ufo.alienPickedUp = false;
              setDialogue({ text: UFO_DROP_DIALOGUE, x: targetX, y: targetY - 60, visible: 1 });
              if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
              dialogueTimerRef.current = setTimeout(() => {
                setDialogue((d) => ({ ...d, visible: 0 }));
              }, 3000);
            }
          }
        } else if (ufo.state === 'dropping_off') {
          ufo.x = targetX + 2 * Math.sin(3 * t);
          ufo.y = targetY + 1.5 * Math.cos(2.5 * t);
          if (elapsed >= 1.5) {
            ufo.state = 'going_home';
            ufo.startTime = now;
            ufo.trail = [];
          }
        } else if (ufo.state === 'going_home') {
          const p = Math.min(1, elapsed / 2);
          const ease = 1 - Math.pow(1 - p, 3);
          ufo.x = targetX + (homeX - targetX) * ease;
          ufo.y = targetY + (homeY - targetY) * ease;
          ufo.trail.push({ x: ufo.x, y: ufo.y, alpha: 1 });
          if (ufo.trail.length > 30) ufo.trail.shift();
          if (p >= 1) {
            ufo.state = 'idle';
            ufo.trail = [];
          }
        }
        ufo.trail.forEach((p) => {
          p.alpha -= 0.03;
          if (p.alpha > 0) {
            const variant = UFO_VARIANTS[ufo.variantIndex % 20];
            ctx.fillStyle = `rgba(${variant.mainRgb}, ${0.3 * p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4 * p.alpha, 0, TAU);
            ctx.fill();
          }
        });
        ufo.trail = ufo.trail.filter((p) => p.alpha > 0);
        if (ufo.state !== 'returning' || elapsed >= 3) {
          drawUfo(ctx, ufo.x, ufo.y, t, ufoAlpha, ufo.variantIndex);
        }
      }

      /* 流星 */
      if (timestamp - lastMeteor > 800 + 1500 * Math.random()) {
        lastMeteor = timestamp;
        const mx = Math.random() * w;
        const my = Math.random() * h * 0.4;
        const isBig = Math.random() < 0.2;
        meteorsRef.current.push({
          x: mx,
          y: my,
          vx: (3 + 5 * Math.random()) * (isBig ? 1.5 : 1),
          vy: (2 + 4 * Math.random()) * (isBig ? 1.5 : 1),
          length: isBig ? 120 + 160 * Math.random() : 40 + 80 * Math.random(),
          life: 0,
          maxLife: isBig ? 50 + 30 * Math.random() : 25 + 20 * Math.random(),
          brightness: isBig ? 0.8 + 0.2 * Math.random() : 0.4 + 0.4 * Math.random(),
          isBig,
          color: isBig
            ? ['88, 166, 255', '136, 46, 224', '35, 213, 171'][Math.floor(3 * Math.random())]
            : '200, 220, 255'
        });
      }
      if (Math.random() < 3e-4) {
        const count = 3 + Math.floor(3 * Math.random());
        const sx = Math.random() * w * 0.6 + 0.1 * w;
        const sy = Math.random() * h * 0.2;
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            meteorsRef.current.push({
              x: sx + 100 * (Math.random() - 0.5),
              y: sy + 50 * (Math.random() - 0.5),
              vx: 5 + 5 * Math.random(),
              vy: 3 + 4 * Math.random(),
              length: 80 + 120 * Math.random(),
              life: 0,
              maxLife: 35 + 25 * Math.random(),
              brightness: 0.7 + 0.3 * Math.random(),
              isBig: true,
              color: ['88, 166, 255', '136, 46, 224', '35, 213, 171', '255, 200, 100'][Math.floor(4 * Math.random())]
            });
          }, 200 * i);
        }
      }
      meteorsRef.current = meteorsRef.current.filter((m) => {
        m.x += m.vx;
        m.y += m.vy;
        m.life++;
        if (m.life > m.maxLife) return false;
        const lifeRatio = m.life / m.maxLife;
        const alpha = m.brightness * (1 - lifeRatio * lifeRatio);
        const tailUnits = m.length / (m.isBig ? 4 : 5);
        const tailX = m.x - m.vx * tailUnits;
        const tailY = m.y - m.vy * tailUnits;
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, `rgba(${m.color || '200, 220, 255'}, 0)`);
        grad.addColorStop(0.5, `rgba(${m.color || '200, 220, 255'}, ${0.2 * alpha})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.isBig ? 2.5 : 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        if (m.isBig && alpha > 0.3) {
          const head = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 8);
          head.addColorStop(0, `rgba(${m.color || '200, 220, 255'}, ${0.5 * alpha})`);
          head.addColorStop(1, `rgba(${m.color || '200, 220, 255'}, 0)`);
          ctx.fillStyle = head;
          ctx.beginPath();
          ctx.arc(m.x, m.y, 8, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.isBig ? 2 : 1.2, 0, TAU);
        ctx.fill();
        return true;
      });

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(rafRef.current);
      if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
    };
  }, [nebulae, spiralParticles, farStars, midStars, nearStars, planets, handleMouseMove, handleClick]);

  return (
    <div className="background-animation">
      <canvas ref={canvasRef} className="star-canvas" />
      <div className="deep-space-gradient" />
      <div className="milky-way" />
      {tooltip.visible && (
        <div className="planet-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="planet-tooltip-name">{tooltip.name}</div>
          <div className="planet-tooltip-text">{tooltip.text}</div>
        </div>
      )}
      {dialogue.visible > 0 && (
        <div className="ufo-dialogue" style={{ left: dialogue.x, top: dialogue.y, opacity: dialogue.visible }}>
          {dialogue.text}
        </div>
      )}
    </div>
  );
};

export default BackgroundAnimation;
