/* 居中大型旋转光环（还原参考页 ring-visual）：
   多层同心虚线圆环，蓝/紫/青渐变 + 发光滤镜，各环不同方向、不同速度旋转 */
const TAU = Math.PI * 2;

/* 外环上的 16 颗蓝色星点（跟随外环旋转） */
const blueDots = Array.from({ length: 16 }, (_, k) => {
  const a = ((118.6 + k * 22.5) * Math.PI) / 180;
  return {
    cx: +(100 + Math.cos(a) * 89).toFixed(2),
    cy: +(100 + Math.sin(a) * 89).toFixed(2)
  };
});

/* 内环上的 12 颗紫色星点（跟随内环旋转） */
const purpleDots = Array.from({ length: 12 }, (_, k) => {
  const a = ((-71.2 + k * 30) * Math.PI) / 180;
  return {
    cx: +(100 + Math.cos(a) * 57).toFixed(2),
    cy: +(100 + Math.sin(a) * 57).toFixed(2)
  };
});

const RingVisual = () => (
  <svg className="ring-svg" viewBox="0 0 200 200" role="presentation">
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

    {/* 背景微光 */}
    <circle cx="100" cy="100" r="95" fill="url(#ringBgGlow)" />
    <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />

    {/* 外环（顺时针慢转）+ 蓝色星点 */}
    <g className="ring-outer">
      <circle
        cx="100" cy="100" r="86" fill="none"
        stroke="url(#ringBaseGrad)" strokeWidth="2.8"
        strokeDasharray="4.5 4" strokeLinecap="round"
        filter="url(#ringGlow)"
      />
      {blueDots.map((d, i) => (
        <circle key={`b${i}`} cx={d.cx} cy={d.cy} r="1.4" fill="#58a6ff" opacity="0.75" filter="url(#ringGlow)" />
      ))}
    </g>

    {/* 中环（逆时针） */}
    <g className="ring-mid">
      <circle
        cx="100" cy="100" r="76" fill="none"
        stroke="url(#ringRevGrad)" strokeWidth="1.4"
        strokeDasharray="2.2 4.2" strokeLinecap="round"
        opacity="0.7"
      />
    </g>

    {/* 白色细虚线环（极慢顺时针） */}
    <g className="ring-inner-line">
      <circle
        cx="100" cy="100" r="66" fill="none"
        stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"
        strokeDasharray="1.5 5" strokeLinecap="round"
      />
    </g>

    {/* 内部辉光 */}
    <circle cx="100" cy="100" r="56" fill="url(#innerBgGlow)" opacity="0.6" />

    {/* 内边界环（逆时针）+ 紫色星点 */}
    <g className="ring-inner-boundary">
      <circle
        cx="100" cy="100" r="54" fill="none"
        stroke="url(#innerRingGrad)" strokeWidth="1.8"
        strokeDasharray="6 3" strokeLinecap="round"
        filter="url(#innerRingGlow)" opacity="0.85"
      />
      {purpleDots.map((d, i) => (
        <circle key={`p${i}`} cx={d.cx} cy={d.cy} r="0.9" fill="#882ee0" opacity="0.55" />
      ))}
    </g>
  </svg>
);

export default RingVisual;
