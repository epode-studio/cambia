import { useEffect, useMemo, useRef, useState } from 'react';

/* ── palette: slate / platinum / dust. Plain technical copy; generative
      "computational botany" as the visual language. ── */
const INK = '#223843'; /* Jet Black (cool slate) */
const PAPER = '#EFF1F3'; /* Platinum */
const DUST = '#DBD3D8'; /* Dust Grey */
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";
const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

const onInk = { sub: 'rgba(239,241,243,0.74)', faint: 'rgba(239,241,243,0.46)', line: 'rgba(239,241,243,0.2)' };
const onPaper = { sub: 'rgba(34,56,67,0.72)', faint: 'rgba(34,56,67,0.46)', line: 'rgba(34,56,67,0.15)' };

/* ── generative grid-cell bloom: a procedural flower built from cells on a grid,
      with a slow, opacity-only ambient regrow loop (glitch-safe). ── */
function buildBloom(cols, rnd) {
  const R = cols / 2;
  const cx = R;
  const cy = R * 0.84; /* flower sits a bit high to leave room for the stem */
  const k = 4 + Math.floor(rnd() * 3); /* 4–6 petals */
  const rot = rnd() * Math.PI * 2;
  const cells = [];
  for (let gy = 0; gy < cols; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const dx = gx + 0.5 - cx;
      const dy = gy + 0.5 - cy;
      const r = Math.hypot(dx, dy);
      const theta = Math.atan2(dy, dx) + rot;
      const petal = R * 0.78 * (0.34 + 0.66 * Math.abs(Math.cos((k * theta) / 2)));
      const inFlower = r <= petal + (rnd() - 0.5) * 1.7;
      const inCenter = r <= R * 0.15;
      const inStem = Math.abs(dx) <= 0.9 && dy > R * 0.18 && dy < R * 1.05;
      const leafY = R * 0.55;
      const inLeaf = Math.abs(dy - leafY) < 1.6 && dx > 0.5 && dx < R * 0.42 && dx < (leafY - Math.abs(dy - leafY)) * 2;
      if (inFlower || inCenter || inStem || inLeaf) {
        const order = Math.min(1, r / R) + (rnd() - 0.5) * 0.1;
        cells.push({ x: gx, y: gy, order: Math.max(0, order), dust: rnd() < 0.22, core: inCenter });
      }
    }
  }
  const ticks = [];
  const nTicks = 4;
  for (let t = 0; t < nTicks; t++) {
    const a = rot + (t * Math.PI * 2) / nTicks;
    ticks.push({ x: cx + Math.cos(a) * R * 0.92, y: cy + Math.sin(a) * R * 0.92, n: t + 1 });
  }
  return { cells, ticks };
}

