import { useEffect, useState } from 'react';

/* ── dark, terminal-leaning palette (Hermes-inspired) ── */
const C = {
  bg: '#0A0B0D',
  surface: '#121317',
  surface2: '#16181D',
  ink: '#ECEDEF',
  gray: '#9AA0A8',
  faint: '#5C626B',
  line: '#23262C',
  accent: '#5EE6D3',
  accentDim: '#3FBFAE',
  accentSoft: 'rgba(94,230,211,0.10)',
  accentLine: 'rgba(94,230,211,0.28)',
};
const SANS = "'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

/* ───────── example 1 · dashboard ───────── */
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
              border: `1px solid ${hero ? C.accentLine : C.line}`,
              borderRadius: 8,
              padding: '9px 10px',
              background: hero ? C.accentSoft : C.surface2,
              opacity: dim ? 0.32 : 1,
              transition: 'all .6s ease',
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.faint, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              {k}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: hero ? 24 : 14,
                color: hero ? C.accent : C.ink,
                transition: 'all .6s ease',
                lineHeight: 1.1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {v}
            </div>
            {hero && (
              <svg width="100%" height="16" viewBox="0 0 60 16" preserveAspectRatio="none" style={{ marginTop: 4 }}>
                <polyline points="0,14 12,10 24,12 36,6 48,7 60,2" fill="none" stroke={C.accent} strokeWidth="1.3" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ───────── example 2 · form ───────── */
function ExForm({ g }) {
  const fields = ['Store name', 'What you sell', 'Currency', 'Tax region', 'Webhook URL', 'Rate limit'];
  return (
    <div>
      {fields.map((f, i) => {
        const hide = g && i >= 3;
        return (
          <div
            key={f}
            style={{
              overflow: 'hidden',
              maxHeight: hide ? 0 : 52,
              opacity: hide ? 0 : 1,
              marginBottom: hide ? 0 : 9,
              transition: 'all .55s ease',
            }}
          >
            <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: C.ink }}>{f}</div>
            <div style={{ height: 28, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 7 }} />
          </div>
        );
      })}
      <div
        style={{
          maxHeight: g ? 30 : 0,
          opacity: g ? 1 : 0,
          overflow: 'hidden',
          transition: 'all .55s ease',
          fontSize: 11.5,
          color: C.accent,
          fontWeight: 600,
        }}
      >
        + Advanced (3) — optional
      </div>
    </div>
  );
}

/* ───────── example 3 · navigation ───────── */
function ExNav({ g }) {
  const items = ['Overview', 'Orders', 'Refunds', 'Inventory', 'Customers', 'Reports', 'Integrations', 'Settings'];
  const hot = [1, 2, 0];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((it, i) => {
        const promoted = g && hot.includes(i);
        const dim = g && !hot.includes(i);
        return (
          <div key={it}>
            {g && i === 3 && (
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 8.5,
                  color: C.faint,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  padding: '7px 8px 3px',
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
                background: promoted ? C.accentSoft : 'transparent',
                opacity: dim ? 0.32 : 1,
                transition: 'all .55s ease',
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 99,
                  background: promoted ? C.accent : C.line,
                  transition: 'all .55s ease',
                }}
              />
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: promoted ? 700 : 400,
                  color: promoted ? C.accent : C.ink,
                  transition: 'all .55s ease',
                }}
              >
                {it}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────── example 4 · feed ───────── */
function ExFeed({ g }) {
  const rows = [
    ['Aurora Labs', 'shipped 240 units'],
    ['Bjørk Studio', 'refund requested'],
    ['Fjord Supply', 'paid invoice #1031'],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {rows.map(([a, b], i) => (
        <div
          key={a}
          className="flex items-center"
          style={{
            gap: 10,
            padding: g ? '13px 4px' : '7px 4px',
            borderBottom: i < 2 ? `1px solid ${C.line}` : 'none',
            transition: 'all .6s ease',
          }}
        >
          <div
            style={{
              width: g ? 30 : 20,
              height: g ? 30 : 20,
              borderRadius: 99,
              background: C.accentSoft,
              color: C.accent,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: g ? 12 : 10,
              flexShrink: 0,
              transition: 'all .6s ease',
            }}
          >
            {a[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: g ? 13 : 12, fontWeight: 600, transition: 'all .6s ease' }}>{a}</div>
            <div
              style={{
                maxHeight: g ? 16 : 0,
                opacity: g ? 1 : 0,
                overflow: 'hidden',
                fontSize: 11.5,
                color: C.gray,
                transition: 'all .6s ease',
              }}
            >
              {b}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Figure({ n, label, caption, children }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
      <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.accent }}>{n}</span>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.faint, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {label}
        </span>
      </div>
      <div style={{ minHeight: 188 }}>{children}</div>
      <div style={{ fontSize: 12.5, color: C.gray, marginTop: 14, lineHeight: 1.5 }}>{caption}</div>
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, textTransform: 'uppercase', letterSpacing: '.14em' }}>
      {children}
    </div>
  );
}

/* a dark terminal / code card */
function Code({ title, right, lines }) {
  return (
    <div style={{ background: '#0E0F12', border: `1px solid ${C.line}`, borderRadius: 10, overflow: 'hidden' }}>
      <div
        className="flex items-center justify-between"
        style={{ padding: '9px 14px', borderBottom: `1px solid ${C.line}` }}
      >
        <div className="flex items-center" style={{ gap: 7 }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: '#2A2D33' }} />
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.faint }}>{title}</span>
        </div>
        {right && <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.faint }}>{right}</span>}
      </div>
      <div
        style={{
          margin: 0,
          padding: '14px 16px',
          fontFamily: MONO,
          fontSize: 12.5,
          lineHeight: 1.75,
          color: C.ink,
          overflowX: 'auto',
          whiteSpace: 'pre',
        }}
      >
        {lines}
      </div>
    </div>
  );
}

