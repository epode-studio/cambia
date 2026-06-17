import { createCambia, createLocalStorageStore } from '@cambia/runtime';
import { CambiaProvider, useCambia } from '@cambia/react';
import { useEffect, useMemo, useRef, useState } from 'react';

/* ── elegant / Renaissance: white ground, Fraunces serif, sharp blue used like
      precious ultramarine. Hairline rules, generous air, no harsh shadows. ── */
const WHITE = '#FFFFFF';
const INK = '#0B0B0D';
const BLUE = '#1A36FF';
const BLUE_SOFT = '#E7EAFF';
const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";
const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

const onBlue = { sub: 'rgba(255,255,255,0.82)', faint: 'rgba(255,255,255,0.58)', line: 'rgba(255,255,255,0.34)' };
const onPaper = { sub: 'rgba(11,11,13,0.7)', faint: 'rgba(11,11,13,0.45)', line: 'rgba(11,11,13,0.16)' };

/* ── This page runs on Cambia. The DESIGN.md the live demo is driven by. ── */
const DEMO_DESIGN = `---
name: Cambia Site
components:
  data-table: {}
cambia:
  version: "0.1"
  context:
    archetype: analytics
  roles:
    tabular-list:
      component: data-table
      conserved: [rows-are-records, sort-by-header]
      adaptive: [density, default-sort]
---
`;

/* Each profile is a real @cambia/runtime user. Seeded ones replay a little history so
   they show a different personalized state; "You" persists in your browser. */
const PROFILES = [
  { id: 'new', label: 'New user', seed: [] },
  { id: 'skimmer', label: 'Skimmer', seed: [['density', 'comfortable', 4]] },
  { id: 'analyst', label: 'Analyst', seed: [['default-sort', 'total', 4]] },
  { id: 'you', label: 'You', persistent: true, seed: [] },
];

