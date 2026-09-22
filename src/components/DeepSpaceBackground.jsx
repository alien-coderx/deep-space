import React, { useEffect, useRef } from 'react';

const DeepSpaceBackground = () => {
  const starCanvasRef = useRef(null);
  const alienCanvasRef = useRef(null);
  const rafStarsRef = useRef(null);
  const rafAlienRef = useRef(null);

  useEffect(() => {
    const starCanvas = starCanvasRef.current;
    const alienCanvas = alienCanvasRef.current;
    if (!starCanvas || !alienCanvas) return;

    const starCtx = starCanvas.getContext('2d');
    const alienCtx = alienCanvas.getContext('2d');

    let W = Math.max(window.innerWidth || 800, 300);
    let H = Math.max(window.innerHeight || 600, 300);

    const random = (a, b) => Math.random() * (b - a) + a;
    const randomInt = (a, b) => Math.floor(random(a, b + 1));

    /* ============ 星空 ============ */
    let stars = [];
    const initStars = () => {
      stars = [];
      const count = Math.floor((W * H) / 2000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: random(0, W),
          y: random(0, H),
          r: random(0.2, 1.5),
          a: random(0.15, 0.85),
          da: random(0.002, 0.008) * (Math.random() > 0.5 ? 1 : -1),
          color:
            Math.random() > 0.9
              ? '#a8c8ff'
              : Math.random() > 0.7
              ? '#ffd9a8'
              : '#ffffff'
        });
      }
    };

    const drawStars = () => {
      starCtx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.a += s.da;
        if (s.a > 0.9 || s.a < 0.1) s.da *= -1;
        starCtx.globalAlpha = s.a;
        starCtx.fillStyle = s.color;
        starCtx.beginPath();
        starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        starCtx.fill();
      }
      starCtx.globalAlpha = 1;
    };

    const loopStars = () => {
      drawStars();
      rafStarsRef.current = requestAnimationFrame(loopStars);
    };

    /* ============ 尺寸 ============ */
    const resize = () => {
      W = Math.max(window.innerWidth || 800, 300);
      H = Math.max(window.innerHeight || 600, 300);
      starCanvas.width = W;
      starCanvas.height = H;
      alienCanvas.width = W;
      alienCanvas.height = H;
      initStars();
      aliens.forEach((a) => {
        a.x = Math.min(a.x, W - a.radius);
        a.y = Math.min(a.y, H - a.radius);
      });
    };

    /* ============ 太阳系 ============ */
    const sunX = 130;
    const sunY = 130;
    const planets = [
      { r: 46, speed: 0.014, angle: random(0, Math.PI * 2), color: 'rgba(80,180,220,0.6)', size: 3.5 },
      { r: 72, speed: 0.009, angle: random(0, Math.PI * 2), color: 'rgba(160,100,230,0.6)', size: 5 },
      { r: 100, speed: 0.006, angle: random(0, Math.PI * 2), color: 'rgba(240,80,140,0.6)', size: 4 },
      { r: 132, speed: 0.0035, angle: random(0, Math.PI * 2), color: 'rgba(255,170,60,0.6)', size: 6.5, ring: true },
      { r: 162, speed: 0.002, angle: random(0, Math.PI * 2), color: 'rgba(230,230,240,0.5)', size: 3.5 }
    ];

    const drawSolarSystem = () => {
      alienCtx.strokeStyle = 'rgba(255,255,255,0.055)';
      alienCtx.lineWidth = 1;
      planets.forEach((p) => {
        alienCtx.beginPath();
        alienCtx.arc(sunX, sunY, p.r, 0, Math.PI * 2);
        alienCtx.stroke();
      });

      let g = alienCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 62);
      g.addColorStop(0, 'rgba(255,250,220,0.95)');
      g.addColorStop(0.18, 'rgba(255,225,130,0.7)');
      g.addColorStop(0.45, 'rgba(255,175,50,0.22)');
      g.addColorStop(1, 'transparent');
      alienCtx.fillStyle = g;
      alienCtx.beginPath();
      alienCtx.arc(sunX, sunY, 62, 0, Math.PI * 2);
      alienCtx.fill();

      for (let i = 0; i < 28; i++) {
        const a = random(0, Math.PI * 2);
        const d = random(28, 68);
        alienCtx.globalAlpha = random(0.15, 0.65);
        alienCtx.fillStyle = 'rgba(255,230,150,1)';
        alienCtx.beginPath();
        alienCtx.arc(sunX + Math.cos(a) * d, sunY + Math.sin(a) * d, random(0.4, 1.6), 0, Math.PI * 2);
        alienCtx.fill();
      }
      alienCtx.globalAlpha = 1;

      planets.forEach((p) => {
        p.angle += p.speed;
        const px = sunX + Math.cos(p.angle) * p.r;
        const py = sunY + Math.sin(p.angle) * p.r;
        alienCtx.shadowBlur = 14;
        alienCtx.shadowColor = p.color;
        alienCtx.fillStyle = p.color;
        alienCtx.beginPath();
        alienCtx.arc(px, py, p.size, 0, Math.PI * 2);
        alienCtx.fill();
        alienCtx.shadowBlur = 0;
        if (p.ring) {
          alienCtx.strokeStyle = 'rgba(255,255,255,0.4)';
          alienCtx.lineWidth = 1.2;
          alienCtx.beginPath();
          alienCtx.ellipse(px, py, p.size * 2.3, p.size * 0.7, 0, 0, Math.PI * 2);
          alienCtx.stroke();
        }
      });
    };

    /* ============ 流星 ============ */
    class Meteor {
      constructor() {
        this.x = random(W * 0.5, W + 100);
        this.y = random(-100, H * 0.4);
        this.len = random(90, 200);
        this.speed = random(10, 18);
        this.angle = Math.PI * 0.75 + random(-0.15, 0.15);
        this.alpha = 1;
        this.active = true;
      }
      update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y -= this.speed * Math.sin(this.angle);
        this.alpha -= 0.012;
        if (this.alpha <= 0 || this.x < 0 || this.y > H) this.active = false;
      }
      draw() {
        const x2 = this.x - this.len * Math.cos(this.angle);
        const y2 = this.y + this.len * Math.sin(this.angle);
        const g = alienCtx.createLinearGradient(this.x, this.y, x2, y2);
        g.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        alienCtx.strokeStyle = g;
        alienCtx.lineWidth = 1.5;
        alienCtx.beginPath();
        alienCtx.moveTo(this.x, this.y);
        alienCtx.lineTo(x2, y2);
        alienCtx.stroke();
      }
    }
    let meteors = [];

    /* ============ 外星人 ============ */
    class Alien {
      constructor(x, y) {
        this.x = typeof x === 'number' && !isNaN(x) ? x : random(80, Math.max(W - 80, 300));
        this.y = typeof y === 'number' && !isNaN(y) ? y : random(80, Math.max(H - 80, 300));
        this.z = random(0.5, 1.15);
        this.alpha = 0.3 + this.z * 0.22;
        this.baseAlpha = this.alpha;
        this.radius = random(11, 17) * this.z;
        this.type = randomInt(0, 2);

        const hues = [190, 210, 230, 260, 280, 300, 170, 150];
        this.hue = hues[randomInt(0, hues.length - 1)];
        this.lightness = random(78, 92);

        this.color = `hsla(${this.hue}, 75%, ${this.lightness}%, ${this.alpha})`;
        this.darkColor = `hsla(${this.hue}, 60%, ${this.lightness - 15}%, ${this.alpha * 0.55})`;
        this.glowColor = `hsla(${this.hue}, 100%, 88%, ${this.alpha * 0.9})`;

        this.wobble = random(0, Math.PI * 2);
        this.floatSpeed = random(0.018, 0.04);
        this.floatAmp = random(4, 8) * this.z;

        this.glowIntensity = random(0.4, 1.0);
        this.glowSpeed = random(0.008, 0.02);
        this.glowDir = 1;

        this.orbitCount = randomInt(3, 6);
        this.orbitRadius = this.radius + random(12, 20);
        this.orbitSpeed = random(0.008, 0.02);
        this.orbitAngle = random(0, Math.PI * 2);

        this.vx = random(-0.25, 0.25) * this.z;
        this.vy = random(-0.25, 0.25) * this.z;

        this.spawning = false;
        this.spawnVX = 0;
        this.spawnVY = 0;
        this.rotation = 0;
        this.rotationSpeed = 0;

        this.state = 'idle';
        this.targetShip = null;
      }

      update() {
        if (this.state === 'captured') return;
        this.glowIntensity += this.glowSpeed * this.glowDir;
        if (this.glowIntensity > 1.0 || this.glowIntensity < 0.25) this.glowDir *= -1;
        this.orbitAngle += this.orbitSpeed;

        if (this.spawning) {
          this.x += this.spawnVX;
          this.y += this.spawnVY;
          this.rotation += this.rotationSpeed;
          this.spawnVX *= 0.94;
          this.spawnVY *= 0.94;
          this.rotationSpeed *= 0.94;
          this.alpha += 0.03;
          if (this.alpha >= this.baseAlpha) this.alpha = this.baseAlpha;

          if (
            Math.abs(this.spawnVX) < 0.05 &&
            Math.abs(this.spawnVY) < 0.05 &&
            this.alpha >= this.baseAlpha - 0.01
          ) {
            this.spawning = false;
            this.spawnVX = 0;
            this.spawnVY = 0;
            this.rotationSpeed = 0;
            this.rotation = 0;
          }
          if (this.x < this.radius || this.x > W - this.radius) this.spawnVX *= -0.7;
          if (this.y < this.radius || this.y > H - this.radius) this.spawnVY *= -0.7;
          this.x = Math.max(this.radius, Math.min(W - this.radius, this.x));
          this.y = Math.max(this.radius, Math.min(H - this.radius, this.y));
          return;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.wobble += this.floatSpeed;

        if (this.x < this.radius || this.x > W - this.radius) this.vx *= -1;
        if (this.y < this.radius || this.y > H - this.radius) this.vy *= -1;
        this.x = Math.max(this.radius, Math.min(W - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(H - this.radius, this.y));

        if (this.state === 'being_captured' && this.targetShip) {
          this.x += (this.targetShip.x - this.x) * 0.05;
          this.y += (this.targetShip.y - this.y) * 0.05;
        }
      }

      draw() {
        if (this.state === 'captured' || this.alpha <= 0.01) return;

        const floatY = Math.sin(this.wobble) * this.floatAmp;
        const cg = this.glowIntensity;
        const r = this.radius;

        alienCtx.save();
        alienCtx.translate(this.x, this.y + floatY);
        alienCtx.rotate(this.rotation);
        alienCtx.globalAlpha = this.alpha;
        alienCtx.shadowBlur = 22 * cg * this.z;
        alienCtx.shadowColor = this.glowColor;

        // 环绕星点
        alienCtx.save();
        alienCtx.rotate(this.orbitAngle);
        alienCtx.strokeStyle = `hsla(${this.hue}, 100%, 92%, ${0.18 * cg})`;
        alienCtx.lineWidth = 0.8;
        alienCtx.setLineDash([2, 5]);
        alienCtx.beginPath();
        alienCtx.arc(0, 0, this.orbitRadius, 0, Math.PI * 2);
        alienCtx.stroke();
        alienCtx.setLineDash([]);
        for (let i = 0; i < this.orbitCount; i++) {
          const a = (Math.PI * 2 / this.orbitCount) * i;
          alienCtx.fillStyle = `hsla(${this.hue}, 100%, 92%, ${0.7 * cg})`;
          alienCtx.beginPath();
          alienCtx.arc(
            Math.cos(a) * this.orbitRadius,
            Math.sin(a) * this.orbitRadius,
            random(0.9, 1.7),
            0,
            Math.PI * 2
          );
          alienCtx.fill();
        }
        alienCtx.restore();

        if (this.type === 0) {
          // 小精灵
          const g = alienCtx.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r);
          g.addColorStop(0, `hsla(${this.hue}, 70%, 96%, ${this.alpha * 1.6})`);
          g.addColorStop(0.65, this.color);
          g.addColorStop(1, `hsla(${this.hue}, 55%, 65%, ${this.alpha * 0.9})`);
          alienCtx.fillStyle = g;
          alienCtx.beginPath();
          alienCtx.ellipse(0, 0, r, r * 0.9, 0, 0, Math.PI * 2);
          alienCtx.fill();

          alienCtx.strokeStyle = this.color;
          alienCtx.lineWidth = 1.5;
          [-1, 1].forEach((side, i) => {
            alienCtx.beginPath();
            alienCtx.moveTo(side * r * 0.4, -r * 0.8);
            alienCtx.quadraticCurveTo(
              side * r * 0.85,
              -r * 1.4,
              side * r * 0.35,
              -r * 1.55 + Math.sin(this.wobble * 2 + i) * 2
            );
            alienCtx.stroke();
            alienCtx.fillStyle = this.glowColor;
            alienCtx.beginPath();
            alienCtx.arc(
              side * r * 0.35,
              -r * 1.55 + Math.sin(this.wobble * 2 + i) * 2,
              1.8,
              0,
              Math.PI * 2
            );
            alienCtx.fill();
          });

          alienCtx.strokeStyle = this.color;
          alienCtx.lineWidth = 1.5;
          [-1, 1].forEach((side, i) => {
            alienCtx.beginPath();
            alienCtx.moveTo(side * r * 0.85, r * 0.05);
            alienCtx.quadraticCurveTo(
              side * r * 1.5,
              r * 0.15 + Math.sin(this.wobble * 2 + i) * 2,
              side * r * 1.2,
              r * 0.7 + Math.sin(this.wobble * 2 + i) * 3
            );
            alienCtx.stroke();
            alienCtx.fillStyle = this.glowColor;
            alienCtx.beginPath();
            alienCtx.arc(
              side * r * 1.2,
              r * 0.7 + Math.sin(this.wobble * 2 + i) * 3,
              1.5,
              0,
              Math.PI * 2
            );
            alienCtx.fill();
          });

          alienCtx.strokeStyle = this.color;
          alienCtx.lineWidth = 1.5;
          [-1, 1].forEach((side, i) => {
            alienCtx.beginPath();
            alienCtx.moveTo(side * r * 0.4, r * 0.8);
            alienCtx.quadraticCurveTo(
              side * r * 0.55,
              r * 1.3 + Math.sin(this.wobble * 2 + i) * 2,
              side * r * 0.35,
              r * 1.5 + Math.sin(this.wobble * 2 + i) * 3
            );
            alienCtx.stroke();
            alienCtx.fillStyle = this.glowColor;
            alienCtx.beginPath();
            alienCtx.arc(
              side * r * 0.35,
              r * 1.5 + Math.sin(this.wobble * 2 + i) * 3,
              1.8,
              0,
              Math.PI * 2
            );
            alienCtx.fill();
          });
        } else if (this.type === 1) {
          // 小龙虾
          for (let i = 0; i < 3; i++) {
            const y = i * r * 0.42 - r * 0.3;
            const rx = r * (0.85 - i * 0.12);
            const ry = r * 0.35;
            const g = alienCtx.createLinearGradient(0, y - ry, 0, y + ry);
            g.addColorStop(0, `hsla(${this.hue}, 65%, 95%, ${this.alpha * 1.4})`);
            g.addColorStop(1, `hsla(${this.hue}, 55%, 68%, ${this.alpha * 0.9})`);
            alienCtx.fillStyle = g;
            alienCtx.beginPath();
            alienCtx.ellipse(0, y, rx, ry, 0, 0, Math.PI * 2);
            alienCtx.fill();
          }

          alienCtx.strokeStyle = this.color;
          alienCtx.lineWidth = 2;
          [-1, 1].forEach((side, i) => {
            alienCtx.beginPath();
            alienCtx.moveTo(side * r * 0.55, -r * 0.55);
            alienCtx.quadraticCurveTo(
              side * r * 1.7,
              -r * 1.2 + Math.sin(this.wobble * 2 + i) * 2,
              side * r * 1.45,
              -r * 0.25 + Math.sin(this.wobble * 2 + i) * 3
            );
            alienCtx.stroke();
            alienCtx.fillStyle = this.glowColor;
            alienCtx.beginPath();
            alienCtx.ellipse(
              side * r * 1.45,
              -r * 0.25 + Math.sin(this.wobble * 2 + i) * 3,
              r * 0.38,
              r * 0.18,
              side * 0.5,
              0,
              Math.PI * 2
            );
            alienCtx.fill();
          });

          alienCtx.strokeStyle = this.color;
          alienCtx.lineWidth = 1;
          [-1, 1].forEach((side, i) => {
            alienCtx.beginPath();
            alienCtx.moveTo(side * r * 0.2, -r * 0.85);
            alienCtx.quadraticCurveTo(
              side * r * 0.55,
              -r * 1.9,
              side * r * 0.85,
              -r * 2.1 + Math.sin(this.wobble * 3 + i) * 3
            );
            alienCtx.stroke();
          });

          alienCtx.strokeStyle = this.color;
          alienCtx.lineWidth = 1.3;
          for (let i = 0; i < 3; i++) {
            const legY = i * r * 0.28;
            [-1, 1].forEach((side, j) => {
              alienCtx.beginPath();
              alienCtx.moveTo(side * r * 0.65, legY);
              alienCtx.quadraticCurveTo(
                side * r * 1.4,
                legY + r * 0.5,
                side * r * 1.1,
                legY + r * 0.75 + Math.sin(this.wobble * 2 + i + j) * 2
              );
              alienCtx.stroke();
              alienCtx.fillStyle = this.glowColor;
              alienCtx.beginPath();
              alienCtx.arc(
                side * r * 1.1,
                legY + r * 0.75 + Math.sin(this.wobble * 2 + i + j) * 2,
                1.2,
                0,
                Math.PI * 2
              );
              alienCtx.fill();
            });
          }
        } else {
          // 八爪鱼
          const g = alienCtx.createRadialGradient(-r * 0.2, -r * 0.3, 1, 0, 0, r * 1.15);
          g.addColorStop(0, `hsla(${this.hue}, 70%, 96%, ${this.alpha * 1.6})`);
          g.addColorStop(0.65, this.color);
          g.addColorStop(1, `hsla(${this.hue}, 55%, 65%, ${this.alpha * 0.9})`);
          alienCtx.fillStyle = g;
          alienCtx.beginPath();
          alienCtx.ellipse(0, -r * 0.25, r * 1.05, r * 0.95, 0, 0, Math.PI * 2);
          alienCtx.fill();

          alienCtx.strokeStyle = this.color;
          alienCtx.lineWidth = 1.8;
          for (let i = 0; i < 8; i++) {
            const a = (Math.PI * 2 / 8) * i + Math.PI * 0.5;
            const bx = Math.cos(a) * r * 0.75;
            const by = Math.sin(a) * r * 0.75 + r * 0.5;
            const wave = Math.sin(this.wobble * 2 + i) * 4;
            const cx = Math.cos(a) * r * 1.4 + wave;
            const cy = Math.sin(a) * r * 1.4 + r * 0.7 + wave;
            const ex = Math.cos(a) * r * 1.7 + wave * 1.5;
            const ey = Math.sin(a) * r * 1.7 + r * 0.9 + wave * 1.5;
            alienCtx.beginPath();
            alienCtx.moveTo(bx, by);
            alienCtx.quadraticCurveTo(cx, cy, ex, ey);
            alienCtx.stroke();
            alienCtx.fillStyle = this.glowColor;
            alienCtx.beginPath();
            alienCtx.arc(ex, ey, 1.8, 0, Math.PI * 2);
            alienCtx.fill();
          }
        }

        // 眼睛
        const eyeGap = r * (this.type === 2 ? 0.42 : 0.35);
        const eyeY = this.type === 2 ? -r * 0.25 : -r * 0.1;
        const eyeR = r * (this.type === 2 ? 0.32 : 0.24);
        const pupilR = r * (this.type === 2 ? 0.16 : 0.13);

        [-1, 1].forEach((side) => {
          const eyeX = side * eyeGap;
          alienCtx.fillStyle = 'rgba(255,255,255,0.95)';
          alienCtx.beginPath();
          alienCtx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
          alienCtx.fill();
          alienCtx.fillStyle = 'rgba(20,20,30,0.9)';
          alienCtx.beginPath();
          alienCtx.arc(eyeX, eyeY, pupilR, 0, Math.PI * 2);
          alienCtx.fill();
          alienCtx.fillStyle = 'rgba(255,255,255,0.95)';
          alienCtx.beginPath();
          alienCtx.arc(eyeX + r * 0.06, eyeY - r * 0.06, r * 0.05, 0, Math.PI * 2);
          alienCtx.fill();
        });

        alienCtx.restore();
      }
    }

    /* ============ 飞船 ============ */
    class Ship {
      constructor() {
        const edge = randomInt(0, 3);
        if (edge === 0) { this.x = -50; this.y = random(0, H); }
        else if (edge === 1) { this.x = W + 50; this.y = random(0, H); }
        else if (edge === 2) { this.x = random(0, W); this.y = -50; }
        else { this.x = random(0, W); this.y = H + 50; }

        this.z = random(0.6, 1.15);
        this.alpha = 0.3 + this.z * 0.22;
        this.glowColor = `hsla(120, 100%, 60%, ${this.alpha * 0.9})`;
        this.size = random(18, 26) * this.z;
        this.speedX = random(-1.5, 1.5);
        this.speedY = random(-1.5, 1.5);
        this.glowIntensity = random(0.4, 1.0);
        this.glowSpeed = random(0.008, 0.02);
        this.glowDir = 1;
        this.orbitAngle = random(0, Math.PI * 2);
        this.orbitRadius = this.size + random(10, 15);
        this.orbitCount = randomInt(3, 6);
        this.state = 'cruising';
        this.targetAlien = null;
        this.angle = 0;
      }

      update() {
        this.glowIntensity += this.glowSpeed * this.glowDir;
        if (this.glowIntensity > 1.0 || this.glowIntensity < 0.25) this.glowDir *= -1;
        this.orbitAngle += 0.01;

        if (this.state === 'returning') {
          this.x += this.speedX;
          this.y += this.speedY;
          if (this.x < -100 || this.x > W + 100 || this.y < -100 || this.y > H + 100)
            this.active = false;
          return;
        }

        if (this.state === 'cruising' && !this.targetAlien) {
          const idle = aliens.filter((a) => a.state === 'idle' && !a.spawning);
          if (idle.length > 0 && Math.random() < 0.008) {
            this.targetAlien = idle[randomInt(0, idle.length - 1)];
            this.targetAlien.state = 'being_captured';
            this.targetAlien.targetShip = this;
            this.state = 'approaching';
          }
        }

        if (this.state === 'approaching' && this.targetAlien) {
          const dx = this.targetAlien.x - this.x;
          const dy = this.targetAlien.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 12) {
            this.targetAlien.state = 'captured';
            const idx = aliens.indexOf(this.targetAlien);
            if (idx > -1) aliens.splice(idx, 1);
            this.targetAlien = null;
            this.state = 'returning';
            const a = Math.atan2(this.y - H / 2, this.x - W / 2);
            this.speedX = Math.cos(a) * 2.8;
            this.speedY = Math.sin(a) * 2.8;
          } else {
            this.x += (dx / dist) * 1.9;
            this.y += (dy / dist) * 1.9;
            this.angle = Math.atan2(dy, dx);
          }
        }

        if (this.state === 'cruising') {
          this.x += this.speedX;
          this.y += this.speedY;
          this.angle = Math.atan2(this.speedY, this.speedX);
          if (this.x < 50 || this.x > W - 50) this.speedX *= -1;
          if (this.y < 50 || this.y > H - 50) this.speedY *= -1;
          if (Math.random() < 0.01) {
            this.speedX = random(-1.5, 1.5);
            this.speedY = random(-1.5, 1.5);
          }
        }
      }

      draw() {
        if (this.alpha <= 0) return;
        const cg = this.glowIntensity;

        alienCtx.save();
        alienCtx.translate(this.x, this.y);
        alienCtx.rotate(this.angle);
        alienCtx.globalAlpha = this.alpha;
        alienCtx.shadowBlur = 22 * cg * this.z;
        alienCtx.shadowColor = this.glowColor;

        alienCtx.save();
        alienCtx.rotate(this.orbitAngle);
        alienCtx.strokeStyle = `hsla(120, 100%, 60%, ${0.18 * cg})`;
        alienCtx.lineWidth = 0.8;
        alienCtx.setLineDash([2, 5]);
        alienCtx.beginPath();
        alienCtx.arc(0, 0, this.orbitRadius, 0, Math.PI * 2);
        alienCtx.stroke();
        alienCtx.setLineDash([]);
        for (let i = 0; i < this.orbitCount; i++) {
          const a = (Math.PI * 2 / this.orbitCount) * i;
          alienCtx.fillStyle = `hsla(120, 100%, 70%, ${0.75 * cg})`;
          alienCtx.beginPath();
          alienCtx.arc(
            Math.cos(a) * this.orbitRadius,
            Math.sin(a) * this.orbitRadius,
            random(0.9, 1.7),
            0,
            Math.PI * 2
          );
          alienCtx.fill();
        }
        alienCtx.restore();

        alienCtx.fillStyle = `hsla(0,0%,30%,${this.alpha})`;
        alienCtx.beginPath();
        alienCtx.ellipse(0, this.size * 0.1, this.size, this.size * 0.25, 0, 0, Math.PI * 2);
        alienCtx.fill();
        alienCtx.fillStyle = `hsla(0,0%,45%,${this.alpha})`;
        alienCtx.beginPath();
        alienCtx.ellipse(0, 0, this.size, this.size * 0.3, 0, 0, Math.PI * 2);
        alienCtx.fill();

        const dg = alienCtx.createLinearGradient(0, -this.size * 0.6, 0, 0);
        dg.addColorStop(0, `hsla(0,0%,90%,${this.alpha})`);
        dg.addColorStop(1, `hsla(0,0%,60%,${this.alpha})`);
        alienCtx.fillStyle = dg;
        alienCtx.beginPath();
        alienCtx.ellipse(0, -this.size * 0.1, this.size * 0.5, this.size * 0.45, 0, 0, Math.PI * 2);
        alienCtx.fill();

        for (let i = 0; i < 6; i++) {
          const a = (Math.PI * 2 / 6) * i + this.orbitAngle * 0.5;
          const lx = Math.cos(a) * this.size * 0.8;
          const ly = Math.sin(a) * this.size * 0.15 + this.size * 0.1;
          alienCtx.shadowBlur = 15 * cg;
          alienCtx.fillStyle = `hsla(120,100%,70%,${0.85 * cg})`;
          alienCtx.beginPath();
          alienCtx.arc(lx, ly, this.size * 0.12, 0, Math.PI * 2);
          alienCtx.fill();
          alienCtx.fillStyle = `hsla(120,100%,95%,${cg})`;
          alienCtx.beginPath();
          alienCtx.arc(lx, ly, this.size * 0.06, 0, Math.PI * 2);
          alienCtx.fill();
        }
        alienCtx.restore();
      }
    }

    /* ============ 主循环 ============ */
    let aliens = [];
    let ships = [];
    const MAX_ALIENS = 30;

    const spawnAlien = (x, y) => {
      if (aliens.length >= MAX_ALIENS) return;
      const a = new Alien(x, y);
      const angle = random(0, Math.PI * 2);
      const force = (25 / a.radius) * random(0.6, 1.4);
      a.spawnVX = Math.cos(angle) * force;
      a.spawnVY = Math.sin(angle) * force;
      a.rotationSpeed = (18 / a.radius) * random(-0.08, 0.08);
      a.alpha = 0;
      a.spawning = true;
      aliens.push(a);
    };

    const onClick = (e) => spawnAlien(e.clientX, e.clientY);
    const onTouch = (e) => {
      const t = e.touches[0];
      if (t) spawnAlien(t.clientX, t.clientY);
    };

    const initAliens = () => {
      aliens = [];
      ships = [];
      for (let i = 0; i < 12; i++) {
        aliens.push(
          new Alien(
            random(100, Math.max(W - 100, 300)),
            random(100, Math.max(H - 100, 300))
          )
        );
      }
      for (let i = 0; i < 3; i++) ships.push(new Ship());
    };

    const animate = () => {
      try {
        alienCtx.clearRect(0, 0, W, H);
        drawSolarSystem();

        if (Math.random() < 0.012) meteors.push(new Meteor());
        meteors = meteors.filter((m) => {
          m.update();
          if (m.active) m.draw();
          return m.active;
        });

        ships = ships.filter((s) => s.active !== false);
        ships.forEach((s) => {
          s.update();
          s.draw();
        });

        aliens.forEach((a) => {
          a.update();
          a.draw();
        });

        if (aliens.length < 6) {
          aliens.push(
            new Alien(
              random(100, Math.max(W - 100, 300)),
              random(100, Math.max(H - 100, 300))
            )
          );
        }
      } catch (err) {
        console.error('[DeepSpace]', err);
      }
      rafAlienRef.current = requestAnimationFrame(animate);
    };

    /* ============ 启动 ============ */
    resize();
    initAliens();
    loopStars();
    animate();

    window.addEventListener('resize', resize);
    window.addEventListener('click', onClick);
    window.addEventListener('touchstart', onTouch, { passive: true });

    /* ============ 清理 ============ */
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', onClick);
      window.removeEventListener('touchstart', onTouch);
      if (rafStarsRef.current) cancelAnimationFrame(rafStarsRef.current);
      if (rafAlienRef.current) cancelAnimationFrame(rafAlienRef.current);
    };
  }, []);

  return (
    <>
      <canvas
        ref={starCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          display: 'block'
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(70, 100, 180, 0.14) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 80% 75%, rgba(120, 60, 180, 0.12) 0%, transparent 55%),
            radial-gradient(ellipse 100% 60% at 50% 100%, rgba(20, 40, 80, 0.18) 0%, transparent 60%),
            linear-gradient(180deg, #050510 0%, #08081a 50%, #050510 100%)
          `
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 60% 25% at 50% 50%, rgba(150, 180, 255, 0.05) 0%, transparent 70%)',
          animation: 'milkyDrift 60s ease-in-out infinite alternate'
        }}
      />
      <canvas
        ref={alienCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          display: 'block',
          pointerEvents: 'none'
        }}
      />
      <style>{`
        @keyframes milkyDrift {
          from { transform: translateX(-2%) rotate(-2deg); opacity: 0.7; }
          to   { transform: translateX(2%)  rotate(2deg);  opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default DeepSpaceBackground;