function GridBloom({ size = 420, cols = 44, dark = false, cycle = 11 }) {
  const seed = useRef(Math.random());
  const { cells, ticks } = useMemo(() => {
    let s = seed.current * 9973;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return buildBloom(cols, rnd);
  }, [cols]);
  const cell = size / cols;
  const cMain = dark ? PAPER : INK;
  const cDust = dark ? 'rgba(219,211,216,0.8)' : DUST;
  const cGrid = dark ? onInk.line : onPaper.line;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
      <title>generative bloom</title>
      {/* faint technical grid */}
      {Array.from({ length: cols + 1 }).map((_, i) =>
        i % 4 === 0 ? (
          <g key={`g${i}`}>
            <line x1={i * cell} y1={0} x2={i * cell} y2={size} stroke={cGrid} strokeWidth={0.5} />
            <line x1={0} y1={i * cell} x2={size} y2={i * cell} stroke={cGrid} strokeWidth={0.5} />
          </g>
        ) : null
      )}
      {/* cells */}
      {cells.map((c) => (
        <rect
          key={`${c.x}-${c.y}`}
          className="bloom-cell"
          x={c.x * cell + cell * 0.12}
          y={c.y * cell + cell * 0.12}
          width={cell * 0.76}
          height={cell * 0.76}
          rx={cell * 0.22}
          fill={c.dust ? cDust : cMain}
          style={{ animationDuration: `${cycle}s`, animationDelay: `${-c.order * cycle}s`, opacity: c.core ? 0.95 : 1 }}
        />
      ))}
      {/* numbered registration ticks */}
      {ticks.map((t) => (
        <g key={`t${t.n}`}>
          <circle cx={t.x * cell} cy={t.y * cell} r={cell * 0.5} fill="none" stroke={cMain} strokeWidth={0.8} opacity={0.55} />
          <text x={t.x * cell + cell * 1.1} y={t.y * cell + cell * 0.4} fontFamily={MONO} fontSize={cell * 1.5} fill={dark ? onInk.faint : onPaper.faint}>
            {t.n}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ── interface cards: opacity/transform only, fixed-height (no layout jank) ── */
const X = {
  ink: INK,
  gray: 'rgba(34,56,67,0.62)',
  faint: 'rgba(34,56,67,0.4)',
  line: '#D5DBDE',
  accent: INK,
  accentSoft: '#DCE4E7',
  paper: '#E4E8EA',
};
const T = `all .7s ${EASE}`;

function ExDashboard({ g }) {
  const tiles = [
    ['Revenue', '$284k'],
    ['Orders', '1,847'],
    ['AOV', '$154'],
    ['New', '412'],
    ['Refunds', '2.1%'],
    ['Churn', '1.4%'],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
      {tiles.map(([k, v], i) => {
        const hero = g && i === 0;
        const dim = g && i >= 3;
        return (
          <div
            key={k}
            style={{
              position: 'relative',
              height: 88,
              border: `1px solid ${hero ? X.accent : X.line}`,
              borderRadius: 8,
              padding: '9px 10px',
              background: hero ? X.accentSoft : '#FFFFFF',
              opacity: dim ? 0.4 : 1,
              transition: T,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 9, color: X.faint, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k}</div>
            <div style={{ fontWeight: hero ? 800 : 700, fontSize: 18, color: X.ink, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums', transition: `font-weight .7s ${EASE}` }}>
              {v}
            </div>
            {i === 0 && (
              <svg width="80%" height="14" viewBox="0 0 60 16" preserveAspectRatio="none" style={{ position: 'absolute', left: 10, bottom: 9, opacity: hero ? 1 : 0, transition: `opacity .7s ${EASE}` }}>
                <polyline points="0,14 12,10 24,12 36,6 48,7 60,2" fill="none" stroke={X.accent} strokeWidth="1.4" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ExForm({ g }) {
  const base = ['Store name', 'What you sell', 'Currency'];
  const adv = ['Tax region', 'Webhook URL', 'Rate limit'];
  const Field = ({ f }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: X.ink }}>{f}</div>
      <div style={{ height: 28, background: X.paper, border: `1px solid ${X.line}`, borderRadius: 7 }} />
    </div>
  );
  return (
    <div>
      {base.map((f) => (
        <Field key={f} f={f} />
      ))}
      <div style={{ position: 'relative', height: 174 }}>
        <div style={{ position: 'absolute', inset: 0, opacity: g ? 0 : 1, transform: g ? 'translateY(-6px)' : 'translateY(0)', transition: T }}>
          {adv.map((f) => (
            <Field key={f} f={f} />
          ))}
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, opacity: g ? 1 : 0, transform: g ? 'translateY(0)' : 'translateY(6px)', transition: T, fontSize: 11.5, color: X.accent, fontWeight: 700 }}>
          + Advanced (3) — optional
        </div>
      </div>
    </div>
  );
}

function ExNav({ g }) {
  const items = ['Overview', 'Orders', 'Refunds', 'Inventory', 'Customers', 'Reports', 'Integrations', 'Settings'];
  const hot = [0, 1, 2];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((it, i) => {
        const promoted = g && hot.includes(i);
        const dim = g && !hot.includes(i);
        return (
          <div key={it}>
            {i === 3 && (
              <div style={{ height: 18, fontFamily: MONO, fontSize: 8.5, color: X.faint, textTransform: 'uppercase', letterSpacing: '.06em', padding: '5px 8px 0', opacity: g ? 1 : 0, transition: `opacity .55s ${EASE}` }}>
                More
              </div>
            )}
            <div className="flex items-center" style={{ gap: 8, padding: '6px 8px', borderRadius: 6, background: promoted ? X.accentSoft : 'transparent', opacity: dim ? 0.4 : 1, transition: T }}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: promoted ? X.accent : X.line, transition: T }} />
              <span style={{ fontSize: 12.5, fontWeight: promoted ? 700 : 400, color: X.ink, transition: T }}>{it}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExFeed({ g }) {
  const rows = [
    ['Aurora Labs', 'shipped 240 units'],
    ['Bjørk Studio', 'refund requested'],
    ['Fjord Supply', 'paid invoice #1031'],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {rows.map(([a, b], i) => (
        <div key={a} className="flex items-center" style={{ gap: 11, height: 58, borderBottom: i < 2 ? `1px solid ${X.line}` : 'none' }}>
          <div style={{ width: 22, height: 22, borderRadius: 99, background: X.accentSoft, color: X.accent, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0, transform: g ? 'scale(1.3)' : 'scale(1)', transformOrigin: 'left center', transition: T }}>
            {a[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: X.ink }}>{a}</div>
            <div style={{ fontSize: 11.5, color: X.gray, opacity: g ? 1 : 0, transform: g ? 'translateY(0)' : 'translateY(-3px)', transition: T }}>{b}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ n, label, caption, children }) {
  return (
    <div style={{ background: '#FBFCFC', borderRadius: 4, padding: 16, color: INK }}>
      <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: INK }}>{n}</span>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: 'rgba(34,56,67,0.4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</span>
      </div>
      <div style={{ minHeight: 196 }}>{children}</div>
      <div style={{ fontSize: 12.5, color: 'rgba(34,56,67,0.6)', marginTop: 14, lineHeight: 1.5 }}>{caption}</div>
    </div>
  );
}

function Reveal({ children, delay = 0, style, className }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(8px)',
        filter: shown ? 'none' : 'blur(6px)',
        willChange: 'opacity, transform',
        transition: `opacity 800ms ${EASE} ${delay}ms, transform 800ms ${EASE} ${delay}ms, filter 800ms ${EASE} ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children, color }) {
  return <div style={{ fontFamily: MONO, fontSize: 11.5, color, textTransform: 'uppercase', letterSpacing: '.18em' }}>{children}</div>;
}

const TAB_CODE = {
  'DESIGN.md': [
    ['cambia:', onPaper.faint],
    ['  roles:', INK],
    ['    tabular-list:', INK],
    ['      conserved: [rows-are-records, sort-by-header]', onPaper.sub],
    ['      adaptive:  [density, default-sort]', INK],
  ],
  React: [
    ['const cambia = createCambia({ designMd, userId })', INK],
    ['const { values, observe } = useCambia("tabular-list")', INK],
    ['// values.density → born-adapted, then personalized', onPaper.faint],
    ['observe({ trait: "density", value: "comfortable" })', INK],
  ],
  Tailwind: [
    ['$ npx cambia tailwind --out cambia.theme.js', INK],
    ['  # DESIGN.md tokens → a Tailwind theme', onPaper.faint],
    ['$ npx cambia tailwind --check cambia.theme.js', INK],
    ['  # CI fails if they drift', onPaper.faint],
  ],
};

export default function App() {
  const [g, setG] = useState(false);
  const [tab, setTab] = useState('DESIGN.md');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href =
      'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
    const iv = setInterval(() => setG((x) => !x), 3400);
    return () => {
      document.head.removeChild(l);
      clearInterval(iv);
    };
  }, []);

  const copy = () => {
    navigator.clipboard?.writeText('npx cambia init').then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      },
      () => {}
    );
  };

  const signals = [
    ['density', 'user toggles comfortable / compact'],
    ['default-sort', 'user clicks a column header'],
    ['promoted-action', 'user invokes a row action'],
    ['…any custom trait', 'whatever you pass to observe()'],
  ];
  const steps = [
    ['#1 born-adapted', 'Tuned from the first render', 'Each component is matched to the app’s archetype before any interaction — analytics opens dense and recency-sorted; CRUD opens comfortable.'],
    ['#2 observe', 'Only the choices you pass it', 'Forward the choices a user already makes — a density toggle, a sort, an action — through one observe() call. No tracking, no setup.'],
    ['#3 personalize', 'Per user, on the device', 'After a clear, repeated pattern, the adaptive trait switches for that user alone. Conserved traits are not in the model, so they never move.'],
  ];
  const packages = [
    ['cambia', 'the CLI', 'init · check · tailwind · skill'],
    ['core', '@cambia/core', 'parse · scaffold · validate'],
    ['runtime', '@cambia/runtime', 'the live, on-device engine'],
    ['react', '@cambia/react', 'the useCambia() hook'],
  ];

  const wrap = { maxWidth: 1080, margin: '0 auto', padding: '0 28px' };

  return (
    <div style={{ background: PAPER, minHeight: '100%', fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      <style>{`
        *{ -webkit-font-smoothing:antialiased; box-sizing:border-box; }
        html,body,#root{ background:${PAPER}; }
        a{ color:inherit; text-decoration:none; }
        p{ text-wrap:pretty; }
        @keyframes bloomPulse{ 0%,100%{ opacity:.18 } 50%{ opacity:1 } }
        .bloom-cell{ animation-name:bloomPulse; animation-timing-function:ease-in-out; animation-iteration-count:infinite; }
        @media (prefers-reduced-motion: reduce){ *{ animation:none!important; transition:none!important; } .bloom-cell{ opacity:1!important; } }
        .serif{ font-family:'Fraunces', Georgia, 'Times New Roman', serif; }
        .h-hero{ font-family:'Fraunces', Georgia, serif; font-weight:600; font-size:clamp(40px,6.2vw,82px); line-height:0.98; letter-spacing:-.018em; margin:0; text-wrap:balance; }
        .sec-h{ font-family:'Fraunces', Georgia, serif; font-weight:600; font-size:clamp(30px,4.6vw,54px); line-height:1.0; letter-spacing:-.012em; margin:0; text-wrap:balance; }
        .feat-h{ font-family:'Fraunces', Georgia, serif; font-weight:600; font-size:clamp(23px,2.8vw,32px); line-height:1.06; margin:0; text-wrap:balance; }
        .hero-grid{ display:grid; grid-template-columns:1fr; gap:36px; align-items:center; }
        .triptych{ display:grid; grid-template-columns:1fr; gap:34px; }
        .figs{ display:grid; grid-template-columns:1fr; gap:16px; }
        .pkgs{ display:grid; grid-template-columns:1fr; gap:1px; }
        @media (min-width:900px){
          .hero-grid{ grid-template-columns:1.05fr 0.95fr; gap:44px; }
          .triptych{ grid-template-columns:1fr 1fr 1fr; gap:28px; }
          .figs{ grid-template-columns:1fr 1fr; }
          .pkgs{ grid-template-columns:1fr 1fr; }
        }
      `}</style>

      {/* nav */}
      <div style={wrap}>
        <div className="flex items-center justify-between" style={{ padding: '22px 0 0', fontSize: 13 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: INK, display: 'inline-block' }} />
            <span style={{ fontFamily: MONO, fontWeight: 600, letterSpacing: '.04em' }}>cambia</span>
          </div>
          <div className="flex items-center" style={{ gap: 20, fontFamily: MONO, fontSize: 12, color: onPaper.sub }}>
            <a href="https://github.com/epode-studio/cambia/blob/main/SPEC.md">spec</a>
            <a href="https://github.com/epode-studio/cambia/tree/main/docs-site">docs</a>
            <a href="https://github.com/epode-studio/cambia">github</a>
          </div>
        </div>
      </div>

      {/* hero */}
      <div style={{ ...wrap, paddingTop: 40 }}>
        <div className="hero-grid">
          <div>
            <Reveal>
              <Eyebrow color={onPaper.sub}>Open source · MIT · a DESIGN.md extension</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="h-hero" style={{ marginTop: 18 }}>
                Interfaces that adapt to each user, on-device.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ fontSize: 17, color: onPaper.sub, lineHeight: 1.5, margin: '20px 0 0', maxWidth: 520 }}>
                A runtime that personalizes the UI per person, locally. You declare which traits may adapt; conserved
                layout never moves. Nothing leaves the device.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div style={{ marginTop: 30 }}>
                <Eyebrow color={onPaper.faint}>Install</Eyebrow>
                <button
                  type="button"
                  onClick={copy}
                  className="flex items-center justify-between"
                  style={{ width: '100%', maxWidth: 460, marginTop: 12, border: `1px solid ${INK}`, background: 'transparent', padding: '13px 16px', gap: 12, cursor: 'pointer', color: INK }}
                >
                  <span style={{ fontFamily: MONO, fontSize: 13.5 }}>npx cambia init</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: onPaper.faint }}>{copied ? 'copied ✓' : '⧉ copy'}</span>
                </button>
                <div className="flex items-center" style={{ gap: 4, marginTop: 14, flexWrap: 'wrap' }}>
                  {Object.keys(TAB_CODE).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      style={{ cursor: 'pointer', border: `1px solid ${tab === t ? INK : onPaper.line}`, background: tab === t ? INK : 'transparent', color: tab === t ? PAPER : onPaper.sub, padding: '5px 12px', fontFamily: MONO, fontSize: 11.5, transition: `all .25s ${EASE}` }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 10, maxWidth: 520, border: `1px solid ${onPaper.line}`, background: '#FBFCFC', padding: '14px 16px', fontFamily: MONO, fontSize: 12, lineHeight: 1.85, whiteSpace: 'pre', overflowX: 'auto' }}>
                  {TAB_CODE[tab].map(([text, color]) => (
                    <div key={text} style={{ color }}>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
          <Reveal delay={140}>
            <GridBloom size={440} cols={44} />
          </Reveal>
        </div>
      </div>

      {/* how it works — inverted ink */}
      <div style={{ background: INK, color: PAPER, marginTop: 72 }}>
        <div style={{ ...wrap, paddingTop: 58, paddingBottom: 60 }}>
          <Reveal>
            <div className="flex items-center justify-between" style={{ marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
              <h2 className="sec-h" style={{ maxWidth: 620 }}>
                Born-adapted, then personalized
              </h2>
              <span style={{ fontFamily: MONO, fontSize: 11, color: PAPER, border: `1px solid ${onInk.line}`, padding: '5px 10px', letterSpacing: '.08em' }}>LIVE ENGINE</span>
            </div>
          </Reveal>
          <div className="triptych">
            {steps.map(([tag, h, d], i) => (
              <Reveal key={tag} delay={i * 100}>
                <div style={{ borderTop: `1px solid ${onInk.line}`, paddingTop: 18 }}>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, color: PAPER, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>{tag}</div>
                  <div style={{ marginBottom: 14, maxWidth: 150 }}>
                    <GridBloom size={150} cols={22} dark cycle={13} />
                  </div>
                  <h3 className="feat-h">{h}</h3>
                  <p style={{ fontSize: 14.5, color: onInk.sub, lineHeight: 1.6, margin: '12px 0 0' }}>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* what it listens for — paper */}
      <div style={{ ...wrap, paddingTop: 60, paddingBottom: 58 }}>
        <Reveal>
          <Eyebrow color={onPaper.faint}>§ what it listens for</Eyebrow>
          <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 640 }}>
            Only the choices you pass it
          </h2>
          <p style={{ fontSize: 15, color: onPaper.sub, margin: '16px 0 28px', maxWidth: 540 }}>
            Each adaptive trait maps to one explicit signal. The engine has no global listeners.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ border: `1px solid ${INK}`, maxWidth: 720 }}>
            {signals.map(([trait, sig], i) => (
              <div key={trait} className="flex items-center justify-between" style={{ padding: '14px 18px', borderBottom: i < signals.length - 1 ? `1px solid ${onPaper.line}` : 'none', gap: 12 }}>
                <span style={{ fontFamily: MONO, fontSize: 13, color: INK, fontWeight: 600 }}>{trait}</span>
                <span style={{ fontSize: 13.5, color: onPaper.sub, textAlign: 'right' }}>{sig}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, color: onPaper.sub, marginTop: 16, lineHeight: 1.6, maxWidth: 620 }}>
            Nothing else. <span style={{ color: INK, fontWeight: 600 }}>No mouse tracking, no scroll, no dwell time, no keystrokes</span> —
            only the discrete choice you forward to <span style={{ fontFamily: MONO, color: INK }}>observe()</span>.
          </p>
        </Reveal>
      </div>

      {/* across every interface — ink, light cards */}
      <div style={{ background: INK, color: PAPER }}>
        <div style={{ ...wrap, paddingTop: 58, paddingBottom: 58 }}>
          <Reveal>
            <Eyebrow color={onInk.faint}>§ one engine, every component</Eyebrow>
            <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 640 }}>
              The same engine, any interface
            </h2>
            <p style={{ fontSize: 15.5, color: onInk.sub, margin: '16px 0 28px', maxWidth: 540 }}>
              Not just tables. A dashboard, a form, a navigation, a feed — each adapts the traits you declared, and
              nothing else. (Default ⇄ personalized, looping.)
            </p>
          </Reveal>
          <div className="figs">
            {[
              ['01', 'dashboard', 'Promotes the one metric this user opens; the rest recede.', <ExDashboard key="d" g={g} />],
              ['02', 'form', 'Collapses advanced fields for users who never touch them.', <ExForm key="f" g={g} />],
              ['03', 'navigation', 'Lifts the few destinations a user visits; files the rest under ‘More’.', <ExNav key="n" g={g} />],
              ['04', 'feed', 'Switches between comfortable cards and a dense list to match how they scan.', <ExFeed key="e" g={g} />],
            ].map(([n, label, cap, node], i) => (
              <Reveal key={n} delay={(i % 2) * 100}>
                <Card n={n} label={label} caption={cap}>
                  {node}
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* privacy — paper */}
      <div style={{ ...wrap, paddingTop: 60, paddingBottom: 56 }}>
        <Reveal>
          <Eyebrow color={onPaper.faint}>§ on the device</Eyebrow>
          <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 720 }}>
            Personalization that stays local
          </h2>
          <p style={{ fontSize: 15, color: onPaper.sub, margin: '16px 0 30px', maxWidth: 600 }}>
            GDPR-friendly by construction: the data barely exists, and it never leaves the device.
          </p>
        </Reveal>
        <div className="triptych">
          {[
            ['Nothing transmitted', 'No telemetry endpoint, no shared server, no network calls. The runtime runs entirely on the device.'],
            ['Almost nothing stored', 'Only small per-trait tallies (comfortable: 5, compact: 3), keyed by user. No PII, no event logs, no history.'],
            ['Erasable in one call', 'cambia.forget(userId) deletes a user’s state and reverts the UI to born-adapted defaults. See PRIVACY.md.'],
          ].map(([h, d], i) => (
            <Reveal key={h} delay={i * 100}>
              <div style={{ borderTop: `1px solid ${INK}`, paddingTop: 16 }}>
                <div style={{ fontFamily: MONO, fontSize: 11.5, color: INK, marginBottom: 10 }}>{`0${i + 1}`}</div>
                <div className="serif" style={{ fontSize: 23, fontWeight: 600, marginBottom: 8 }}>{h}</div>
                <p style={{ fontSize: 14, color: onPaper.sub, lineHeight: 1.6, margin: 0 }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* tailwind + packages — inverted ink */}
      <div style={{ background: INK, color: PAPER }}>
        <div style={{ ...wrap, paddingTop: 56, paddingBottom: 60 }}>
          <Reveal>
            <Eyebrow color={onInk.faint}>§ tailwind, in sync</Eyebrow>
            <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 720 }}>
              One source of truth for tokens
            </h2>
            <div style={{ marginTop: 22, border: `1px solid ${onInk.line}`, padding: '16px 18px', fontFamily: MONO, fontSize: 12.5, lineHeight: 1.9, maxWidth: 720, whiteSpace: 'pre', overflowX: 'auto' }}>
              <div>
                <span style={{ color: onInk.faint }}>$ </span>npx cambia tailwind --out cambia.theme.js
                <span style={{ color: onInk.faint }}>{'   # DESIGN.md tokens → Tailwind'}</span>
              </div>
              <div>
                <span style={{ color: onInk.faint }}>$ </span>npx cambia tailwind --check cambia.theme.js
                <span style={{ color: onInk.faint }}>{'  # CI fails on drift'}</span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: onInk.sub, margin: '14px 0 46px', lineHeight: 1.6, maxWidth: 620 }}>
              Colors, spacing, radius and type are generated from DESIGN.md into Tailwind — not hand-mirrored — and
              drift-checked in CI.
            </p>
          </Reveal>
          <Reveal>
            <Eyebrow color={onInk.faint}>§ four small packages</Eyebrow>
            <h2 className="sec-h" style={{ margin: '14px 0 26px', maxWidth: 720 }}>
              Declare it, then make it live
            </h2>
          </Reveal>
          <div className="pkgs" style={{ background: onInk.line }}>
            {packages.map(([name, pkg, detail], i) => (
              <Reveal key={pkg} delay={(i % 2) * 90}>
                <div style={{ background: INK, padding: '20px 20px' }}>
                  <div className="serif" style={{ fontSize: 27, fontWeight: 600, color: PAPER, marginBottom: 4 }}>{name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, color: onInk.sub, marginBottom: 8 }}>{pkg}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: onInk.faint }}>{detail}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* close — paper */}
      <div style={{ ...wrap, paddingTop: 72, paddingBottom: 36 }}>
        <Reveal>
          <h2 className="sec-h" style={{ maxWidth: 760 }}>
            Personalize your interface, on-device
          </h2>
          <div className="flex items-center" style={{ gap: 18, flexWrap: 'wrap', marginTop: 26 }}>
            <button
              type="button"
              onClick={copy}
              style={{ fontFamily: MONO, fontSize: 13.5, background: INK, color: PAPER, fontWeight: 600, padding: '12px 18px', border: 'none', cursor: 'pointer' }}
            >
              {copied ? 'copied ✓' : 'npx cambia init  ⧉'}
            </button>
            <a href="https://github.com/epode-studio/cambia/blob/main/SPEC.md" style={{ fontFamily: MONO, fontSize: 13, color: INK, fontWeight: 600 }}>
              read the spec →
            </a>
          </div>
        </Reveal>
      </div>

      {/* footer */}
      <div style={wrap}>
        <div className="flex items-center justify-between" style={{ padding: '24px 0 40px', marginTop: 36, borderTop: `1px solid ${onPaper.line}`, fontFamily: MONO, fontSize: 11.5, color: onPaper.faint, flexWrap: 'wrap', gap: 10 }}>
          <span>
            <span style={{ color: INK }}>●</span> cambia · a living layer on DESIGN.md
          </span>
          <span>built on DESIGN.md · MIT · 2026</span>
        </div>
      </div>
    </div>
  );
}
