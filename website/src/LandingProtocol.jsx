import { createCambia, createLocalStorageStore } from '@epode/cambia-runtime';
import { CambiaProvider, useCambia } from '@epode/cambia-react';
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

/* Each profile is a real @epode/cambia-runtime user. Seeded ones replay a little history so
   they show a different personalized state; "You" persists in your browser. */
const PROFILES = [
  { id: 'new', label: 'New user', seed: [] },
  { id: 'skimmer', label: 'Skimmer', seed: [['density', 'comfortable', 4]] },
  { id: 'analyst', label: 'Analyst', seed: [['density', 'comfortable', 4], ['default-sort', 'total', 4]] },
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

/* ── a segmented control: the one obvious "interactive" affordance on the page ── */
function Segmented({ options, value, onChange, big }) {
  return (
    <div className="flex" style={{ border: `1px solid ${INK}`, background: WHITE, flexShrink: 0 }}>
      {options.map((o, i) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              fontFamily: MONO,
              fontSize: big ? 12 : 11,
              padding: big ? '7px 13px' : '5px 10px',
              cursor: 'pointer',
              border: 'none',
              borderLeft: i ? `1px solid ${INK}` : 'none',
              background: active ? BLUE : 'transparent',
              color: active ? WHITE : INK,
              textTransform: 'uppercase',
              letterSpacing: '.04em',
              transition: `background .15s ${EASE}`,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const STATUS_DOT = { Paid: INK, Pending: BLUE, Refunded: 'rgba(11,11,13,0.35)' };

/* ── preview window: clearly PASSIVE output. Window chrome + status dots, no
      controls — it just renders the active profile. ── */
function PreviewTable({ density, sort, profile }) {
  const comfortable = density === 'comfortable';
  const rows = [
    [1043, 'Aurora Labs', 2480, 'Paid'],
    [1044, 'Bjørk Studio', 960, 'Refunded'],
    [1045, 'Fjord Supply', 1205, 'Paid'],
    [1046, 'Kestrel Co', 540, 'Pending'],
  ];
  const sorted = [...rows].sort((a, b) => (sort === 'total' ? b[2] - a[2] : b[0] - a[0]));
  const pad = comfortable ? '13px 16px' : '7px 16px';
  const money = (n) => `$${n.toLocaleString('en-US')}`;
  const cols = [
    ['Order', 'order'],
    ['Customer', ''],
    ['Total', 'total'],
    ['Status', ''],
  ];
  return (
    <div style={{ border: `1px solid ${INK}`, background: WHITE }}>
      {/* window chrome — signals "this is a preview, not buttons" */}
      <div className="flex items-center justify-between" style={{ borderBottom: `1px solid ${INK}`, padding: '9px 14px', background: '#F6F6F8' }}>
        <span className="flex items-center" style={{ gap: 6 }}>
          {[0, 1, 2].map((d) => (
            <span key={d} style={{ width: 8, height: 8, borderRadius: 99, border: `1px solid ${onPaper.faint}` }} />
          ))}
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: onPaper.faint, textTransform: 'uppercase', letterSpacing: '.06em', marginLeft: 6 }}>preview · {profile.label}</span>
        </span>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: BLUE }}>data-table · {density}</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${onPaper.line}` }}>
              {cols.map(([h, key]) => {
                const active = (key === 'total' && sort === 'total') || (key === 'order' && sort !== 'total');
                return (
                  <th key={h} style={{ textAlign: 'left', padding: '9px 16px', fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: active ? BLUE : onPaper.faint, fontWeight: 600 }}>
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
                <td style={{ padding: pad, fontFamily: MONO, color: onPaper.sub, transition: `padding .5s ${EASE}` }}>#{r[0]}</td>
                <td style={{ padding: pad, fontWeight: 600, transition: `padding .5s ${EASE}` }}>{r[1]}</td>
                <td style={{ padding: pad, fontVariantNumeric: 'tabular-nums', color: sort === 'total' ? BLUE : INK, transition: `padding .5s ${EASE}` }}>{money(r[2])}</td>
                <td style={{ padding: pad, transition: `padding .5s ${EASE}` }}>
                  <span className="flex items-center" style={{ gap: 6, fontSize: 12, color: onPaper.sub }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: STATUS_DOT[r[3]] }} />
                    {r[3]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    ['$ npx @epode/cambia tailwind --out cambia.theme.js', INK],
    ['  # DESIGN.md tokens → a Tailwind theme', onPaper.faint],
    ['$ npx @epode/cambia tailwind --check cambia.theme.js', INK],
    ['  # CI fails if they drift', onPaper.faint],
  ],
};

/* ── scrollytelling: a sticky 50/50 split. The sample on the right is a real
      @epode/cambia-runtime instance that transitions as you scroll the narrative. ── */
const SAMPLE_ROWS = [
  [1043, 'Aurora Labs', 2480, 'Paid'],
  [1044, 'Bjørk Studio', 960, 'Refunded'],
  [1045, 'Fjord Supply', 1205, 'Paid'],
  [1046, 'Kestrel Co', 540, 'Pending'],
];

function TableView({ density, sort }) {
  const pad = density === 'comfortable' ? '13px 16px' : '7px 16px';
  const money = (n) => `$${n.toLocaleString('en-US')}`;
  const sorted = [...SAMPLE_ROWS].sort((a, b) => (sort === 'total' ? b[2] - a[2] : b[0] - a[0]));
  const cols = [
    ['Order', 'order'],
    ['Customer', ''],
    ['Total', 'total'],
    ['Status', ''],
  ];
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${INK}` }}>
          {cols.map(([h, key]) => {
            const active = (key === 'total' && sort === 'total') || (key === 'order' && sort !== 'total');
            return (
              <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: active ? BLUE : onPaper.faint, fontWeight: 600 }}>
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
            <td style={{ padding: pad, fontFamily: MONO, color: onPaper.sub, transition: `padding .5s ${EASE}` }}>#{r[0]}</td>
            <td style={{ padding: pad, fontWeight: 600, transition: `padding .5s ${EASE}` }}>{r[1]}</td>
            <td style={{ padding: pad, fontVariantNumeric: 'tabular-nums', color: sort === 'total' ? BLUE : INK, transition: `padding .5s ${EASE}` }}>{money(r[2])}</td>
            <td style={{ padding: pad, transition: `padding .5s ${EASE}` }}>
              <span className="flex items-center" style={{ gap: 6, fontSize: 12.5, color: onPaper.sub }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: STATUS_DOT[r[3]] }} />
                {r[3]}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const STEPS = [
  { id: 'born', eyebrow: '01 · born-adapted', title: 'It ships already tuned to your app', body: 'Every component arrives matched to the app’s archetype — analytics opens dense and recency-sorted — before anyone has done a thing. (That’s the New user above.)', view: 'table' },
  { id: 'personalize', eyebrow: '02 · personalize', title: 'Then it learns each person', body: 'It adapts from the choices a user makes, through one observe() call. Switch who you’re viewing as in the bar above — this sample follows, live.', view: 'table' },
  { id: 'person', eyebrow: '03 · per person', title: 'A different interface for each', body: 'The same declared design renders differently for every user. The conserved grammar — rows are records, sort by header — never moves.', view: 'table' },
  { id: 'dash', eyebrow: '04 · a dashboard', title: 'It promotes what you actually watch', body: 'Same engine, a different role. The metric this person opens leads; the rest recede.', view: 'dashboard' },
  { id: 'nav', eyebrow: '05 · a navigation', title: 'It lifts where you actually go', body: 'The few destinations someone visits rise to the top; the rest file under ‘More’.', view: 'nav' },
  { id: 'feed', eyebrow: '06 · a feed', title: 'It loosens or tightens to how you scan', body: 'Comfortable cards or a dense list — the same feed, fit to the reader.', view: 'feed' },
  { id: 'device', eyebrow: '07 · on the device', title: 'Nothing leaves. forget() erases.', body: 'Per-user state lives in the browser — small per-trait tallies, no PII, no network. One call wipes it back to born-adapted.', view: 'table' },
];

const SAMPLE_META = {
  table: 'data-table · role: tabular-list',
  dashboard: 'dashboard · role: container',
  nav: 'navigation · role: nav',
  feed: 'feed · role: list',
  form: 'form · role: form-field',
};
const SAMPLE_COMP = { dashboard: ExDashboard, nav: ExNav, feed: ExFeed, form: ExForm };

function StickySample({ step, index, density, sort, profileLabel }) {
  const comf = density === 'comfortable';
  const Comp = SAMPLE_COMP[step.view];
  return (
    <div style={{ width: '100%', maxWidth: 470 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10, fontFamily: MONO, fontSize: 11, color: onPaper.faint, textTransform: 'uppercase', letterSpacing: '.06em' }}>
        <span>▦ live · @epode/cambia-runtime</span>
        <span style={{ color: BLUE, transition: `color .4s ${EASE}` }}>viewing as {profileLabel}</span>
      </div>
      <div style={{ border: `1px solid ${INK}`, background: WHITE, minHeight: 300 }}>
        <div className="flex items-center justify-between" style={{ borderBottom: `1px solid ${INK}`, padding: '10px 16px' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em' }}>{SAMPLE_META[step.view] || SAMPLE_META.table}</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: BLUE }}>
            {density}
            {step.view === 'table' ? ` · ${sort === 'total' ? 'by total' : 'recency'}` : ''}
          </span>
        </div>
        {/* keyed wrapper → fades + lifts on each view OR persona change */}
        <div key={`${index}-${density}-${sort}`} className="sample-fade" style={{ overflowX: 'auto' }}>
          {Comp ? (
            <div style={{ padding: 16 }}>
              <Comp g={comf} />
            </div>
          ) : (
            <TableView density={density} sort={sort} />
          )}
        </div>
      </div>
      <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 10.5, color: onPaper.faint, lineHeight: 1.6 }}>
        same declared design · current <span style={{ color: BLUE }}>{density}</span> · conserved grammar fixed
      </div>
    </div>
  );
}

function Scrolly({ profileLabel }) {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  /* the scrolly sample is bound to the ACTIVE persona engine — switching the
     toolbar above changes every step's sample, live. */
  const { values } = useCambia('tabular-list');
  const density = values.density || 'compact';
  const sort = values['default-sort'] === 'total' ? 'total' : '__recency__';
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll('[data-step]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number(e.target.getAttribute('data-step')));
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="scrolly">
      <div className="scrolly-steps">
        {STEPS.map((s, i) => (
          <div key={s.id} data-step={i} className="scrolly-step">
            <div style={{ opacity: active === i ? 1 : 0.32, transition: `opacity .4s ${EASE}` }}>
              <div style={{ fontFamily: MONO, fontSize: 11.5, color: BLUE, textTransform: 'uppercase', letterSpacing: '.14em' }}>{s.eyebrow}</div>
              <h2 className="feat-h" style={{ marginTop: 14, maxWidth: 440 }}>{s.title}</h2>
              <p style={{ fontSize: 15.5, color: onPaper.sub, lineHeight: 1.6, marginTop: 14, maxWidth: 420 }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="scrolly-sticky">
        <StickySample step={STEPS[active]} index={active} density={density} sort={sort} profileLabel={profileLabel} />
      </div>
    </div>
  );
}

function Site({ engine, uid, profile, pid, setPid }) {
  const [tab, setTab] = useState('DESIGN.md');
  const [copied, setCopied] = useState(false);
  /* one-time discovery hint on the persona bar */
  const [hint, setHint] = useState(false);
  const dismissHint = () => {
    if (!hint) return;
    setHint(false);
    try {
      localStorage.setItem('cambia-hint-seen', '1');
    } catch {}
  };
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem('cambia-hint-seen') === '1';
    } catch {}
    if (seen) return;
    const show = setTimeout(() => setHint(true), 1100);
    const hide = setTimeout(() => {
      setHint(false);
      try {
        localStorage.setItem('cambia-hint-seen', '1');
      } catch {}
    }, 8500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);
  /* dismiss the hint the first time the persona changes */
  // biome-ignore lint: intentional one-shot
  useEffect(() => {
    if (pid !== 'new') dismissHint();
  }, [pid]);
  /* the WHOLE page reads the live trait — spacing, examples, bloom all follow the active profile */
  const { values, observe } = useCambia('tabular-list');
  const density = values.density || 'compact';
  const sort = values['default-sort'] === 'total' ? 'total' : '__recency__';
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
    navigator.clipboard?.writeText('npx @epode/cambia init').then(
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
    ['core', '@epode/cambia-core', 'parse · scaffold · validate'],
    ['runtime', '@epode/cambia-runtime', 'the live, on-device engine'],
    ['react', '@epode/cambia-react', 'the useCambia() hook'],
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
        @keyframes sampleFade{ from{ opacity:0; transform:translateY(8px) } to{ opacity:1; transform:translateY(0) } }
        .sample-fade{ animation:sampleFade .5s ${EASE} both; }
        .persona-bar{ position:sticky; top:0; z-index:50; background:${BLUE_SOFT}; border-top:1px solid ${INK}; border-bottom:1px solid ${INK}; }
        @keyframes hintGlow{ 0%,100%{ box-shadow:0 0 0 0 rgba(26,54,255,0) } 50%{ box-shadow:0 0 0 3px rgba(26,54,255,0.28) } }
        .persona-hint-glow{ animation:hintGlow 1.6s ${EASE} 3; }
        @keyframes hintFloat{ 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-3px) } }
        .persona-hint{ animation:hintFloat 1.8s ${EASE} infinite; }
        .persona-row{ overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
        .persona-row::-webkit-scrollbar{ display:none; }
        .persona-traits{ display:none; }
        @media (min-width:760px){ .persona-traits{ display:flex; } .persona-row{ overflow-x:visible; } }
        @media (prefers-reduced-motion: reduce){ *{ animation:none!important; transition:none!important; } .bloom-cell{ opacity:1!important; } }
        .h-hero{ font-family:${SERIF}; font-weight:600; font-size:clamp(44px,6.4vw,90px); line-height:0.99; letter-spacing:-.02em; margin:0; text-wrap:balance; }
        .sec-h{ font-family:${SERIF}; font-weight:600; font-size:clamp(30px,4.4vw,54px); line-height:1.0; letter-spacing:-.015em; margin:0; text-wrap:balance; }
        .feat-h{ font-family:${SERIF}; font-weight:600; font-size:clamp(22px,2.6vw,31px); line-height:1.06; letter-spacing:-.01em; margin:0; text-wrap:balance; }
        .hero-grid{ display:grid; grid-template-columns:1fr; gap:36px; align-items:center; }
        .scrolly{ display:flex; flex-direction:column; }
        .scrolly-sticky{ order:-1; position:sticky; top:46px; z-index:2; background:${WHITE}; padding:14px 0 14px; border-bottom:1px solid ${onPaper.line}; }
        .scrolly-step{ min-height:46vh; display:flex; align-items:center; padding:22px 0; border-top:1px solid ${onPaper.line}; }
        .triptych{ display:grid; grid-template-columns:1fr; gap:34px; }
        .figs{ display:grid; grid-template-columns:1fr; gap:16px; }
        .pkgs{ display:grid; grid-template-columns:1fr; gap:1px; }
        .demo-grid{ display:grid; grid-template-columns:1fr; gap:30px; align-items:center; }
        @media (min-width:900px){
          .hero-grid{ grid-template-columns:1.08fr 0.92fr; gap:44px; }
          .scrolly{ display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:start; }
          .scrolly-sticky{ order:0; position:sticky; top:48px; height:calc(100vh - 48px); display:flex; align-items:center; background:transparent; padding:0; border-bottom:none; z-index:auto; }
          .scrolly-step{ min-height:78vh; border-top:none; padding:0; }
          .scrolly-step:first-child{ min-height:62vh; align-items:flex-start; padding-top:8px; }
          .triptych{ grid-template-columns:1fr 1fr 1fr; gap:28px; }
          .figs{ grid-template-columns:1fr 1fr; }
          .pkgs{ grid-template-columns:1fr 1fr; }
          .demo-grid{ grid-template-columns:0.92fr 1.08fr; gap:40px; }
        }
      `}</style>

      {/* nav */}
      <div style={wrap}>
        <div className="flex items-center justify-between" style={{ padding: '18px 0 14px', fontSize: 13, flexWrap: 'wrap', gap: 10 }}>
          <div className="flex items-center" style={{ gap: 9 }}>
            <span style={{ width: 9, height: 9, background: BLUE, display: 'inline-block' }} />
            <span style={{ fontFamily: MONO, fontWeight: 700, letterSpacing: '.04em' }}>cambia</span>
          </div>
          <div className="flex items-center" style={{ gap: 16, fontFamily: MONO, fontSize: 12, color: onPaper.sub }}>
            <a href="https://github.com/epode-studio/cambia/blob/main/SPEC.md">spec</a>
            <a href="https://github.com/epode-studio/cambia/tree/main/docs-site">docs</a>
            <a href="https://github.com/epode-studio/cambia">github</a>
          </div>
        </div>
      </div>

      {/* universal sticky persona bar — switches the whole site's active user */}
      <div className="persona-bar">
        <div style={wrap}>
          <div className="persona-row flex items-center" style={{ padding: '10px 0', gap: 14, flexWrap: 'nowrap' }}>
            <span className="flex items-center" style={{ gap: 8, flexShrink: 0 }}>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: onPaper.faint, textTransform: 'uppercase', letterSpacing: '.1em', whiteSpace: 'nowrap' }}>Viewing as</span>
              <span className={hint ? 'persona-hint-glow' : ''} style={{ position: 'relative', display: 'inline-flex' }}>
                <Segmented options={PROFILES.map((p) => ({ value: p.id, label: p.label }))} value={pid} onChange={setPid} />
                {hint ? (
                  <span
                    className="persona-hint"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      whiteSpace: 'nowrap',
                      fontFamily: MONO,
                      fontSize: 11,
                      color: WHITE,
                      background: BLUE,
                      padding: '5px 9px',
                      letterSpacing: '.02em',
                      zIndex: 60,
                    }}
                  >
                    ↑ switch users — the whole site adapts
                  </span>
                ) : null}
              </span>
            </span>
            <span className="persona-traits flex items-center" style={{ gap: 14, marginLeft: 'auto', flexWrap: 'wrap' }}>
              <span className="flex items-center" style={{ gap: 7 }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: onPaper.faint, textTransform: 'uppercase', letterSpacing: '.06em' }}>density</span>
                <Segmented
                  options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfortable' }]}
                  value={density}
                  onChange={(v) => observe({ trait: 'density', value: v })}
                />
              </span>
              <span className="flex items-center" style={{ gap: 7 }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: onPaper.faint, textTransform: 'uppercase', letterSpacing: '.06em' }}>sort</span>
                <Segmented
                  options={[{ value: '__recency__', label: 'Recency' }, { value: 'total', label: 'Total' }]}
                  value={sort === 'total' ? 'total' : '__recency__'}
                  onChange={(v) => observe({ trait: 'default-sort', value: v })}
                />
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* hero */}
      <div style={{ ...wrap, paddingTop: 48, paddingBottom: 4 }}>
        <Reveal>
          <Eyebrow color={BLUE}>Open source · MIT · a DESIGN.md extension</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="h-hero" style={{ marginTop: 18, maxWidth: 900 }}>
            Interfaces that adapt to each user, on-device.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="serif" style={{ fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(19px,2.2vw,27px)', color: INK, lineHeight: 1.34, margin: '22px 0 0', maxWidth: 560 }}>
            The interface learns the person — privately, on their device.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="flex items-center" style={{ gap: 18, marginTop: 30, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={copy}
              style={{ fontFamily: MONO, fontSize: 13.5, background: BLUE, color: WHITE, fontWeight: 600, padding: '13px 18px', border: `1px solid ${BLUE}`, cursor: 'pointer' }}
            >
              {copied ? 'copied ✓' : 'npx @epode/cambia init  ⧉'}
            </button>
            <a href="#try" style={{ fontFamily: MONO, fontSize: 13, color: INK, fontWeight: 600 }}>
              try it yourself ↓
            </a>
          </div>
        </Reveal>
      </div>

      {/* scrolly — sticky 50/50: the sample adapts as you scroll the narrative */}
      <div style={{ ...wrap, paddingTop: 24 }}>
        <Scrolly profileLabel={profile.label} />
      </div>

      {/* now you try — the whole page IS the demo; this is the preview output */}
      <div id="try" style={{ ...wrap, ...sx(64, 0) }}>
        <Reveal>
          <div className="flex items-center justify-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <Eyebrow color={BLUE}>§ the whole site runs on cambia</Eyebrow>
              <h2 className="sec-h" style={{ marginTop: 12, maxWidth: 620 }}>
                You’re already in the demo
              </h2>
            </div>
            <p style={{ fontSize: 13.5, color: onPaper.sub, maxWidth: 360, lineHeight: 1.55, alignSelf: 'flex-end' }}>
              The bar up top sets who’s using this site — its spacing, this preview, everything follows. Try{' '}
              <span style={{ fontFamily: MONO, color: INK }}>You</span>: your choices save in this browser and persist on reload.
            </p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div style={{ maxWidth: 640 }}>
            <PreviewTable density={density} sort={sort} profile={profile} />
            <div className="flex items-center justify-between" style={{ marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontFamily: MONO, fontSize: 11.5, color: onPaper.faint, lineHeight: 1.6 }}>
                {profile.persistent ? 'saved in your browser' : 'in-memory'} · conserved grammar fixed · adapts only what you declared
              </span>
              <button
                type="button"
                onClick={() => engine.forget()}
                style={{ fontFamily: MONO, fontSize: 11.5, padding: '7px 13px', cursor: 'pointer', border: `1px solid ${onPaper.line}`, background: WHITE, color: onPaper.sub, textTransform: 'uppercase', letterSpacing: '.04em' }}
              >
                ↺ forget {profile.label}
              </button>
            </div>
          </div>
        </Reveal>
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
            <span style={{ fontFamily: MONO, fontSize: 13.5 }}>npx @epode/cambia init</span>
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


      {/* privacy — white */}
      <div style={{ ...wrap, ...sx(60, 56) }}>
        <Reveal>
          <Eyebrow color={BLUE}>§ on the device</Eyebrow>
          <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 720 }}>
            Personalization that stays local
          </h2>
          <p style={{ fontSize: 15, color: onPaper.sub, margin: '16px 0 30px', maxWidth: 640 }}>
            GDPR-friendly by construction: the data barely exists, and it never leaves the device. It listens only to the
            choices you pass <span style={{ fontFamily: MONO, color: INK }}>observe()</span> — no mouse, scroll, dwell, or
            keystroke tracking.
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
            <Eyebrow color={onBlue.faint}>§ four small packages</Eyebrow>
            <h2 className="sec-h" style={{ marginTop: 14, marginBottom: 26, maxWidth: 720 }}>
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
              {copied ? 'copied ✓' : 'npx @epode/cambia init  ⧉'}
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
