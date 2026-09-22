/* 居中旋转光环 + 公转功能卡片（逐行移植自原始页面，无中间登录卡片） */
import { useEffect, useState, startTransition } from 'react';
import {
  LineChartIcon,
  ThunderboltIcon,
  SafetyIcon,
  RobotIcon,
  ApiIcon,
  DashboardIcon,
  FileTextIcon
} from './icons.jsx';

const FEATURE_CARDS = [
  { icon: <LineChartIcon />, label: '数据可视化', color: '#58a6ff' },
  { icon: <ThunderboltIcon />, label: '实时处理', color: '#f0883e' },
  { icon: <SafetyIcon />, label: '安全保障', color: '#23d5ab' },
  { icon: <RobotIcon />, label: '智能分析', color: '#a371f7' },
  { icon: <ApiIcon />, label: '开放接口', color: '#ff6b9d' },
  { icon: <DashboardIcon />, label: '数据看板', color: '#f0c040' },
  { icon: <FileTextIcon />, label: '报告导出', color: '#48d1cc' }
];

const RingVisual = () => {
  const [rotation, setRotation] = useState(0);
  const [ringSize, setRingSize] = useState(() =>
    0.85 * Math.min(window.innerWidth, window.innerHeight)
  );

  /* 旋转：6°/s */
  useEffect(() => {
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setRotation((r) => r + 6 * dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* 尺寸：85% min(w,h)，响应窗口变化 */
  useEffect(() => {
    const update = () =>
      startTransition(() =>
        setRingSize(0.85 * Math.min(window.innerWidth, window.innerHeight))
      );
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  const step = 360 / FEATURE_CARDS.length;

  return (
    <div className="ring-wrapper" style={{ '--ring-size': `${ringSize}px` }}>
      <div className="ring-visual">
        <svg className="ring-svg" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="ringBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#58a6ff" />
              <stop offset="30%" stopColor="#882ee0" />
              <stop offset="70%" stopColor="#23d5ab" />
              <stop offset="100%" stopColor="#58a6ff" />
            </linearGradient>
            <linearGradient id="ringRevGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#23d5ab" />
              <stop offset="50%" stopColor="#882ee0" />
              <stop offset="100%" stopColor="#58a6ff" />
            </linearGradient>
            <linearGradient id="innerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#58a6ff" />
              <stop offset="50%" stopColor="#882ee0" />
              <stop offset="100%" stopColor="#23d5ab" />
            </linearGradient>
            <filter id="ringGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="innerRingGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="ringBgGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(88,166,255,0.05)" />
              <stop offset="60%" stopColor="rgba(88,166,255,0.02)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="innerBgGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(88,166,255,0.08)" />
              <stop offset="70%" stopColor="rgba(136,46,224,0.04)" />
              <stop offset="100%" stopColor="rgba(35,213,171,0.02)" />
            </radialGradient>
          </defs>

          <circle cx="100" cy="100" r="95" fill="url(#ringBgGlow)" />
          <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
          <circle
            cx="100" cy="100" r="86" fill="none"
            stroke="url(#ringBaseGrad)" strokeWidth="2.8"
            strokeDasharray="4.5 4" strokeLinecap="round"
            filter="url(#ringGlow)" className="ring-track ring-outer"
            style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '100px 100px' }}
          />
          <circle
            cx="100" cy="100" r="76" fill="none"
            stroke="url(#ringRevGrad)" strokeWidth="1.4"
            strokeDasharray="2.2 4.2" strokeLinecap="round"
            opacity="0.7" className="ring-track ring-mid"
            style={{ transform: `rotate(${1.4 * -rotation}deg)`, transformOrigin: '100px 100px' }}
          />
          <circle
            cx="100" cy="100" r="66" fill="none"
            stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"
            strokeDasharray="1.5 5" strokeLinecap="round"
            className="ring-track ring-inner-line"
            style={{ transform: `rotate(${0.5 * rotation}deg)`, transformOrigin: '100px 100px' }}
          />
          <circle cx="100" cy="100" r="56" fill="url(#innerBgGlow)" opacity="0.6" />
          <circle
            cx="100" cy="100" r="54" fill="none"
            stroke="url(#innerRingGrad)" strokeWidth="1.8"
            strokeDasharray="6 3" strokeLinecap="round"
            filter="url(#innerRingGlow)" opacity="0.85"
            className="ring-track ring-inner-boundary"
            style={{ transform: `rotate(${0.8 * -rotation}deg)`, transformOrigin: '100px 100px' }}
          />
          {Array.from({ length: 16 }).map((_, i) => {
            const ang = ((22.5 * i + rotation) * Math.PI) / 180;
            return (
              <circle
                key={`blue-${i}`}
                cx={100 + 89 * Math.cos(ang)}
                cy={100 + 89 * Math.sin(ang)}
                r="1.4" fill="#58a6ff" opacity="0.75" filter="url(#ringGlow)"
              />
            );
          })}
          {Array.from({ length: 12 }).map((_, i) => {
            const ang = ((30 * i - 0.6 * rotation) * Math.PI) / 180;
            return (
              <circle
                key={`purple-${i}`}
                cx={100 + 57 * Math.cos(ang)}
                cy={100 + 57 * Math.sin(ang)}
                r="0.9" fill="#882ee0" opacity="0.55"
              />
            );
          })}
        </svg>
        <div className="feature-cards-layer">
          {FEATURE_CARDS.map((card, i) => {
            const ang = ((i * step + rotation) * Math.PI) / 180;
            const left = (100 + 81 * Math.cos(ang)) / 2;
            const top = (100 + 81 * Math.sin(ang)) / 2;
            return (
              <div
                key={card.label}
                className="feature-card-ring"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: 'translate(-50%, -50%)',
                  '--card-color': card.color
                }}
              >
                <span className="feature-card-icon">{card.icon}</span>
                <span className="feature-card-label">{card.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RingVisual;