const TABS = {
  'DESIGN.md': (
    <>
      <div style={{ color: C.gray }}>
        cambia:<span style={{ color: C.faint }}> {'  # one block in the DESIGN.md you already have'}</span>
      </div>
      <div>{'  roles:'}</div>
      <div>{'    tabular-list:'}</div>
      <div>
        <span style={{ color: C.gray }}>{'      conserved:'}</span>
        {' [rows-are-records, sort-by-header]  '}
        <span style={{ color: C.faint }}>{'# never moves'}</span>
      </div>
      <div>
        <span style={{ color: C.accent }}>{'      adaptive:'}</span>
        {'  [density, default-sort]            '}
        <span style={{ color: C.faint }}>{'# may personalize'}</span>
      </div>
    </>
  ),
  React: (
    <>
      <div>
        <span style={{ color: C.accent }}>const</span> cambia = createCambia({'{'} designMd, userId {'}'})
      </div>
      <div style={{ height: 6 }} />
      <div>
        <span style={{ color: C.accent }}>const</span> {'{'} values, observe {'}'} = useCambia(
        <span style={{ color: C.accentDim }}>'tabular-list'</span>)
      </div>
      <div style={{ color: C.faint }}>{'// values.density → born-adapted, then personalized'}</div>
      <div style={{ height: 6 }} />
      <div>
        observe({'{'} trait: <span style={{ color: C.accentDim }}>'density'</span>, value:{' '}
        <span style={{ color: C.accentDim }}>'comfortable'</span> {'}'})
      </div>
    </>
  ),
  Tailwind: (
    <>
      <div>
        <span style={{ color: C.faint }}>$ </span>npx cambia tailwind --out cambia.theme.js
      </div>
      <div style={{ color: C.faint }}>{'  # DESIGN.md tokens → a Tailwind theme'}</div>
      <div style={{ height: 6 }} />
      <div>
        <span style={{ color: C.faint }}>$ </span>npx cambia tailwind --check cambia.theme.js
      </div>
      <div style={{ color: C.faint }}>{'  # CI: fail if the tokens drifted'}</div>
    </>
  ),
};