function buildEngine(profile) {
  let userId = `demo-${profile.id}`;
  let store;
  if (profile.persistent) {
    try {
      userId = localStorage.getItem('cambia-demo-uid') || `you-${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem('cambia-demo-uid', userId);
      store = createLocalStorageStore('cambia-demo');
    } catch {
      /* no storage — in-memory */
    }
  }
  const engine = createCambia({ designMd: DEMO_DESIGN, userId, store, switchMargin: 1.1 });
  if (profile.seed?.length) {
    const role = engine.role('tabular-list');
    for (const [trait, value, n] of profile.seed) {
      for (let i = 0; i < n; i++) role.observe({ trait, value });
    }
  }
  return { engine, userId };
}

/* ── generative grid-cell bloom: procedural flower, opacity-only regrow loop. ── */
function buildBloom(cols, rnd) {
  const R = cols / 2;
  const cx = R;
  const cy = R * 0.8;
  const petals = 5 + Math.floor(rnd() * 4);
  const rot = rnd() * Math.PI * 2;
  const Rf = R * 0.94;
  const cells = [];
  for (let gy = 0; gy < cols; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const dx = gx + 0.5 - cx;
      const dy = gy + 0.5 - cy;
      const r = Math.hypot(dx, dy);
      const theta = Math.atan2(dy, dx) + rot;
      const lobe = Math.abs(Math.cos((petals * theta) / 2));
      const env = Rf * (0.08 + 0.92 * lobe ** 1.3);
      const core = r <= R * 0.17;
      const onPetal = r <= env;
      const stemWave = Math.sin((dy + cy) * 0.45) * 0.9;
      const inStem = Math.abs(dx - stemWave) <= 0.9 && dy > R * 0.14 && dy < R * 1.12;
      const leaf = (ly, dir, len) => {
        const lx = dx * dir;
        return lx > 0.4 && lx < len && Math.abs(dy - ly) < (len - lx) * 0.42;
      };
      const inLeaf = leaf(R * 0.5, 1, R * 0.42) || leaf(R * 0.78, -1, R * 0.36);
      if (core || onPetal || inStem || inLeaf) {
        if (onPetal && !core) {
          const keep = 0.4 + 0.6 * (1 - r / Math.max(1, env));
          if (rnd() > keep) continue;
        }
        const order = Math.min(1, r / R) + (rnd() - 0.5) * 0.06;
        cells.push({ x: gx, y: gy, order: Math.max(0, order), alt: rnd() < 0.16, core });
      }
    }
  }
  return { cells };
}

function GridBloom({ size = 420, cols = 46, dark = false, cycle = 11, grow = 0 }) {
  const seed = useRef(Math.random());
  const { cells } = useMemo(() => {
    let s = ((seed.current * 9973) | 0) || 7;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return buildBloom(cols, rnd);
  }, [cols]);
  const cell = size / cols;
  const cMain = dark ? WHITE : BLUE;
  const cAlt = dark ? 'rgba(255,255,255,0.5)' : INK;
  const cGrid = dark ? onBlue.line : onPaper.line;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ display: 'block', overflow: 'visible', transform: `scale(${0.97 + grow * 0.17})`, transformOrigin: 'center', transition: `transform .9s ${EASE}` }}
      aria-hidden="true"
    >
      <title>generative bloom</title>
      {Array.from({ length: cols + 1 }).map((_, i) =>
        i % 6 === 0 ? (
          <g key={`g${i}`}>
            <line x1={i * cell} y1={0} x2={i * cell} y2={size} stroke={cGrid} strokeWidth={0.5} />
            <line x1={0} y1={i * cell} x2={size} y2={i * cell} stroke={cGrid} strokeWidth={0.5} />
          </g>
        ) : null
      )}
      {cells.map((c) => {
        const sz = cell * (0.92 - 0.4 * c.order);
        const off = (cell - sz) / 2;
        return (
          <rect
            key={`${c.x}-${c.y}`}
            className="bloom-cell"
            x={c.x * cell + off}
            y={c.y * cell + off}
            width={sz}
            height={sz}
            fill={c.alt ? cAlt : cMain}
            style={{ animationDuration: `${cycle}s`, animationDelay: `${-c.order * cycle}s`, opacity: c.core ? 0.97 : 1 }}
          />
        );
      })}
    </svg>
  );
}

/* ── the LIVE demo: a real table driven by @cambia/runtime, scoped to this visitor ── */
function LiveDemo({ profile, pid, setPid, onForget }) {
  const { values, observe } = useCambia('tabular-list');
  const density = values.density || 'compact';
  const sort = values['default-sort'] === 'total' ? 'total' : '__recency__';
  const comfortable = density === 'comfortable';
  const rows = [
    [1043, 'Aurora Labs', 2480, 'Paid'],
    [1044, 'Bjørk Studio', 960, 'Refunded'],
    [1045, 'Fjord Supply', 1205, 'Paid'],
    [1046, 'Kestrel Co', 540, 'Pending'],
  ];
  const sorted = [...rows].sort((a, b) => (sort === 'total' ? b[2] - a[2] : b[0] - a[0]));
  const cellPad = comfortable ? '13px 14px' : '6px 14px';
  const money = (n) => `$${n.toLocaleString('en-US')}`;
  const chip = (active, muted) => ({
    fontFamily: MONO,
    fontSize: 11.5,
    padding: '6px 10px',
    cursor: 'pointer',
    border: `1px solid ${muted ? onPaper.line : active ? BLUE : INK}`,
    background: active ? BLUE : WHITE,
    color: active ? WHITE : muted ? onPaper.sub : INK,
    textTransform: 'uppercase',
    letterSpacing: '.03em',
    transition: `all .2s ${EASE}`,
  });
  const lbl = { fontFamily: MONO, fontSize: 10, color: onPaper.faint, textTransform: 'uppercase', letterSpacing: '.06em' };
  const cols = [
    ['Order', 'order'],
    ['Customer', ''],
    ['Total', 'total'],
    ['Status', ''],
  ];

  return (
    <div style={{ border: `1px solid ${INK}`, background: WHITE }}>
      {/* profile switcher */}
      <div className="flex items-center" style={{ borderBottom: `1px solid ${INK}`, padding: '10px 12px', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ ...lbl, marginRight: 2 }}>profile</span>
        {PROFILES.map((p) => (
          <button key={p.id} type="button" style={chip(pid === p.id)} onClick={() => setPid(p.id)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between" style={{ borderBottom: `1px solid ${INK}`, padding: '10px 16px', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em' }}>data-table · role: tabular-list</span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: BLUE }}>
          {density} · {sort === 'total' ? 'by total' : 'recency'}
        </span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${INK}` }}>
            {cols.map(([h, key]) => {
              const active = (key === 'total' && sort === 'total') || (key === 'order' && sort !== 'total');
              return (
                <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: active ? BLUE : onPaper.faint, fontWeight: 600 }}>
                  {h}
                  {active ? ' ↓' : ''}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={r[0]} style={{ borderBottom: i < sorted.length - 1 ? `1px solid ${onPaper.line}` : 'none' }}>
              <td style={{ padding: cellPad, fontFamily: MONO, color: onPaper.sub, transition: `padding .5s ${EASE}` }}>#{r[0]}</td>
              <td style={{ padding: cellPad, fontWeight: 600, transition: `padding .5s ${EASE}` }}>{r[1]}</td>
              <td style={{ padding: cellPad, fontVariantNumeric: 'tabular-nums', color: sort === 'total' ? BLUE : INK, transition: `padding .5s ${EASE}` }}>{money(r[2])}</td>
              <td style={{ padding: cellPad, transition: `padding .5s ${EASE}` }}>
                <span style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.04em', border: `1px solid ${INK}`, padding: '2px 6px' }}>{r[3]}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center" style={{ gap: 14, padding: '12px 14px', borderTop: `1px solid ${INK}`, flexWrap: 'wrap' }}>
        <div className="flex items-center" style={{ gap: 5 }}>
          <span style={{ ...lbl, marginRight: 2 }}>density</span>
          <button type="button" style={chip(!comfortable)} onClick={() => observe({ trait: 'density', value: 'compact' })}>
            compact
          </button>
          <button type="button" style={chip(comfortable)} onClick={() => observe({ trait: 'density', value: 'comfortable' })}>
            comfortable
          </button>
        </div>
        <div className="flex items-center" style={{ gap: 5 }}>
          <span style={{ ...lbl, marginRight: 2 }}>sort</span>
          <button type="button" style={chip(sort !== 'total')} onClick={() => observe({ trait: 'default-sort', value: '__recency__' })}>
            recency
          </button>
          <button type="button" style={chip(sort === 'total')} onClick={() => observe({ trait: 'default-sort', value: 'total' })}>
            total
          </button>
        </div>
        <button type="button" style={{ ...chip(false, true), marginLeft: 'auto' }} onClick={onForget}>
          forget
        </button>
      </div>

      <div style={{ borderTop: `1px solid ${onPaper.line}`, padding: '10px 14px', fontFamily: MONO, fontSize: 11, color: onPaper.faint, lineHeight: 1.7 }}>
        profile <span style={{ color: INK }}>{profile.label}</span> · density <span style={{ color: BLUE }}>{density}</span> · sort{' '}
        <span style={{ color: BLUE }}>{sort === 'total' ? 'total' : 'recency'}</span> ·{' '}
        {profile.persistent ? 'saved in your browser' : 'in-memory'} · the whole page renders as this profile ↑
      </div>
    </div>
  );
}

/* ── illustrative auto-loop examples (passive) ── */
const X = {
  ink: INK,
  gray: 'rgba(11,11,13,0.6)',
  faint: 'rgba(11,11,13,0.4)',
  line: '#E0E0E4',
  accent: BLUE,
  accentSoft: BLUE_SOFT,
  paper: '#F1F1F4',
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
          <div key={k} style={{ position: 'relative', height: 88, border: `1px solid ${hero ? X.accent : X.line}`, padding: '9px 10px', background: hero ? X.accentSoft : '#FFFFFF', opacity: dim ? 0.4 : 1, transition: T }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: X.faint, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k}</div>
            <div style={{ fontWeight: hero ? 800 : 700, fontSize: 18, color: hero ? X.accent : X.ink, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums', transition: T }}>{v}</div>
            {i === 0 && (
              <svg width="80%" height="14" viewBox="0 0 60 16" preserveAspectRatio="none" style={{ position: 'absolute', left: 10, bottom: 9, opacity: hero ? 1 : 0, transition: `opacity .7s ${EASE}` }}>
                <polyline points="0,14 12,10 24,12 36,6 48,7 60,2" fill="none" stroke={X.accent} strokeWidth="1.6" />
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
      <div style={{ height: 28, background: X.paper, border: `1px solid ${X.line}` }} />
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
            <div className="flex items-center" style={{ gap: 8, padding: '6px 8px', background: promoted ? X.accentSoft : 'transparent', opacity: dim ? 0.4 : 1, transition: T }}>
              <span style={{ width: 5, height: 5, background: promoted ? X.accent : X.line, transition: T }} />
              <span style={{ fontSize: 12.5, fontWeight: promoted ? 700 : 400, color: promoted ? X.accent : X.ink, transition: T }}>{it}</span>
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
          <div style={{ width: 22, height: 22, background: X.accentSoft, color: X.accent, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0, transform: g ? 'scale(1.3)' : 'scale(1)', transformOrigin: 'left center', transition: T }}>
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
    <div style={{ background: '#FFFFFF', border: `1px solid ${onBlue.line}`, padding: 16, color: INK }}>
      <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: BLUE }}>{n}</span>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: 'rgba(11,11,13,0.4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</span>
      </div>
      <div style={{ minHeight: 196 }}>{children}</div>
      <div style={{ fontSize: 12.5, color: 'rgba(11,11,13,0.6)', marginTop: 14, lineHeight: 1.5 }}>{caption}</div>
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
    ['      adaptive:  [density, default-sort]', BLUE],
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

function Site({ engine, uid, profile, pid, setPid }) {
  const [tab, setTab] = useState('DESIGN.md');
  const [copied, setCopied] = useState(false);
  /* the WHOLE page reads the live trait — spacing, examples, bloom all follow the active profile */
  const { values } = useCambia('tabular-list');
  const density = values.density || 'compact';
  const comfortable = density === 'comfortable';
  const D = comfortable ? 1.26 : 1;
  const sx = (top, bottom) => ({
    paddingTop: Math.round(top * D),
    paddingBottom: Math.round(bottom * D),
    transition: `padding .6s ${EASE}`,
  });

  useEffect(() => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href =
      'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
    return () => {
      document.head.removeChild(l);
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
    ['density', 'user toggles comfortable / compact', true],
    ['default-sort', 'user clicks a column header', true],
    ['promoted-action', 'user invokes a row action', false],
    ['…any custom trait', 'whatever you pass to observe()', false],
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
    <div style={{ background: WHITE, minHeight: '100%', fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      <style>{`
        *{ -webkit-font-smoothing:antialiased; box-sizing:border-box; }
        html,body,#root{ background:${WHITE}; }
        a{ color:inherit; text-decoration:none; }
        p{ text-wrap:pretty; }
        .flex{ display:flex; }
        .items-center{ align-items:center; }
        .justify-between{ justify-content:space-between; }
        @keyframes bloomPulse{ 0%,100%{ opacity:.16 } 50%{ opacity:1 } }
        .bloom-cell{ animation-name:bloomPulse; animation-timing-function:ease-in-out; animation-iteration-count:infinite; }
        @media (prefers-reduced-motion: reduce){ *{ animation:none!important; transition:none!important; } .bloom-cell{ opacity:1!important; } }
        .h-hero{ font-family:${SERIF}; font-weight:600; font-size:clamp(44px,6.4vw,90px); line-height:0.99; letter-spacing:-.02em; margin:0; text-wrap:balance; }
        .sec-h{ font-family:${SERIF}; font-weight:600; font-size:clamp(30px,4.4vw,54px); line-height:1.0; letter-spacing:-.015em; margin:0; text-wrap:balance; }
        .feat-h{ font-family:${SERIF}; font-weight:600; font-size:clamp(22px,2.6vw,31px); line-height:1.06; letter-spacing:-.01em; margin:0; text-wrap:balance; }
        .hero-grid{ display:grid; grid-template-columns:1fr; gap:36px; align-items:center; }
        .triptych{ display:grid; grid-template-columns:1fr; gap:34px; }
        .figs{ display:grid; grid-template-columns:1fr; gap:16px; }
        .pkgs{ display:grid; grid-template-columns:1fr; gap:1px; }
        .demo-grid{ display:grid; grid-template-columns:1fr; gap:30px; align-items:center; }
        @media (min-width:900px){
          .hero-grid{ grid-template-columns:1.08fr 0.92fr; gap:44px; }
          .triptych{ grid-template-columns:1fr 1fr 1fr; gap:28px; }
          .figs{ grid-template-columns:1fr 1fr; }
          .pkgs{ grid-template-columns:1fr 1fr; }
          .demo-grid{ grid-template-columns:0.92fr 1.08fr; gap:40px; }
        }
      `}</style>

      {/* nav */}
      <div style={wrap}>
        <div className="flex items-center justify-between" style={{ padding: '20px 0 16px', fontSize: 13, borderBottom: `1px solid ${INK}`, flexWrap: 'wrap', gap: 10 }}>
          <div className="flex items-center" style={{ gap: 9 }}>
            <span style={{ width: 9, height: 9, background: BLUE, display: 'inline-block' }} />
            <span style={{ fontFamily: MONO, fontWeight: 700, letterSpacing: '.04em' }}>cambia</span>
          </div>
          <div className="flex items-center" style={{ gap: 16, fontFamily: MONO, fontSize: 12, color: onPaper.sub }}>
            <span
              style={{
                fontSize: 11,
                color: comfortable ? BLUE : onPaper.faint,
                border: `1px solid ${comfortable ? BLUE : onPaper.line}`,
                padding: '3px 8px',
                letterSpacing: '.04em',
                transition: `all .4s ${EASE}`,
              }}
            >
              ▦ {profile?.persistent ? 'adapting to you' : `as ${profile?.label?.toLowerCase()}`} · {density}
            </span>
            <a href="https://github.com/epode-studio/cambia/blob/main/SPEC.md">spec</a>
            <a href="https://github.com/epode-studio/cambia/tree/main/docs-site">docs</a>
            <a href="https://github.com/epode-studio/cambia">github</a>
          </div>
        </div>
      </div>

      {/* hero */}
      <div style={{ ...wrap, ...sx(44, 0) }}>
        <div className="hero-grid">
          <div>
            <Reveal>
              <Eyebrow color={BLUE}>Open source · MIT · a DESIGN.md extension</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="h-hero" style={{ marginTop: 18 }}>
                Interfaces that adapt to each user, on-device.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="serif" style={{ fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(19px,2.2vw,27px)', color: INK, lineHeight: 1.34, margin: '22px 0 0', maxWidth: 500 }}>
                The interface learns the person — privately, on their device.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex items-center" style={{ gap: 18, marginTop: 32, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={copy}
                  style={{ fontFamily: MONO, fontSize: 13.5, background: BLUE, color: WHITE, fontWeight: 600, padding: '13px 18px', border: `1px solid ${BLUE}`, cursor: 'pointer' }}
                >
                  {copied ? 'copied ✓' : 'npx cambia init  ⧉'}
                </button>
                <a href="#try" style={{ fontFamily: MONO, fontSize: 13, color: INK, fontWeight: 600 }}>
                  watch it adapt ↓
                </a>
              </div>
            </Reveal>
          </div>
          <Reveal delay={140}>
            <GridBloom size={460} cols={44} grow={comfortable ? 1 : 0} />
          </Reveal>
        </div>
      </div>

      {/* LIVE — this page runs on cambia */}
      <div id="try" style={{ ...wrap, ...sx(70, 0) }}>
        <div className="demo-grid">
          <Reveal>
            <Eyebrow color={BLUE}>§ this page runs on cambia</Eyebrow>
            <h2 className="sec-h" style={{ marginTop: 14 }}>
              One design, a different interface per person
            </h2>
            <p style={{ fontSize: 15, color: onPaper.sub, margin: '16px 0 0', maxWidth: 460, lineHeight: 1.55 }}>
              The table is a real <span style={{ fontFamily: MONO, color: INK }}>@cambia/runtime</span> instance. Switch{' '}
              <strong>profiles</strong> — each is its own user: the <strong>New user</strong> is born-adapted (compact,
              recency), the <strong>Analyst</strong> sorts by total, the <strong>Skimmer</strong> wants room. Same
              declared design; the conserved grammar — rows are records, sort by header — never moves.
            </p>
            <p style={{ fontSize: 13, color: onPaper.faint, marginTop: 14, lineHeight: 1.5 }}>
              Personalize any profile with the controls — the <strong>whole page</strong> re-renders as that person
              (spacing, the bloom, the chip). <span style={{ fontFamily: MONO, color: INK }}>You</span> is saved in your
              browser; reload and it remembers.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <LiveDemo profile={profile} pid={pid} setPid={setPid} onForget={() => engine.forget()} />
          </Reveal>
        </div>
      </div>

      {/* add one block — the install / code */}
      <div style={{ ...wrap, ...sx(64, 0) }}>
        <Reveal>
          <Eyebrow color={BLUE}>§ add one block</Eyebrow>
          <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 680 }}>
            One block on the DESIGN.md you already have
          </h2>
          <p style={{ fontSize: 15, color: onPaper.sub, margin: '16px 0 24px', maxWidth: 540 }}>
            <span style={{ fontFamily: MONO, color: INK }}>cambia init</span> adds it non-destructively — your agent
            reads it, your components carry it. You declare what may adapt; conserved layout never moves.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <button
            type="button"
            onClick={copy}
            className="flex items-center justify-between"
            style={{ width: '100%', maxWidth: 520, border: `1px solid ${INK}`, background: WHITE, padding: '13px 16px', gap: 12, cursor: 'pointer', color: INK }}
          >
            <span style={{ fontFamily: MONO, fontSize: 13.5 }}>npx cambia init</span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: copied ? BLUE : onPaper.faint }}>{copied ? 'copied ✓' : '⧉ copy'}</span>
          </button>
          <div className="flex items-center" style={{ gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
            {Object.keys(TAB_CODE).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{ cursor: 'pointer', border: `1px solid ${INK}`, background: tab === t ? BLUE : WHITE, color: tab === t ? WHITE : INK, padding: '6px 12px', fontFamily: MONO, fontSize: 11.5, transition: `all .2s ${EASE}` }}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12, maxWidth: 720, border: `1px solid ${INK}`, background: '#FAFAFB', padding: '16px 18px', fontFamily: MONO, fontSize: 12.5, lineHeight: 1.9, whiteSpace: 'pre', overflowX: 'auto' }}>
            {TAB_CODE[tab].map(([text, color]) => (
              <div key={text} style={{ color }}>
                {text}
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* how it works — sharp blue block */}
      <div style={{ background: BLUE, color: WHITE, marginTop: Math.round(72 * D), transition: `margin .6s ${EASE}` }}>
        <div style={{ ...wrap, ...sx(58, 60) }}>
          <Reveal>
            <div className="flex items-center justify-between" style={{ marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
              <h2 className="sec-h" style={{ maxWidth: 660 }}>
                Born-adapted, then personalized
              </h2>
              <span style={{ fontFamily: MONO, fontSize: 11, color: WHITE, border: `1px solid ${WHITE}`, padding: '5px 10px', letterSpacing: '.08em' }}>LIVE ENGINE</span>
            </div>
          </Reveal>
          <div className="triptych">
            {steps.map(([tag, h, d], i) => (
              <Reveal key={tag} delay={i * 100}>
                <div style={{ borderTop: `1px solid ${WHITE}`, paddingTop: 18 }}>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, color: WHITE, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>{tag}</div>
                  <div style={{ marginBottom: 14, maxWidth: 150 }}>
                    <GridBloom size={150} cols={22} dark cycle={13} />
                  </div>
                  <h3 className="feat-h">{h}</h3>
                  <p style={{ fontSize: 14.5, color: onBlue.sub, lineHeight: 1.6, margin: '12px 0 0' }}>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* what it listens for — white */}
      <div style={{ ...wrap, ...sx(60, 58) }}>
        <Reveal>
          <Eyebrow color={BLUE}>§ what it listens for</Eyebrow>
          <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 640 }}>
            Only the choices you pass it
          </h2>
          <p style={{ fontSize: 15, color: onPaper.sub, margin: '16px 0 28px', maxWidth: 560 }}>
            Each adaptive trait maps to one explicit signal — the engine has no global listeners. The two you just
            changed, <span style={{ fontFamily: MONO, color: INK }}>density</span> and{' '}
            <span style={{ fontFamily: MONO, color: INK }}>default-sort</span>, are signals; everything else stays conserved.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ border: `1px solid ${INK}`, maxWidth: 720 }}>
            {signals.map(([trait, sig, inDemo], i) => (
              <div key={trait} className="flex items-center justify-between" style={{ padding: '14px 18px', borderBottom: i < signals.length - 1 ? `1px solid ${onPaper.line}` : 'none', gap: 16 }}>
                <span className="flex items-center" style={{ gap: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, color: BLUE, fontWeight: 600 }}>{trait}</span>
                  {inDemo ? (
                    <span style={{ fontFamily: MONO, fontSize: 9.5, color: BLUE, border: `1px solid ${BLUE}`, padding: '1px 5px', textTransform: 'uppercase', letterSpacing: '.05em' }}>in the demo ↑</span>
                  ) : null}
                </span>
                <span style={{ fontSize: 13.5, color: onPaper.sub, textAlign: 'right' }}>{sig}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, color: onPaper.sub, marginTop: 16, lineHeight: 1.6, maxWidth: 620 }}>
            Nothing else. <span style={{ color: INK, fontWeight: 600 }}>No mouse tracking, no scroll, no dwell time, no keystrokes</span> —
            only the discrete choice you forward to <span style={{ fontFamily: MONO, color: BLUE }}>observe()</span>.
          </p>
        </Reveal>
      </div>

      {/* across every interface — blue block, white cards */}
      <div style={{ background: BLUE, color: WHITE }}>
        <div style={{ ...wrap, ...sx(58, 58) }}>
          <Reveal>
            <Eyebrow color={onBlue.faint}>§ one engine, every component</Eyebrow>
            <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 640 }}>
              The same engine, any interface
            </h2>
            <p style={{ fontSize: 15.5, color: onBlue.sub, margin: '16px 0 28px', maxWidth: 540 }}>
              Not just tables. A dashboard, a form, a navigation, a feed — each rendered for the profile you picked
              above. Same declared design; the conserved layout never moves.
            </p>
          </Reveal>
          <div className="figs">
            {[
              ['01', 'dashboard', 'Promotes the one metric this user opens; the rest recede.', <ExDashboard key="d" g={comfortable} />],
              ['02', 'form', 'Collapses advanced fields for users who never touch them.', <ExForm key="f" g={comfortable} />],
              ['03', 'navigation', 'Lifts the few destinations a user visits; files the rest under ‘More’.', <ExNav key="n" g={comfortable} />],
              ['04', 'feed', 'Switches between comfortable cards and a dense list to match how they scan.', <ExFeed key="e" g={comfortable} />],
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

      {/* privacy — white */}
      <div style={{ ...wrap, ...sx(60, 56) }}>
        <Reveal>
          <Eyebrow color={BLUE}>§ on the device</Eyebrow>
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
                <div style={{ fontFamily: MONO, fontSize: 11.5, color: BLUE, marginBottom: 10 }}>{`0${i + 1}`}</div>
                <div className="feat-h" style={{ fontSize: 21, marginBottom: 8 }}>{h}</div>
                <p style={{ fontSize: 14, color: onPaper.sub, lineHeight: 1.6, margin: 0 }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* tailwind + packages — blue block */}
      <div style={{ background: BLUE, color: WHITE }}>
        <div style={{ ...wrap, ...sx(56, 60) }}>
          <Reveal>
            <Eyebrow color={onBlue.faint}>§ tailwind, in sync</Eyebrow>
            <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 720 }}>
              One source of truth for tokens
            </h2>
            <div style={{ marginTop: 22, border: `1px solid ${WHITE}`, padding: '16px 18px', fontFamily: MONO, fontSize: 12.5, lineHeight: 1.9, maxWidth: 720, whiteSpace: 'pre', overflowX: 'auto' }}>
              <div>
                <span style={{ color: onBlue.faint }}>$ </span>npx cambia tailwind --out cambia.theme.js
                <span style={{ color: onBlue.faint }}>{'   # DESIGN.md tokens → Tailwind'}</span>
              </div>
              <div>
                <span style={{ color: onBlue.faint }}>$ </span>npx cambia tailwind --check cambia.theme.js
                <span style={{ color: onBlue.faint }}>{'  # CI fails on drift'}</span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: onBlue.sub, margin: '14px 0 46px', lineHeight: 1.6, maxWidth: 620 }}>
              Colors, spacing, radius and type are generated from DESIGN.md into Tailwind — not hand-mirrored — and
              drift-checked in CI.
            </p>
          </Reveal>
          <Reveal>
            <Eyebrow color={onBlue.faint}>§ four small packages</Eyebrow>
            <h2 className="sec-h" style={{ margin: '14px 0 26px', maxWidth: 720 }}>
              Declare it, then make it live
            </h2>
          </Reveal>
          <div className="pkgs" style={{ border: `1px solid ${WHITE}`, background: onBlue.line }}>
            {packages.map(([name, pkg, detail]) => (
              <Reveal key={pkg}>
                <div style={{ background: BLUE, padding: '20px 20px', height: '100%' }}>
                  <div style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 600, color: WHITE, marginBottom: 4, letterSpacing: '-.01em' }}>{name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, color: WHITE, marginBottom: 8 }}>{pkg}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: onBlue.sub }}>{detail}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* close — white */}
      <div style={{ ...wrap, ...sx(72, 40) }}>
        <Reveal>
          <h2 className="sec-h" style={{ maxWidth: 880 }}>
            Personalize your interface, on-device
          </h2>
          <div className="flex items-center" style={{ gap: 18, flexWrap: 'wrap', marginTop: 26 }}>
            <button
              type="button"
              onClick={copy}
              style={{ fontFamily: MONO, fontSize: 13.5, background: BLUE, color: WHITE, fontWeight: 600, padding: '13px 20px', border: `1px solid ${BLUE}`, cursor: 'pointer' }}
            >
              {copied ? 'copied ✓' : 'npx cambia init  ⧉'}
            </button>
            <a href="https://github.com/epode-studio/cambia/blob/main/SPEC.md" style={{ fontFamily: MONO, fontSize: 13, color: BLUE, fontWeight: 600 }}>
              read the spec →
            </a>
          </div>
        </Reveal>
      </div>

      {/* footer */}
      <div style={wrap}>
        <div className="flex items-center justify-between" style={{ padding: '24px 0 40px', marginTop: 36, borderTop: `1px solid ${INK}`, fontFamily: MONO, fontSize: 11.5, color: onPaper.faint, flexWrap: 'wrap', gap: 10 }}>
          <span>
            <span style={{ color: BLUE }}>■</span> cambia · a living layer on DESIGN.md
          </span>
          <span>built on DESIGN.md · MIT · 2026</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const cache = useRef({});
  const [pid, setPid] = useState('new');
  const profile = PROFILES.find((p) => p.id === pid) || PROFILES[0];
  if (!cache.current[pid]) cache.current[pid] = buildEngine(profile);
  const { engine, userId } = cache.current[pid];
  return (
    <CambiaProvider value={engine}>
      <Site engine={engine} uid={userId} profile={profile} pid={pid} setPid={setPid} />
    </CambiaProvider>
  );
}
