import { useEffect, useRef } from 'react';

/* 深空星空背景：闪烁星点 + 偶发流星（canvas 绘制） */
const StarField = () => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = Math.max(window.innerWidth || 800, 300);
    let H = Math.max(window.innerHeight || 600, 300);

    const random = (a, b) => Math.random() * (b - a) + a;

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
        const g = ctx.createLinearGradient(this.x, this.y, x2, y2);
        g.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    let meteors = [];

    const resize = () => {
      W = Math.max(window.innerWidth || 800, 300);
      H = Math.max(window.innerHeight || 600, 300);
      canvas.width = W;
      canvas.height = H;
      initStars();
    };

    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      for (const s of stars) {
        s.a += s.da;
        if (s.a > 0.9 || s.a < 0.1) s.da *= -1;
        ctx.globalAlpha = s.a;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (Math.random() < 0.008) meteors.push(new Meteor());
      meteors = meteors.filter((m) => {
        m.update();
        if (m.active) m.draw();
        return m.active;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    resize();
    loop();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-canvas" />;
};

export default StarField;
