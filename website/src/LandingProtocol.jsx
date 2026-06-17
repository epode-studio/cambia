import { useEffect, useRef, useState } from 'react';

/* ── cold, bold, black & white. Fraunces display serif (legible), mono labels,
      inverted ink sections, high contrast. Monochrome — no accent hue. ── */
const PAPER = '#F4F4F5';
const INK = '#0B0B0C';
const GREY = '#9A9B9E';
const RAYS_P = '#D2D3D5'; /* light grey rays on paper (avoids moiré) */
const RAYS_I = 'rgba(244,244,245,0.28)';
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";
const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

const onInk = { sub: 'rgba(244,244,245,0.72)', faint: 'rgba(244,244,245,0.46)', line: 'rgba(244,244,245,0.22)' };
const onPaper = { sub: 'rgba(11,11,12,0.72)', faint: 'rgba(11,11,12,0.46)', line: 'rgba(11,11,12,0.14)' };

/* scroll-reveal: opacity + translateY + slight blur, once, respects reduced motion */
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

/* radiant engraving motif — static, low-density to stay crisp */
function Rays({ size = 440, stroke = RAYS_P, n = 76, opacity = 1 }) {
  const c = size / 2;
  const lines = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const inner = 54 + (i % 4) * 8;
    const outer = c - 6 - (i % 5) * 16;
    lines.push(
      <line
        key={i}
        x1={c + Math.cos(a) * inner}
        y1={c + Math.sin(a) * inner}
        x2={c + Math.cos(a) * outer}
        y2={c + Math.sin(a) * outer}
        stroke={stroke}
        strokeWidth={i % 6 === 0 ? 1.2 : 0.8}
      />
    );
  }
  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', opacity }} aria-hidden="true">
      <title>radiant motif</title>
      {lines}
      {[42, 48, 142].map((r) => (
        <circle key={r} cx={c} cy={c} r={r} fill="none" stroke={stroke} strokeWidth={0.8} opacity={0.85} />
      ))}
      <circle cx={c} cy={c} r={30} fill="none" stroke={stroke} strokeWidth={1.2} />
    </svg>
  );
}

