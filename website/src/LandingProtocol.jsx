import { useState, useEffect } from "react";

const C = {
  paper: "#FBFBF9", surface: "#FFFFFF", ink: "#16181C", gray: "#6B6F76", faint: "#9CA0A6",
  line: "#E7E7E2", accent: "#2B4ACB", accentSoft: "#ECEEFB", ok: "#3C7A5A",
};
const SANS = "'Public Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

/* ───────── example 1 · dashboard ───────── */
function ExDashboard({ g }) {
  const tiles = [["Revenue", "$284k"], ["Orders", "1,847"], ["AOV", "$154"], ["New", "412"], ["Refunds", "2.1%"], ["Churn", "1.4%"]];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
      {tiles.map(([k, v], i) => {
        const hero = g && i === 0;
        const dim = g && i >= 3;
        return (
          <div key={k} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 10px", background: hero ? C.accentSoft : C.surface, opacity: dim ? 0.4 : 1, transition: "all .6s ease" }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.faint, textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</div>
            <div style={{ fontWeight: 700, fontSize: hero ? 24 : 14, color: hero ? C.accent : C.ink, transition: "all .6s ease", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{v}</div>
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
  const fields = ["Store name", "What you sell", "Currency", "Tax region", "Webhook URL", "Rate limit"];
  return (
    <div>
      {fields.map((f, i) => {
        const hide = g && i >= 3;
        return (
          <div key={f} style={{ overflow: "hidden", maxHeight: hide ? 0 : 52, opacity: hide ? 0 : 1, marginBottom: hide ? 0 : 9, transition: "all .55s ease" }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: C.ink }}>{f}</div>
            <div style={{ height: 28, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 7 }} />
          </div>
        );
      })}
      <div style={{ maxHeight: g ? 30 : 0, opacity: g ? 1 : 0, overflow: "hidden", transition: "all .55s ease", fontSize: 11.5, color: C.accent, fontWeight: 600 }}>
        + Advanced (3) — optional
      </div>
    </div>
  );
}

/* ───────── example 3 · navigation ───────── */
function ExNav({ g }) {
  const items = ["Overview", "Orders", "Refunds", "Inventory", "Customers", "Reports", "Integrations", "Settings"];
  const hot = [1, 2, 0]; // promoted when grown
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((it, i) => {
        const promoted = g && hot.includes(i);
        const dim = g && !hot.includes(i);
        return (
          <div key={it}>
            {g && i === 3 && <div style={{ fontFamily: MONO, fontSize: 8.5, color: C.faint, textTransform: "uppercase", letterSpacing: ".06em", padding: "7px 8px 3px" }}>More</div>}
            <div className="flex items-center" style={{ gap: 8, padding: "6px 8px", borderRadius: 6, background: promoted ? C.accentSoft : "transparent", opacity: dim ? 0.4 : 1, transition: "all .55s ease" }}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: promoted ? C.accent : C.line, transition: "all .55s ease" }} />
              <span style={{ fontSize: 12.5, fontWeight: promoted ? 700 : 400, color: promoted ? C.accent : C.ink, transition: "all .55s ease" }}>{it}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────── example 4 · feed ───────── */
function ExFeed({ g }) {
  const rows = [["Aurora Labs", "shipped 240 units"], ["Bjørk Studio", "refund requested"], ["Fjord Supply", "paid invoice #1031"]];
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rows.map(([a, b], i) => (
        <div key={a} className="flex items-center" style={{ gap: 10, padding: g ? "13px 4px" : "7px 4px", borderBottom: i < 2 ? `1px solid ${C.line}` : "none", transition: "all .6s ease" }}>
          <div style={{ width: g ? 30 : 20, height: g ? 30 : 20, borderRadius: 99, background: C.accentSoft, color: C.accent, display: "grid", placeItems: "center", fontWeight: 700, fontSize: g ? 12 : 10, flexShrink: 0, transition: "all .6s ease" }}>{a[0]}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: g ? 13 : 12, fontWeight: 600, transition: "all .6s ease" }}>{a}</div>
            <div style={{ maxHeight: g ? 16 : 0, opacity: g ? 1 : 0, overflow: "hidden", fontSize: 11.5, color: C.gray, transition: "all .6s ease" }}>{b}</div>
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
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.faint, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
      </div>
      <div style={{ minHeight: 188 }}>{children}</div>
      <div style={{ fontSize: 12.5, color: C.gray, marginTop: 14, lineHeight: 1.5 }}>{caption}</div>
    </div>
  );
}

export default function App() {
  const [g, setG] = useState(false);
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
    const iv = setInterval(() => setG((x) => !x), 3400);
    return () => { document.head.removeChild(l); clearInterval(iv); };
  }, []);

  const Section = ({ k }) => <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint }}>{k}</span>;

  return (
    <div style={{ background: C.paper, minHeight: "100%", fontFamily: SANS, color: C.ink }}>
      <style>{`
        *{ -webkit-font-smoothing:antialiased; box-sizing:border-box; }
        a{ color:inherit; }
        @media (prefers-reduced-motion: reduce){ *{ transition:none!important; } }
        .figs{ display:grid; grid-template-columns:1fr; gap:14px; }
        @media (min-width:680px){ .figs{ grid-template-columns:1fr 1fr; } }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "22px 24px 64px" }}>
        {/* top bar */}
        <div className="flex items-center justify-between" style={{ marginBottom: 64, fontSize: 13 }}>
          <div className="flex items-center" style={{ gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, display: "inline-block" }} />
            <span style={{ fontFamily: MONO, fontWeight: 500 }}>cambia</span>
          </div>
          <div className="flex items-center" style={{ gap: 18, fontFamily: MONO, fontSize: 12, color: C.gray }}>
            <span>spec</span><span>github</span>
          </div>
        </div>

        {/* hero */}
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.gray, letterSpacing: ".04em", marginBottom: 20 }}>
          LIVING INTERFACE PROTOCOL · OPEN SOURCE · MIT
        </div>
        <h1 style={{ fontSize: 38, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-.025em", margin: 0, maxWidth: 560 }}>
          Interfaces that grow with the people who use them.
        </h1>
        <p style={{ fontSize: 16.5, color: C.gray, lineHeight: 1.55, margin: "22px 0 0", maxWidth: 520 }}>
          An interface is born the day it ships, and then — unlike anything alive — it never grows. It stays the same
          for everyone, forever. The Cambia is a small layer on top of your design system that lets
          an interface quietly grow to fit each person who uses it. Nothing to configure. Nothing for the user to manage.
        </p>

        {/* install + code */}
        <div style={{ marginTop: 34 }}>
          <div style={{ background: C.ink, borderRadius: 10, overflow: "hidden" }}>
            <div className="flex items-center" style={{ gap: 7, padding: "9px 14px", borderBottom: "1px solid #2A2D33" }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: "#3A3E45" }} />
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: "#7E838B" }}>terminal</span>
            </div>
            <div style={{ padding: "14px 16px", fontFamily: MONO, fontSize: 13.5 }}>
              <span style={{ color: "#5E636B" }}>$ </span>
              <span style={{ color: "#E9EAEC" }}>npx cambia init</span>
              <span style={{ color: "#5E636B" }}>{"   # adds a cambia: block to your DESIGN.md"}</span>
            </div>
          </div>

          <div style={{ marginTop: 12, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
            <div className="flex items-center justify-between" style={{ padding: "9px 14px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.faint }}>DESIGN.md</span>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.faint }}>+ 6 lines</span>
            </div>
            <div style={{ margin: 0, padding: "14px 16px", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.7, color: C.ink, overflowX: "auto", whiteSpace: "pre" }}>
              <div>cambia:</div>
              <div>{"  roles:"}</div>
              <div>{"    tabular-list:"}</div>
              <div><span style={{ color: C.gray }}>{"      conserved:"}</span>{" [rows-are-records, sort-by-header]   "}<span style={{ color: C.faint }}>{"# never moves"}</span></div>
              <div><span style={{ color: C.accent }}>{"      adaptive:"}</span>{"  [density, default-sort]              "}<span style={{ color: C.faint }}>{"# may personalize"}</span></div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: C.gray, marginTop: 12 }}>
            That's the whole integration. Your agent reads the file and your components do the rest — you build exactly
            as you do now. Built on Google's <span style={{ color: C.ink, fontWeight: 600 }}>DESIGN.md</span>.
          </p>
        </div>

        {/* examples */}
        <div style={{ marginTop: 56 }}>
          <Section k="§ ACROSS EVERY INTERFACE" />
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.01em", margin: "10px 0 6px" }}>
            The same protocol, on any interface.
          </h2>
          <p style={{ fontSize: 14.5, color: C.gray, margin: "0 0 22px", maxWidth: 500 }}>
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
          <div style={{ textAlign: "center", marginTop: 14, fontFamily: MONO, fontSize: 11, color: C.faint }}>
            ── default ⇄ grown · looping ──
          </div>
        </div>

        {/* principles, numbered */}
        <div style={{ marginTop: 58, borderTop: `1px solid ${C.line}`, paddingTop: 40 }}>
          {[
            ["#1", "Invisible", "Nothing to configure, no “we personalized this” banner. It just fits a little better the more it’s used — the way it always should have."],
            ["#2", "Lives with you", "Preferences stay on the device, not in a company’s database. Which is exactly why, one day, an interface can follow a person across every app they use."],
            ["#3", "No new way to build", "One block on the design system you already have. The agent reads it; the components carry it. You write the same code you would have anyway."],
          ].map(([n, h, d], i) => (
            <div key={n} className="flex" style={{ gap: 20, paddingBottom: i < 2 ? 28 : 0, alignItems: "flex-start" }}>
              <div style={{ fontFamily: MONO, fontSize: 13, color: C.accent, paddingTop: 2, width: 28, flexShrink: 0 }}>{n}</div>
              <div style={{ maxWidth: 520 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{h}</div>
                <div style={{ fontSize: 14.5, color: C.gray, lineHeight: 1.6 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* close */}
        <div style={{ marginTop: 52, borderTop: `1px solid ${C.line}`, paddingTop: 40 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, marginBottom: 16, letterSpacing: ".08em" }}>
            {"/\\-_=+|<  ~:*-/  =_-+|>"}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", margin: "0 0 14px", maxWidth: 440, lineHeight: 1.18 }}>
            Stop shipping interfaces that never grow up.
          </h2>
          <div className="flex items-center" style={{ gap: 18, flexWrap: "wrap", marginTop: 18 }}>
            <span style={{ fontFamily: MONO, fontSize: 13.5, background: C.ink, color: C.paper, padding: "11px 16px", borderRadius: 9 }}>npx cambia init</span>
            <span style={{ fontFamily: MONO, fontSize: 13, color: C.accent }}>read the spec →</span>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between" style={{ marginTop: 52, paddingTop: 20, borderTop: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 11.5, color: C.faint }}>
          <span><span style={{ color: C.accent }}>●</span> living interface protocol</span>
          <span>built on DESIGN.md · MIT · 2026</span>
        </div>
      </div>
    </div>
  );
}