export default function App() {
  const [g, setG] = useState(false);
  const [tab, setTab] = useState('DESIGN.md');

  useEffect(() => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
    const iv = setInterval(() => setG((x) => !x), 3400);
    return () => {
      document.head.removeChild(l);
      clearInterval(iv);
    };
  }, []);

  const signals = [
    ['density', "user toggles comfortable / compact"],
    ['default-sort', 'user clicks a column header'],
    ['promoted-action', 'user invokes a row action'],
    ['…any custom trait', 'whatever you pass to observe()'],
  ];
  const packages = [
    ['cambia', 'the CLI', 'init · check · tailwind · skill'],
    ['@cambia/core', 'the library', 'parse · scaffold · validate'],
    ['@cambia/runtime', 'the live engine', 'born-adapted · on-device'],
    ['@cambia/react', 'the binding', 'useCambia() hook'],
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100%', fontFamily: SANS, color: C.ink }}>
      <style>{`
        *{ -webkit-font-smoothing:antialiased; box-sizing:border-box; }
        html,body,#root{ background:${C.bg}; }
        a{ color:inherit; text-decoration:none; }
        @media (prefers-reduced-motion: reduce){ *{ transition:none!important; } }
        .figs{ display:grid; grid-template-columns:1fr; gap:14px; }
        .pkgs{ display:grid; grid-template-columns:1fr; gap:10px; }
        @media (min-width:680px){ .figs{ grid-template-columns:1fr 1fr; } .pkgs{ grid-template-columns:1fr 1fr; } }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '22px 24px 64px' }}>
        {/* top bar */}
        <div className="flex items-center justify-between" style={{ marginBottom: 60, fontSize: 13 }}>
          <div className="flex items-center" style={{ gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, display: 'inline-block' }} />
            <span style={{ fontFamily: MONO, fontWeight: 600 }}>cambia</span>
          </div>
          <div className="flex items-center" style={{ gap: 18, fontFamily: MONO, fontSize: 12, color: C.gray }}>
            <span style={{ color: C.faint, letterSpacing: '.04em' }}>{'/\\-_=+|<  ~:*-/'}</span>
            <a href="https://github.com/epode/cambia/blob/main/SPEC.md">spec</a>
            <a href="https://github.com/epode/cambia">github</a>
          </div>
        </div>

        {/* hero */}
        <Eyebrow>A DESIGN.md extension · live engine · open source · MIT</Eyebrow>
        <h1
          style={{
            fontSize: 40,
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: '-.03em',
            margin: '20px 0 0',
            maxWidth: 580,
          }}
        >
          Interfaces that grow with the people who use them.
        </h1>
        <p style={{ fontSize: 16.5, color: C.gray, lineHeight: 1.55, margin: '22px 0 0', maxWidth: 540 }}>
          An interface is born the day it ships, and then — unlike anything alive — it never grows. Cambia is a small
          living layer on top of your design system <span style={{ color: C.ink }}>and a runtime that actually runs</span>
          : every interface starts tuned to the app, then quietly personalizes to each person, on their device. Nothing
          to configure. Nothing for the user to manage.
        </p>
        <p style={{ fontFamily: MONO, fontSize: 12.5, color: C.faint, margin: '16px 0 0' }}>
          <span style={{ color: C.accentDim }}>cambia</span> — a tree's living growth layer, on top of existing
          structure; and “it changes.”
        </p>

        {/* install + tabbed code */}
        <div style={{ marginTop: 32 }}>
          <Code
            title="terminal"
            lines={
              <>
                <span style={{ color: C.faint }}>$ </span>
                <span style={{ color: C.ink }}>npx cambia init</span>
                <span style={{ color: C.faint }}>{'   # adds a cambia: block to your DESIGN.md'}</span>
              </>
            }
          />
          <div className="flex items-center" style={{ gap: 6, margin: '12px 0', fontFamily: MONO, fontSize: 11.5 }}>
            {Object.keys(TABS).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  cursor: 'pointer',
                  border: `1px solid ${tab === t ? C.accentLine : C.line}`,
                  background: tab === t ? C.accentSoft : 'transparent',
                  color: tab === t ? C.accent : C.gray,
                  borderRadius: 7,
                  padding: '5px 11px',
                  fontFamily: MONO,
                  fontSize: 11.5,
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <Code title={tab === 'Tailwind' ? 'shell' : tab === 'React' ? 'app.tsx' : 'DESIGN.md'} lines={TABS[tab]} />
          <p style={{ fontSize: 13, color: C.gray, marginTop: 12 }}>
            That's the whole integration. Built on Google's <span style={{ color: C.ink, fontWeight: 600 }}>DESIGN.md</span>{' '}
            — one block, read by your agent and carried by your components. No new way to build.
          </p>
        </div>

        {/* how it works */}
        <div style={{ marginTop: 58 }}>
          <Eyebrow>§ how it actually works</Eyebrow>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.01em', margin: '12px 0 22px' }}>
            Born adapted. Then it learns. On the device.
          </h2>
          {[
            [
              '01',
              'Born-adapted',
              'Every component arrives tuned to the app’s archetype before anyone touches it — an analytics table opens dense and recency-sorted, a CRUD form opens comfortable.',
            ],
            [
              '02',
              'Observes real use',
              'You forward the choices a user already makes — a density toggle, a column sort, an action — via one observe() call. No tracking, no setup.',
            ],
            [
              '03',
              'Personalizes — safely',
              'After a clear, repeated pattern (never one stray click), the adaptive trait shifts for that user only. Conserved traits never move — they aren’t even in the engine.',
            ],
          ].map(([n, h, d], i) => (
            <div key={n} className="flex" style={{ gap: 18, paddingBottom: i < 2 ? 22 : 0, alignItems: 'flex-start' }}>
              <div style={{ fontFamily: MONO, fontSize: 12, color: C.accent, paddingTop: 3, width: 24, flexShrink: 0 }}>
                {n}
              </div>
              <div style={{ maxWidth: 540 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 5 }}>{h}</div>
                <div style={{ fontSize: 14.5, color: C.gray, lineHeight: 1.6 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* what it listens for */}
        <div style={{ marginTop: 56 }}>
          <Eyebrow>§ what it listens for</Eyebrow>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.01em', margin: '12px 0 8px' }}>
            Only the choices you hand it.
          </h2>
          <p style={{ fontSize: 14.5, color: C.gray, margin: '0 0 20px', maxWidth: 520 }}>
            Each adaptive trait maps to one explicit signal. The engine has no global listeners.
          </p>
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden', background: C.surface }}>
            {signals.map(([trait, sig], i) => (
              <div
                key={trait}
                className="flex items-center justify-between"
                style={{
                  padding: '13px 16px',
                  borderBottom: i < signals.length - 1 ? `1px solid ${C.line}` : 'none',
                  gap: 12,
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 13, color: C.accent }}>{trait}</span>
                <span style={{ fontSize: 13.5, color: C.gray, textAlign: 'right' }}>{sig}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13.5, color: C.gray, marginTop: 14, lineHeight: 1.6, maxWidth: 540 }}>
            Nothing else. <span style={{ color: C.ink }}>No mouse tracking, no scroll, no dwell time, no keystrokes</span> —
            only the discrete choice you forward to <span style={{ fontFamily: MONO, color: C.ink }}>observe()</span>.
          </p>
        </div>

        {/* examples */}
        <div style={{ marginTop: 56 }}>
          <Eyebrow>§ across every interface</Eyebrow>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.01em', margin: '12px 0 6px' }}>
            The same engine, on any interface.
          </h2>
          <p style={{ fontSize: 14.5, color: C.gray, margin: '0 0 22px', maxWidth: 500 }}>
            Not just tables. A dashboard, a form, a navigation, a feed — each quietly finding its shape for the person in
            front of it. Watch them breathe.
          </p>
          <div className="figs">
            <Figure n="01" label="dashboard" caption="Surfaces the one metric this person actually watches; the rest recede.">
              <ExDashboard g={g} />
            </Figure>
            <Figure n="02" label="form" caption="Shortens to the essentials for people who never touch the advanced fields.">
              <ExForm g={g} />
            </Figure>
            <Figure n="03" label="navigation" caption="Lifts the few destinations someone uses; files the rest under ‘More’.">
              <ExNav g={g} />
            </Figure>
            <Figure n="04" label="feed" caption="Loosens into readable cards, or tightens into a dense list, to match how they scan.">
              <ExFeed g={g} />
            </Figure>
          </div>
          <div style={{ textAlign: 'center', marginTop: 14, fontFamily: MONO, fontSize: 11, color: C.faint }}>
            ── default ⇄ grown · looping ──
          </div>
        </div>

        {/* privacy / gdpr */}
        <div style={{ marginTop: 58 }}>
          <Eyebrow>§ yours, on your device</Eyebrow>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.01em', margin: '12px 0 8px' }}>
            Personalization that never phones home.
          </h2>
          <p style={{ fontSize: 14.5, color: C.gray, margin: '0 0 20px', maxWidth: 520 }}>
            GDPR-friendly by construction — because the data barely exists and never leaves.
          </p>
          {[
            ['Nothing is transmitted', 'No telemetry endpoint, no shared server, no network calls. The runtime runs entirely on the device.'],
            ['Almost nothing is stored', 'Only small per-trait tallies (e.g. comfortable: 5, compact: 3), keyed by user. No PII, no event logs, no history.'],
            ['Erasable by design', 'Forgetting a user is clearing their local store; the interface falls straight back to born-adapted defaults.'],
          ].map(([h, d]) => (
            <div key={h} className="flex" style={{ gap: 14, paddingBottom: 16, alignItems: 'flex-start' }}>
              <span style={{ color: C.accent, fontFamily: MONO, fontSize: 13, paddingTop: 2 }}>●</span>
              <div style={{ maxWidth: 540 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{h}</div>
                <div style={{ fontSize: 14, color: C.gray, lineHeight: 1.6 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* tailwind */}
        <div style={{ marginTop: 44 }}>
          <Eyebrow>§ tailwind, in sync</Eyebrow>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.01em', margin: '12px 0 16px' }}>
            One source of truth for your tokens.
          </h2>
          <Code
            title="shell"
            lines={
              <>
                <div>
                  <span style={{ color: C.faint }}>$ </span>npx cambia tailwind --out cambia.theme.js
                  <span style={{ color: C.faint }}>{'   # DESIGN.md tokens → Tailwind theme'}</span>
                </div>
                <div>
                  <span style={{ color: C.faint }}>$ </span>npx cambia tailwind --check cambia.theme.js
                  <span style={{ color: C.faint }}>{'  # CI fails if they drift'}</span>
                </div>
              </>
            }
          />
          <p style={{ fontSize: 13.5, color: C.gray, marginTop: 12, lineHeight: 1.6, maxWidth: 540 }}>
            Colors, spacing, radius and type flow from DESIGN.md into Tailwind — generated, not hand-mirrored, and
            drift-checked in CI.
          </p>
        </div>

        {/* packages */}
        <div style={{ marginTop: 56 }}>
          <Eyebrow>§ four small packages</Eyebrow>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.01em', margin: '12px 0 20px' }}>
            Declare it, then make it live.
          </h2>
          <div className="pkgs">
            {packages.map(([name, role, detail]) => (
              <div key={name} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 11, padding: '16px 16px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, color: C.accent }}>{name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.faint, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    {role}
                  </span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12, color: C.gray }}>{detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* close */}
        <div style={{ marginTop: 60, borderTop: `1px solid ${C.line}`, paddingTop: 40 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, marginBottom: 16, letterSpacing: '.08em' }}>
            {'/\\-_=+|<  ~:*-/  =_-+|>'}
          </div>
          <h2 style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.025em', margin: '0 0 18px', maxWidth: 460, lineHeight: 1.15 }}>
            Stop shipping interfaces that never grow up.
          </h2>
          <div className="flex items-center" style={{ gap: 18, flexWrap: 'wrap', marginTop: 18 }}>
            <span style={{ fontFamily: MONO, fontSize: 13.5, background: C.accent, color: '#06302B', fontWeight: 600, padding: '11px 16px', borderRadius: 9 }}>
              npx cambia init
            </span>
            <a href="https://github.com/epode/cambia/blob/main/SPEC.md" style={{ fontFamily: MONO, fontSize: 13, color: C.accent }}>
              read the spec →
            </a>
          </div>
        </div>

        {/* footer */}
        <div
          className="flex items-center justify-between"
          style={{ marginTop: 52, paddingTop: 20, borderTop: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 11.5, color: C.faint }}
        >
          <span>
            <span style={{ color: C.accent }}>●</span> cambia · a living layer on DESIGN.md
          </span>
          <span>built on DESIGN.md · MIT · 2026</span>
        </div>
      </div>
    </div>
  );
}