/* ── interface cards: ALL state changes are opacity/transform only — never height ── */
const X = {
  ink: INK,
  gray: '#5C5D60',
  faint: '#9A9B9E',
  line: '#DCDCDE',
  accent: INK,
  accentSoft: '#E6E6E8',
  paper: '#ECECEE',
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
            <div style={{ fontFamily: MONO, fontSize: 9, color: X.faint, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              {k}
            </div>
            <div
              style={{
                fontWeight: hero ? 800 : 700,
                fontSize: 18,
                color: X.ink,
                lineHeight: 1.15,
                fontVariantNumeric: 'tabular-nums',
                transition: `font-weight .7s ${EASE}`,
              }}
            >
              {v}
            </div>
            {i === 0 && (
              <svg
                width="80%"
                height="14"
                viewBox="0 0 60 16"
                preserveAspectRatio="none"
                style={{ position: 'absolute', left: 10, bottom: 9, opacity: hero ? 1 : 0, transition: `opacity .7s ${EASE}` }}
              >
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
      {/* fixed-height slot: advanced fields cross-fade with the collapsed pill — no height anim */}
      <div style={{ position: 'relative', height: 174 }}>
        <div style={{ position: 'absolute', inset: 0, opacity: g ? 0 : 1, transform: g ? 'translateY(-6px)' : 'translateY(0)', transition: T }}>
          {adv.map((f) => (
            <Field key={f} f={f} />
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: g ? 1 : 0,
            transform: g ? 'translateY(0)' : 'translateY(6px)',
            transition: T,
            fontSize: 11.5,
            color: X.accent,
            fontWeight: 700,
          }}
        >
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
              <div
                style={{
                  height: 18,
                  fontFamily: MONO,
                  fontSize: 8.5,
                  color: X.faint,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  padding: '5px 8px 0',
                  opacity: g ? 1 : 0,
                  transition: `opacity .55s ${EASE}`,
                }}
              >
                More
              </div>
            )}
            <div
              className="flex items-center"
              style={{
                gap: 8,
                padding: '6px 8px',
                borderRadius: 6,
                background: promoted ? X.accentSoft : 'transparent',
                opacity: dim ? 0.4 : 1,
                transition: T,
              }}
            >
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
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 99,
              background: X.accentSoft,
              color: X.accent,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: 11,
              flexShrink: 0,
              transform: g ? 'scale(1.3)' : 'scale(1)',
              transformOrigin: 'left center',
              transition: T,
            }}
          >
            {a[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: X.ink }}>{a}</div>
            <div style={{ fontSize: 11.5, color: X.gray, opacity: g ? 1 : 0, transform: g ? 'translateY(0)' : 'translateY(-3px)', transition: T }}>
              {b}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ n, label, caption, children }) {
  return (
    <div style={{ background: '#FBFBFC', borderRadius: 4, padding: 16, color: INK }}>
      <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: INK }}>{n}</span>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: '#9A9B9E', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</span>
      </div>
      <div style={{ minHeight: 196 }}>{children}</div>
      <div style={{ fontSize: 12.5, color: '#5C5D60', marginTop: 14, lineHeight: 1.5 }}>{caption}</div>
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

  useEffect(() => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href =
      'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
    const iv = setInterval(() => setG((x) => !x), 3400);
    return () => {
      document.head.removeChild(l);
      clearInterval(iv);
    };
  }, []);

  const signals = [
    ['density', 'user toggles comfortable / compact'],
    ['default-sort', 'user clicks a column header'],
    ['promoted-action', 'user invokes a row action'],
    ['…any custom trait', 'whatever you pass to observe()'],
  ];
  const steps = [
    ['#1 born-adapted', 'Tuned from the first render', 'Every component arrives matched to the app’s archetype before anyone touches it — analytics opens dense and recency-sorted; CRUD opens comfortable.'],
    ['#2 observes', 'Only the choices you hand it', 'You forward the choices a user already makes — a density toggle, a sort, an action — through one observe() call. No tracking, no setup.'],
    ['#3 personalizes', 'Safely, on the device', 'After a clear, repeated pattern, the adaptive trait shifts for that user alone. Conserved traits never move — they aren’t even in the engine.'],
  ];
  const packages = [
    ['cambia', 'the CLI', 'init · check · tailwind · skill'],
    ['core', '@cambia/core', 'parse · scaffold · validate'],
    ['runtime', '@cambia/runtime', 'the live, on-device engine'],
    ['react', '@cambia/react', 'the useCambia() hook'],
  ];

  const wrap = { maxWidth: 1080, margin: '0 auto', padding: '0 28px' };
  const dotted = { textDecoration: 'underline', textDecorationStyle: 'dotted', textDecorationColor: GREY, textUnderlineOffset: 6 };

  return (
    <div style={{ background: PAPER, minHeight: '100%', fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      <style>{`
        *{ -webkit-font-smoothing:antialiased; box-sizing:border-box; }
        html,body,#root{ background:${PAPER}; }
        a{ color:inherit; text-decoration:none; }
        p{ text-wrap:pretty; }
        @media (prefers-reduced-motion: reduce){ *{ animation:none!important; transition:none!important; } }
        .serif{ font-family:'Fraunces', Georgia, 'Times New Roman', serif; }
        .wordmark{ font-family:'Fraunces', Georgia, serif; font-weight:900; font-size:clamp(76px,18vw,224px); line-height:0.84; letter-spacing:-.025em; text-transform:uppercase; margin:0; }
        .sec-h{ font-family:'Fraunces', Georgia, serif; font-weight:700; font-size:clamp(34px,5vw,62px); line-height:0.98; letter-spacing:-.015em; text-transform:uppercase; margin:0; text-wrap:balance; }
        .feat-h{ font-family:'Fraunces', Georgia, serif; font-weight:700; font-size:clamp(25px,3vw,36px); line-height:1.04; margin:0; text-wrap:balance; }
        .toprow{ display:none; }
        .install-grid{ display:grid; grid-template-columns:1fr; gap:34px; align-items:center; }
        .triptych{ display:grid; grid-template-columns:1fr; gap:34px; }
        .figs{ display:grid; grid-template-columns:1fr; gap:16px; }
        .pkgs{ display:grid; grid-template-columns:1fr; gap:1px; }
        @media (min-width:760px){ .toprow{ display:flex; } }
        @media (min-width:900px){
          .install-grid{ grid-template-columns:1.15fr 0.85fr; gap:48px; }
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
            <span style={{ color: onPaper.faint, letterSpacing: '.05em' }}>{'/\\-_=+|<  ~:*-/'}</span>
            <a href="https://github.com/epode-studio/cambia/blob/main/SPEC.md">spec</a>
            <a href="https://github.com/epode-studio/cambia">github</a>
          </div>
        </div>
      </div>

      {/* hero */}
      <div style={{ ...wrap, paddingTop: 30 }}>
        <div className="toprow items-center justify-between" style={{ fontFamily: MONO, fontSize: 10.5, color: onPaper.faint, textTransform: 'uppercase', letterSpacing: '.12em', paddingBottom: 8 }}>
          <span>role-aware</span>
          <span>conserved / adaptive</span>
          <span>born-adapted runtime</span>
        </div>
        <div style={{ borderTop: `1px solid ${onPaper.line}`, paddingTop: 26 }}>
          <Reveal>
            <Eyebrow color={INK}>Open source · MIT · a DESIGN.md extension</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="wordmark" style={{ marginTop: 12 }}>
              Cambia
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="serif" style={{ fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(20px,2.6vw,30px)', lineHeight: 1.3, margin: '20px 0 0', maxWidth: 660, color: INK }}>
              An interface that <span style={dotted}>changes</span> as the people who use it do — a living growth layer on
              top of your design system.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <p style={{ fontFamily: MONO, fontSize: 12, color: onPaper.faint, margin: '14px 0 0' }}>
              /ˈkam.bja/ — Latin <span style={{ color: INK, fontWeight: 600 }}>cambium</span>, a tree’s living growth
              layer · “it changes”
            </p>
          </Reveal>
        </div>

        {/* install */}
        <div className="install-grid" style={{ marginTop: 44 }}>
          <Reveal>
            <Eyebrow color={onPaper.faint}>Install via npx</Eyebrow>
            <div
              className="flex items-center justify-between"
              style={{ marginTop: 12, border: `1px solid ${INK}`, padding: '13px 16px', gap: 12, maxWidth: 460 }}
            >
              <span style={{ fontFamily: MONO, fontSize: 13.5 }}>npx cambia init</span>
              <span style={{ fontFamily: MONO, fontSize: 13, color: onPaper.faint }}>⧉</span>
            </div>
            <div className="flex items-center" style={{ gap: 4, marginTop: 14, flexWrap: 'wrap' }}>
              {Object.keys(TAB_CODE).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  style={{
                    cursor: 'pointer',
                    border: `1px solid ${tab === t ? INK : onPaper.line}`,
                    background: tab === t ? INK : 'transparent',
                    color: tab === t ? PAPER : onPaper.sub,
                    padding: '5px 12px',
                    fontFamily: MONO,
                    fontSize: 11.5,
                    transition: `all .25s ${EASE}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div
              style={{ marginTop: 10, border: `1px solid ${onPaper.line}`, background: '#FBFBFC', padding: '14px 16px', fontFamily: MONO, fontSize: 12, lineHeight: 1.85, whiteSpace: 'pre', overflowX: 'auto' }}
            >
              {TAB_CODE[tab].map(([text, color]) => (
                <div key={text} style={{ color }}>
                  {text}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: onPaper.sub, marginTop: 14, maxWidth: 460, lineHeight: 1.55 }}>
              One block on the design system you already have. <span style={{ color: INK }}>cambia init</span> is
              non-destructive; your agent reads the file and your components carry it.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <Rays size={420} stroke={RAYS_P} />
          </Reveal>
        </div>
      </div>

      {/* how it works — inverted ink */}
      <div style={{ background: INK, color: PAPER, marginTop: 64 }}>
        <div style={{ ...wrap, paddingTop: 58, paddingBottom: 60 }}>
          <Reveal>
            <div className="flex items-center justify-between" style={{ marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
              <h2 className="sec-h" style={{ maxWidth: 620 }}>
                Born adapted. Then it learns.
              </h2>
              <span style={{ fontFamily: MONO, fontSize: 11, color: PAPER, border: `1px solid ${onInk.line}`, padding: '5px 10px', letterSpacing: '.08em' }}>
                LIVE ENGINE
              </span>
            </div>
          </Reveal>
          <div className="triptych">
            {steps.map(([tag, h, d], i) => (
              <Reveal key={tag} delay={i * 100}>
                <div style={{ borderTop: `1px solid ${onInk.line}`, paddingTop: 18 }}>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, color: PAPER, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>
                    {tag}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Rays size={260} stroke={RAYS_I} n={64} />
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
          <Eyebrow color={INK}>§ what it listens for</Eyebrow>
          <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 640 }}>
            Only the choices you hand it
          </h2>
          <p style={{ fontSize: 15, color: onPaper.sub, margin: '16px 0 28px', maxWidth: 540 }}>
            Each adaptive trait maps to one explicit signal. The engine has no global listeners.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ border: `1px solid ${INK}`, maxWidth: 720 }}>
            {signals.map(([trait, sig], i) => (
              <div
                key={trait}
                className="flex items-center justify-between"
                style={{ padding: '14px 18px', borderBottom: i < signals.length - 1 ? `1px solid ${onPaper.line}` : 'none', gap: 12 }}
              >
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

      {/* across every interface — ink, white cards */}
      <div style={{ background: INK, color: PAPER }}>
        <div style={{ ...wrap, paddingTop: 58, paddingBottom: 58 }}>
          <Reveal>
            <Eyebrow color={onInk.faint}>§ across every interface</Eyebrow>
            <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 640 }}>
              The same engine, any interface
            </h2>
            <p style={{ fontSize: 15.5, color: onInk.sub, margin: '16px 0 28px', maxWidth: 540 }}>
              Not just tables. A dashboard, a form, a navigation, a feed — each quietly finding its shape for the person
              in front of it. Watch them breathe.
            </p>
          </Reveal>
          <div className="figs">
            {[
              ['01', 'dashboard', 'Surfaces the one metric this person actually watches; the rest recede.', <ExDashboard key="d" g={g} />],
              ['02', 'form', 'Shortens to the essentials for people who never touch the advanced fields.', <ExForm key="f" g={g} />],
              ['03', 'navigation', 'Lifts the few destinations someone uses; files the rest under ‘More’.', <ExNav key="n" g={g} />],
              ['04', 'feed', 'Loosens into readable cards, or tightens into a dense list, to match how they scan.', <ExFeed key="e" g={g} />],
            ].map(([n, label, cap, node], i) => (
              <Reveal key={n} delay={(i % 2) * 100}>
                <Card n={n} label={label} caption={cap}>
                  {node}
                </Card>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, fontFamily: MONO, fontSize: 11, color: onInk.faint }}>
            ── default ⇄ grown · looping ──
          </div>
        </div>
      </div>

      {/* privacy — paper */}
      <div style={{ ...wrap, paddingTop: 60, paddingBottom: 56 }}>
        <Reveal>
          <Eyebrow color={INK}>§ yours, on your device</Eyebrow>
          <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 720 }}>
            Personalization that never phones home
          </h2>
          <p className="serif" style={{ fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(18px,2.2vw,24px)', color: INK, margin: '16px 0 30px', maxWidth: 600, lineHeight: 1.35 }}>
            GDPR-friendly by construction — because the data barely exists, and never <span style={dotted}>leaves</span>.
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
            <div
              style={{ marginTop: 22, border: `1px solid ${onInk.line}`, padding: '16px 18px', fontFamily: MONO, fontSize: 12.5, lineHeight: 1.9, maxWidth: 720, whiteSpace: 'pre', overflowX: 'auto' }}
            >
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
              Colors, spacing, radius and type flow from DESIGN.md into Tailwind — generated, not hand-mirrored, and
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
          <div style={{ fontFamily: MONO, fontSize: 11, color: onPaper.faint, marginBottom: 22, letterSpacing: '.1em' }}>
            {'/\\-_=+|<  ~:*-/  =_-+|>'}
          </div>
          <h2 className="sec-h" style={{ maxWidth: 760 }}>
            Stop shipping interfaces that never grow up
          </h2>
          <div className="flex items-center" style={{ gap: 18, flexWrap: 'wrap', marginTop: 28 }}>
            <span style={{ fontFamily: MONO, fontSize: 13.5, background: INK, color: PAPER, fontWeight: 600, padding: '12px 18px' }}>
              npx cambia init
            </span>
            <a href="https://github.com/epode-studio/cambia/blob/main/SPEC.md" style={{ fontFamily: MONO, fontSize: 13, color: INK, fontWeight: 600 }}>
              read the spec →
            </a>
          </div>
        </Reveal>
      </div>

      {/* footer */}
      <div style={wrap}>
        <div
          className="flex items-center justify-between"
          style={{ padding: '24px 0 40px', marginTop: 36, borderTop: `1px solid ${onPaper.line}`, fontFamily: MONO, fontSize: 11.5, color: onPaper.faint, flexWrap: 'wrap', gap: 10 }}
        >
          <span>
            <span style={{ color: INK }}>●</span> cambia · a living layer on DESIGN.md
          </span>
          <span>built on DESIGN.md · MIT · 2026</span>
        </div>
      </div>
    </div>
  );
}
