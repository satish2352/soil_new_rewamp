/**
 * Illustrated hero banners, drawn in SVG from the site palette.
 *
 * They replace the CMS cover posters in the hero slider. Those were packshots
 * carrying their own Devanagari headlines, so they fought the hero headline
 * and had to be blurred into texture. These are made for the slot.
 *
 * Every scene keeps its focal point in the right half. The left half sits
 * under the headline and its legibility wash, and `xMaxYMid slice` keeps the
 * right edge in frame on narrow screens, where the sides get cropped.
 *
 * Randomness (soil particles, root branching) comes from a seeded generator,
 * so the drawing is identical on every render and between server and client.
 */

const W = 1600;
const H = 900;

function rng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Frame({ children }) {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMaxYMid slice"
    >
      {children}
    </svg>
  );
}

function Birds({ x, y, scale = 1, color = '#0c2416' }) {
  const flock = [
    [0, 0],
    [46, -18],
    [88, 6],
    [30, 30],
  ];
  return (
    <g fill="none" stroke={color} strokeWidth={2.4 / scale} strokeLinecap="round" transform={`translate(${x} ${y}) scale(${scale})`}>
      {flock.map(([dx, dy]) => (
        <path key={`${dx}-${dy}`} d={`M${dx} ${dy} q9 -9 18 0 q9 -9 18 0`} />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------ 1. dawn field */

function DawnField() {
  const vx = 1220;
  const vy = 690;
  const rows = [];
  for (let x = -1400; x <= 3800; x += 150) rows.push(x);
  const nearField = `M0 720 C 400 690, 900 700, ${W} 688 L${W} ${H} L0 ${H} Z`;

  return (
    <Frame>
      <defs>
        <linearGradient id="dawn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b2016" />
          <stop offset="0.45" stopColor="#1f4a2e" />
          <stop offset="0.66" stopColor="#8a7a34" />
          <stop offset="0.74" stopColor="#e0b457" />
        </linearGradient>
        <radialGradient id="dawn-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f6d57a" stopOpacity="0.75" />
          <stop offset="0.4" stopColor="#d6a83a" stopOpacity="0.28" />
          <stop offset="1" stopColor="#d6a83a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="dawn-near">
          <path d={nearField} />
        </clipPath>
      </defs>

      <rect width={W} height={H} fill="url(#dawn-sky)" />
      <circle cx={vx} cy="600" r="470" fill="url(#dawn-glow)" />
      <circle cx={vx} cy="600" r="105" fill="#f6d57a" />

      <path d="M0 600 C 250 540, 450 585, 700 560 S 1150 530, 1350 548 S 1550 566, 1600 556 L1600 900 L0 900 Z" fill="#2f5e38" />
      <path d="M0 655 C 300 610, 520 650, 820 622 S 1300 606, 1600 640 L1600 900 L0 900 Z" fill="#1c4a2e" />
      <path d={nearField} fill="#11301f" />

      <g clipPath="url(#dawn-near)" stroke="#6e9f45" strokeOpacity="0.4" strokeWidth="3">
        {rows.map((x) => (
          <line key={x} x1={vx} y1={vy} x2={x} y2={H} />
        ))}
      </g>

      <Birds x={1330} y={430} scale={0.9} color="#3a2a14" />
    </Frame>
  );
}

/* ------------------------------------------------------------ 2. living soil */

function roots(seed, x0, y0) {
  const rand = rng(seed);
  const paths = [];
  const grow = (x, y, angle, len, width, depth) => {
    const x2 = x + Math.cos(angle) * len;
    const y2 = y + Math.sin(angle) * len;
    const bend = (rand() - 0.5) * len * 0.6;
    const cx = (x + x2) / 2 + Math.cos(angle + Math.PI / 2) * bend;
    const cy = (y + y2) / 2 + Math.sin(angle + Math.PI / 2) * bend;
    paths.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, width });
    if (depth === 0) return;
    const forks = depth > 2 ? 2 : 1 + Math.round(rand());
    for (let i = 0; i < forks; i += 1) {
      const turn = (rand() - 0.5) * 1.3;
      grow(x2, y2, angle + turn, len * (0.62 + rand() * 0.2), width * 0.65, depth - 1);
    }
  };
  grow(x0, y0, Math.PI / 2, 120, 7, 4);
  return paths;
}

function Sprout({ x, y, h, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0 0 C 4 ${-h * 0.4}, -4 ${-h * 0.7}, 0 ${-h}`} stroke="#6e9f45" strokeWidth={5 * s} fill="none" strokeLinecap="round" />
      <path d={`M0 ${-h * 0.55} c ${-30 * s} ${-6 * s}, ${-62 * s} ${-34 * s}, ${-70 * s} ${-62 * s} c ${34 * s} ${2 * s}, ${60 * s} ${26 * s}, ${70 * s} ${62 * s} z`} fill="#6e9f45" />
      <path d={`M0 ${-h * 0.8} c ${30 * s} ${-4 * s}, ${60 * s} ${-30 * s}, ${66 * s} ${-60 * s} c ${-34 * s} ${4 * s}, ${-58 * s} ${28 * s}, ${-66 * s} ${60 * s} z`} fill="#8fbf5a" />
      <path d={`M0 ${-h} c ${-14 * s} ${-18 * s}, ${-10 * s} ${-44 * s}, 0 ${-56 * s} c ${10 * s} ${12 * s}, ${14 * s} ${38 * s}, 0 ${56 * s} z`} fill="#a9cf6e" />
    </g>
  );
}

function LivingSoil() {
  const ground = 430;
  const plants = [
    { x: 1010, h: 150, s: 0.85, seed: 7 },
    { x: 1220, h: 210, s: 1.1, seed: 19 },
    { x: 1430, h: 170, s: 0.95, seed: 31 },
  ];
  const rand = rng(99);
  const particles = Array.from({ length: 140 }, () => ({
    x: 560 + rand() * 1040,
    y: ground + 30 + rand() * (H - ground - 30),
    r: 1.5 + rand() * 3.5,
    gold: rand() > 0.82,
    o: 0.15 + rand() * 0.3,
  }));

  return (
    <Frame>
      <defs>
        <linearGradient id="soil-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b2016" />
          <stop offset="1" stopColor="#2a5a36" />
        </linearGradient>
        <radialGradient id="soil-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f6d57a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#d6a83a" stopOpacity="0" />
        </radialGradient>
        <filter id="soil-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={W} height={ground + 20} fill="url(#soil-sky)" />
      <circle cx="1300" cy="120" r="330" fill="url(#soil-sun)" />

      {/* Soil horizons: humus, topsoil, subsoil. */}
      <path d={`M0 ${ground} C 400 ${ground - 14}, 900 ${ground + 12}, ${W} ${ground - 6} L${W} ${H} L0 ${H} Z`} fill="#2e2117" />
      <path d={`M0 575 C 450 560, 1000 592, ${W} 570 L${W} ${H} L0 ${H} Z`} fill="#4a3324" />
      <path d={`M0 740 C 500 726, 1050 756, ${W} 732 L${W} ${H} L0 ${H} Z`} fill="#5a3e2b" />
      <path d={`M0 ${ground} C 400 ${ground - 14}, 900 ${ground + 12}, ${W} ${ground - 6}`} stroke="#6e9f45" strokeWidth="6" fill="none" />

      {particles.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.gold ? '#d6a83a' : '#c5dcbe'} opacity={p.o} />
      ))}

      <g stroke="#d6a83a" strokeLinecap="round" fill="none" filter="url(#soil-glow)" opacity="0.85">
        {plants.flatMap((p) =>
          roots(p.seed, p.x, ground + 4).map((r, i) => (
            <path key={`${p.seed}-${i}`} d={r.d} strokeWidth={r.width * p.s} />
          )),
        )}
      </g>

      {plants.map((p) => (
        <Sprout key={p.seed} x={p.x} y={ground + 2} h={p.h} s={p.s} />
      ))}
    </Frame>
  );
}

/* ------------------------------------------------------------ 3. crop hills */

function hill(y, amp, phase) {
  return `M0 ${y} C 300 ${y - amp}, 600 ${y + amp * phase}, 900 ${y - amp * 0.4} S 1400 ${y - amp * 1.2}, ${W} ${y - amp * 0.2}`;
}

function CropHills() {
  const hills = [
    { y: 560, amp: 60, phase: 0.5, fill: '#2f5e38', row: '#4d8047', id: 'far' },
    { y: 660, amp: 70, phase: 0.8, fill: '#1f4d30', row: '#3c7041', id: 'mid' },
    { y: 780, amp: 55, phase: 0.3, fill: '#133520', row: '#2c5c34', id: 'near' },
  ];

  return (
    <Frame>
      <defs>
        <linearGradient id="hills-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b2016" />
          <stop offset="0.5" stopColor="#23502f" />
          <stop offset="0.66" stopColor="#b3953f" />
        </linearGradient>
        <radialGradient id="hills-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f5e6b8" stopOpacity="0.6" />
          <stop offset="1" stopColor="#f5e6b8" stopOpacity="0" />
        </radialGradient>
        {hills.map((h) => (
          <clipPath key={h.id} id={`hills-${h.id}`}>
            <path d={`${hill(h.y, h.amp, h.phase)} L${W} ${H} L0 ${H} Z`} />
          </clipPath>
        ))}
      </defs>

      <rect width={W} height={H} fill="url(#hills-sky)" />
      <circle cx="1330" cy="330" r="240" fill="url(#hills-moon)" />
      <circle cx="1330" cy="330" r="58" fill="#f5e6b8" />

      {hills.map((h) => (
        <g key={h.id}>
          <path d={`${hill(h.y, h.amp, h.phase)} L${W} ${H} L0 ${H} Z`} fill={h.fill} />
          {/* Crop rows follow the hill's own contour. */}
          <g clipPath={`url(#hills-${h.id})`} stroke={h.row} strokeWidth="4" fill="none" opacity="0.8">
            {Array.from({ length: 14 }, (_, k) => (
              <path key={k} d={hill(h.y + 16 + k * 20, h.amp * (1 - k * 0.03), h.phase)} />
            ))}
          </g>
        </g>
      ))}

      {/* A lone tree on the middle ridge. */}
      <g transform="translate(1240 598)" fill="#0c2416">
        <path d="M-6 0 L-4 -70 L4 -70 L6 0 Z" />
        <circle cx="0" cy="-96" r="40" />
        <circle cx="-34" cy="-78" r="28" />
        <circle cx="34" cy="-80" r="30" />
        <circle cx="-12" cy="-128" r="26" />
        <circle cx="18" cy="-124" r="24" />
      </g>

      <Birds x={1060} y={300} scale={0.8} color="#0c2416" />
    </Frame>
  );
}

export const HERO_SCENES = [
  { id: 'dawn-field', Scene: DawnField },
  { id: 'living-soil', Scene: LivingSoil },
  { id: 'crop-hills', Scene: CropHills },
];
