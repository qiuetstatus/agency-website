const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "emerald",
  "fontPair": "serif-sans",
  "density": "spacious",
  "showGrain": true,
  "lang": "en"
}/*EDITMODE-END*/;

const PALETTES = {
  emerald: { bg: '#122620', fg: '#F4EBD0', muted: '#9CA89E', line: 'rgba(244,235,208,0.14)', accent: '#5E503F', deep: '#0c1a16' },
  midnight: { bg: '#1A1A2E', fg: '#F4EBD0', muted: '#a0a0b8', line: 'rgba(244,235,208,0.14)', accent: '#4B0000', deep: '#0f0f20' },
  obsidian: { bg: '#0a0a0a', fg: '#F4EBD0', muted: '#9c9890', line: 'rgba(244,235,208,0.14)', accent: '#8B7355', deep: '#000000' },
  cream:    { bg: '#F4EBD0', fg: '#122620', muted: '#5E503F', line: 'rgba(18,38,32,0.14)', accent: '#4B0000', deep: '#e9dfbe' },
};

const FONT_PAIRS = {
  'serif-sans':  { display: '"Cormorant Garamond", "Cormorant", serif', body: '"Inter Tight", "Inter", system-ui, sans-serif', displayWeight: 500 },
  'all-serif':   { display: '"Cormorant Garamond", serif', body: '"EB Garamond", Georgia, serif', displayWeight: 500 },
  'sans-only':   { display: '"Instrument Sans", "Inter Tight", system-ui, sans-serif', body: '"Inter Tight", system-ui, sans-serif', displayWeight: 500 },
};

function applyTheme(t) {
  const p = PALETTES[t.palette] || PALETTES.emerald;
  const f = FONT_PAIRS[t.fontPair] || FONT_PAIRS['serif-sans'];
  const r = document.documentElement.style;
  r.setProperty('--bg', p.bg);
  r.setProperty('--fg', p.fg);
  r.setProperty('--muted', p.muted);
  r.setProperty('--line', p.line);
  r.setProperty('--accent', p.accent);
  r.setProperty('--deep', p.deep);
  r.setProperty('--font-display', f.display);
  r.setProperty('--font-body', f.body);
  r.setProperty('--display-weight', f.displayWeight);
  r.setProperty('--gutter', t.density === 'compact' ? '120px' : '200px');
}

// Language context helper — read from localStorage first, fall back to default
function getInitialLang() {
  try {
    const stored = localStorage.getItem('masovic_lang');
    if (stored === 'en' || stored === 'de') return stored;
  } catch (e) {}
  return TWEAK_DEFAULTS.lang || 'en';
}

const LangCtx = React.createContext({ lang: 'en', t: window.I18N.en, setLang: () => {} });
const useT = () => React.useContext(LangCtx).t;

// ────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, as: Tag = 'div', className = '', style = {} }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setTimeout(() => setShown(true), delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 900ms cubic-bezier(.2,.6,.2,1), transform 900ms cubic-bezier(.2,.6,.2,1)',
      }}
    >
      {children}
    </Tag>
  );
}

// ────────────────────────────────────────────────────────────
function LangToggle() {
  const { lang, setLang } = React.useContext(LangCtx);
  return (
    <div data-lang-toggle style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', border: '1px solid var(--line)', padding: 2 }}>
      {['en', 'de'].map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          style={{
            background: lang === code ? 'var(--fg)' : 'transparent',
            color: lang === code ? 'var(--bg)' : 'var(--fg)',
            border: 'none', padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit',
            transition: 'all 200ms ease',
          }}
        >{code.toUpperCase()}</button>
      ))}
    </div>
  );
}

function Nav({ onApply }) {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding: scrolled ? '14px 40px' : '24px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 24,
      background: scrolled ? 'color-mix(in oklab, var(--bg) 85%, transparent)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
      transition: 'background 400ms ease, backdrop-filter 400ms ease, border-color 400ms ease, padding 400ms ease',
      maxWidth: '100vw',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 28, height: 28, border: '1px solid var(--fg)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16 }}>M</div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.04em', fontWeight: 'var(--display-weight)' }}>MASOVIC</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', marginLeft: 4, paddingLeft: 12, borderLeft: '1px solid var(--line)' }}>Quiet Status</span>
      </div>
      <div data-nav-right style={{ display: 'flex', alignItems: 'center', gap: 28, fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        <span data-nav-links style={{ display: 'contents' }}>
          <a href="#approach" style={{ color: 'var(--fg)', textDecoration: 'none', opacity: 0.85 }}>{t.nav.approach}</a>
          <a href="#process" style={{ color: 'var(--fg)', textDecoration: 'none', opacity: 0.85 }}>{t.nav.process}</a>
          <a href="#network" style={{ color: 'var(--fg)', textDecoration: 'none', opacity: 0.85 }}>{t.nav.network}</a>
          <a href="#about" style={{ color: 'var(--fg)', textDecoration: 'none', opacity: 0.85 }}>{t.nav.about}</a>
        </span>
        <LangToggle />
        <button data-nav-apply onClick={onApply} style={{
          fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
          background: 'var(--fg)', color: 'var(--bg)', border: 'none', padding: '12px 22px', cursor: 'pointer',
        }}>{t.nav.apply}</button>
      </div>
    </nav>
  );
}

// ────────────────────────────────────────────────────────────
function Hero({ onApply }) {
  const t = useT();
  return (
    <section data-hero style={{ minHeight: 'max(100vh, 880px)', position: 'relative', display: 'flex', flexDirection: 'column', padding: '120px 40px 80px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 60% at 50% 110%, color-mix(in oklab, var(--accent) 35%, transparent), transparent 60%)', pointerEvents: 'none' }} />
      <div data-hero-eyebrows style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', flexWrap: 'wrap', gap: 12 }}>
        <span>{t.hero.eyebrow1}</span>
        <span>{t.hero.eyebrow2}</span>
      </div>

      <div style={{ flex: 1, minHeight: 40 }} />

      <Reveal>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--display-weight)',
          fontSize: 'clamp(56px, 9vw, 156px)',
          lineHeight: 0.94,
          letterSpacing: '-0.02em',
          margin: 0,
          textWrap: 'balance',
        }}>
          {t.hero.h1a}<br />
          {t.hero.h1b} <span style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 400 }}>{t.hero.h1italic}</span><br />
          {t.hero.h1c}
        </h1>
      </Reveal>

      <div data-hero-bottom style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 56, gap: 60, flexWrap: 'wrap' }}>
        <Reveal delay={200}>
          <p style={{ maxWidth: 460, fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.55, color: 'var(--muted)', margin: 0 }}>
            {t.hero.sub}
          </p>
        </Reveal>
        <Reveal delay={350}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
            <button onClick={onApply} style={{
              fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase',
              background: 'transparent', color: 'var(--fg)', border: '1px solid var(--fg)',
              padding: '20px 36px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 14,
            }}>
              {t.hero.cta}
              <span style={{ width: 22, height: 1, background: 'var(--fg)', display: 'inline-block' }} />
            </button>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {t.hero.ctaNote}
            </span>
          </div>
        </Reveal>
      </div>

      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 1, height: 36, background: 'var(--line)', display: 'inline-block' }} />
        {t.hero.scroll}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
function SectionHeader({ index, label }) {
  return (
    <div data-section-header style={{ display: 'flex', alignItems: 'baseline', gap: 18, fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 56 }}>
      <span style={{ color: 'var(--accent)' }}>{index}</span>
      <span style={{ flex: '0 0 60px', height: 1, background: 'var(--line)' }} />
      <span>{label}</span>
    </div>
  );
}

function WhoWhat() {
  const t = useT();
  return (
    <section id="approach" data-section style={{ padding: '180px 40px', borderTop: '1px solid var(--line)' }}>
      <div data-grid="who" style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 100 }}>
        <Reveal>
          <div style={{ position: 'sticky', top: 120 }}>
            <SectionHeader index={t.who.idx} label={t.who.label} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 'clamp(40px, 5vw, 76px)', lineHeight: 1, letterSpacing: '-0.01em', margin: 0 }}>
              {t.who.titleA}<br /><span style={{ fontStyle: 'italic' }}>{t.who.titleI}</span>
            </h2>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1.35, fontWeight: 400, margin: '0 0 36px', color: 'var(--fg)', textWrap: 'balance' }}>
              {t.who.lead}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.7, color: 'var(--muted)', margin: 0, maxWidth: 580 }}>
              {t.who.body}
            </p>
            <div data-grid="who-cards" style={{ marginTop: 80, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {t.who.cards.map((c) => (
                <div key={c.k} style={{ borderTop: '1px solid var(--line)', paddingTop: 18 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, marginBottom: 6 }}>{c.k}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{c.v}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function WhatWeDo() {
  const t = useT();
  return (
    <section data-section style={{ padding: '180px 40px', background: 'var(--deep)', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader index={t.what.idx} label={t.what.label} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 'clamp(48px, 7vw, 112px)', lineHeight: 0.96, letterSpacing: '-0.02em', margin: '0 0 80px', maxWidth: 1100, textWrap: 'balance' }}>
            {t.what.titleA}<span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{t.what.titleI}</span> {t.what.titleB}
          </h2>
        </Reveal>
        <div>
          {t.what.items.map((it, i) => (
            <Reveal key={it.n} delay={i * 80}>
              <div data-row="what-item" style={{
                display: 'grid', gridTemplateColumns: '120px 1fr 2fr', gap: 60,
                padding: '36px 0', borderTop: '1px solid var(--line)',
                alignItems: 'baseline',
              }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.24em', color: 'var(--muted)' }}>{it.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 32, lineHeight: 1.1, margin: 0, letterSpacing: '-0.01em' }}>{it.t}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.65, color: 'var(--muted)', margin: 0, maxWidth: 520 }}>{it.d}</p>
              </div>
            </Reveal>
          ))}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 36, marginTop: 24, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--fg)', textAlign: 'right' }}>
            {t.what.footer}
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
function Approach() {
  const t = useT();
  return (
    <section data-section style={{ padding: '200px 40px', borderTop: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader index={t.approach.idx} label={t.approach.label} />
        </Reveal>
        <Reveal delay={120}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 44px)', lineHeight: 1.25, fontWeight: 400, color: 'var(--muted)', margin: '0 0 16px', maxWidth: 900 }}>
            {t.approach.lead}
          </p>
        </Reveal>
        <Reveal delay={240}>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(40px, 5.5vw, 88px)', lineHeight: 1.05, margin: '0 0 100px', letterSpacing: '-0.01em' }}>
            {t.approach.counter}
          </p>
        </Reveal>
        <div style={{ display: 'grid', gap: 0 }}>
          {t.approach.tenets.map((tn, i) => (
            <Reveal key={i} delay={i * 100}>
              <div data-row="tenet" style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: 40,
                padding: '40px 0', borderTop: '1px solid var(--line)',
                alignItems: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--accent)' }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.4vw, 52px)', lineHeight: 1, fontWeight: 'var(--display-weight)', letterSpacing: '-0.01em' }}>
                  {tn.l}
                </div>
                <div data-tenet-r style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(20px, 2vw, 28px)', lineHeight: 1.2, color: 'var(--muted)' }}>
                  {tn.r}
                </div>
              </div>
            </Reveal>
          ))}
          <div style={{ borderTop: '1px solid var(--line)' }} />
        </div>
        <Reveal delay={400}>
          <p style={{ marginTop: 100, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(36px, 4.5vw, 72px)', lineHeight: 1.05, textAlign: 'center', letterSpacing: '-0.01em', whiteSpace: 'pre-line' }}>
            {t.approach.closing}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
function Proof() {
  const t = useT();
  return (
    <section data-section style={{ padding: '200px 40px', background: 'var(--deep)', borderTop: '1px solid var(--line)' }}>
      <div data-grid="proof" style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <Reveal>
          <div>
            <SectionHeader index={t.proof.idx} label={t.proof.label} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 'clamp(40px, 5.5vw, 88px)', lineHeight: 0.98, letterSpacing: '-0.02em', margin: '0 0 32px', textWrap: 'balance' }}>
              {t.proof.titleA} <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{t.proof.titleI}</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.7, color: 'var(--muted)', margin: 0, maxWidth: 520 }}>
              {t.proof.body}
            </p>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
            {t.proof.rows.map((m) => (
              <div key={m.label} data-row="proof-row" style={{ background: 'var(--deep)', padding: '32px 28px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 20 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.15, fontWeight: 'var(--display-weight)', marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>{m.meta}</div>
                </div>
                <div data-proof-perf style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 36, color: 'var(--accent)' }}>{m.perf}</div>
              </div>
            ))}
            <div style={{ background: 'var(--deep)', padding: '20px 28px', fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'right' }}>
              {t.proof.footnote}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
function Process() {
  const t = useT();
  return (
    <section id="process" data-section style={{ padding: '200px 40px', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader index={t.process.idx} label={t.process.label} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 'clamp(48px, 7vw, 112px)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: '0 0 100px', maxWidth: 1100 }}>
            {t.process.titleA} <span style={{ fontStyle: 'italic' }}>{t.process.titleI}</span>
          </h2>
        </Reveal>
        <div data-grid="process" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {t.process.steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
                <div style={{
                  aspectRatio: '4/5',
                  border: '1px solid var(--line)',
                  background: `repeating-linear-gradient(135deg, transparent 0 14px, color-mix(in oklab, var(--fg) 4%, transparent) 14px 15px)`,
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 24,
                }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--accent)' }}>{t.process.stepLabel} {s.n}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(60px, 6vw, 96px)', lineHeight: 0.9, color: 'var(--fg)', alignSelf: 'flex-end' }}>
                    .{s.n}
                  </div>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 26, lineHeight: 1.1, margin: 0 }}>{s.t}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
function Network() {
  const t = useT();
  return (
    <section id="network" data-section style={{ padding: '200px 40px', background: 'var(--deep)', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <div data-grid="network-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginBottom: 80, alignItems: 'end' }}>
            <div>
              <SectionHeader index={t.network.idx} label={t.network.label} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 'clamp(40px, 5.5vw, 88px)', lineHeight: 0.98, letterSpacing: '-0.02em', margin: 0 }}>
                {t.network.titleA} <span style={{ fontStyle: 'italic' }}>{t.network.titleI}</span><br />{t.network.titleB}
              </h2>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.7, color: 'var(--muted)', margin: 0, maxWidth: 460, justifySelf: 'end' }}>
              {t.network.lead}
            </p>
          </div>
        </Reveal>
        <div data-grid="verticals" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {t.network.verticals.map((v, i) => (
            <Reveal key={v.t} delay={i * 100}>
              <div data-network-card style={{
                border: '1px solid var(--line)', padding: 28, height: '100%',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 360,
                background: 'color-mix(in oklab, var(--fg) 2%, transparent)',
              }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)' }}>{t.network.verticalLabel} · {String(i + 1).padStart(2, '0')}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 30, lineHeight: 1.1, margin: '120px 0 24px', letterSpacing: '-0.01em' }}>
                  {v.t}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {v.tags.map((tg) => (
                    <span key={tg} style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg)', border: '1px solid var(--line)', padding: '6px 10px' }}>{tg}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={400}>
          <div data-vertical-meta style={{ marginTop: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 24, fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            <span>{t.network.footL}</span>
            <span>{t.network.footR}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
function About() {
  const t = useT();
  return (
    <section id="about" data-section style={{ padding: '220px 40px', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader index={t.about.idx} label={t.about.label} />
        </Reveal>
        <Reveal delay={100}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 'clamp(36px, 4.5vw, 64px)', lineHeight: 1.15, letterSpacing: '-0.01em', margin: '0 0 60px', textWrap: 'balance' }}>
            {t.about.lead} <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{t.about.leadI}</span> {t.about.leadB}
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div data-grid="about-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              {t.about.colA}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              {t.about.colB}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
function FinalCTA({ onApply }) {
  const t = useT();
  return (
    <section data-final-cta style={{ padding: '160px 40px 200px', background: 'var(--deep)', borderTop: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 100%, color-mix(in oklab, var(--accent) 40%, transparent), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <Reveal>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 40px' }}>
            {t.cta.eyebrow}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 'clamp(56px, 9vw, 156px)', lineHeight: 0.92, letterSpacing: '-0.025em', margin: '0 0 40px' }}>
            {t.cta.titleA}<br />{t.cta.titleB} <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{t.cta.titleI}</span>
          </h2>
        </Reveal>
        <Reveal delay={240}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.2vw, 28px)', lineHeight: 1.4, color: 'var(--muted)', maxWidth: 700, margin: '0 auto 56px', fontWeight: 400 }}>
            {t.cta.body}
          </p>
        </Reveal>
        <Reveal delay={360}>
          <button onClick={onApply} style={{
            fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.28em', textTransform: 'uppercase',
            background: 'var(--fg)', color: 'var(--bg)', border: 'none',
            padding: '24px 48px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 16,
          }}>
            {t.cta.btn}
            <span style={{ width: 28, height: 1, background: 'var(--bg)', display: 'inline-block' }} />
          </button>
          <div style={{ marginTop: 24, fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            {t.cta.note}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
function Footer() {
  const t = useT();
  return (
    <footer style={{ padding: '60px 40px 40px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
      <div data-grid="footer" style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, alignItems: 'start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 'var(--display-weight)', letterSpacing: '0.02em' }}>MASOVIC</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 6 }}>{t.footer.tag}</div>
        </div>
        {t.footer.cols.map((c) => (
          <div key={c.h}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>{c.h}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {c.l.map((x) => <span key={x} style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg)' }}>{x}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1400, margin: '60px auto 0', borderTop: '1px solid var(--line)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        <span>{t.footer.copy}</span>
        <span>{t.footer.slogan}</span>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────
function ApplyModal({ open, onClose }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ brand: '', category: '', budget: '', goal: '', email: '' });
  const close = () => { onClose(); setTimeout(() => setStep(0), 300); };
  if (!open) return null;
  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const steps = t.modal.steps;
  const cur = steps[step];
  const valid = cur.fields.every((f) => data[f.k] && data[f.k].trim().length > 0);
  const isLast = step === steps.length - 1;
  const submitted = step === steps.length;

  return (
    <div onClick={close} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'color-mix(in oklab, var(--deep) 80%, transparent)',
      backdropFilter: 'blur(8px)',
      display: 'grid', placeItems: 'center', padding: 24,
      animation: 'fadeIn 280ms ease',
    }}>
      <div data-modal onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--bg)', color: 'var(--fg)',
        width: 'min(640px, 100%)', padding: '48px 48px 40px',
        border: '1px solid var(--line)',
        position: 'relative',
      }}>
        <button onClick={close} style={{
          position: 'absolute', top: 18, right: 18, background: 'transparent', border: 'none', color: 'var(--fg)',
          fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer',
        }}>{t.modal.close}</button>

        {!submitted ? (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
              {steps.map((_, i) => (
                <span key={i} style={{ flex: 1, height: 2, background: i <= step ? 'var(--accent)' : 'var(--line)', transition: 'background 300ms' }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {t.modal.step(step + 1, steps.length)}
            </div>
            <h3 data-modal-title style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 44, letterSpacing: '-0.01em', margin: '8px 0 36px' }}>{cur.title}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {cur.fields.map((f) => (
                <label key={f.k} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--muted)' }}>{f.label}</span>
                  {f.kind === 'select' ? (
                    <select value={data[f.k]} onChange={(e) => update(f.k, e.target.value)} style={inputStyle}>
                      <option value="">{f.placeholder}</option>
                      {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.kind === 'textarea' ? (
                    <textarea value={data[f.k]} onChange={(e) => update(f.k, e.target.value)} placeholder={f.placeholder} rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
                  ) : (
                    <input value={data[f.k]} onChange={(e) => update(f.k, e.target.value)} placeholder={f.placeholder} style={inputStyle} />
                  )}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} style={{ ...ghostBtn, opacity: step === 0 ? 0.3 : 1 }}>{t.modal.back}</button>
              <button
                onClick={() => valid && setStep((s) => s + 1)}
                disabled={!valid}
                style={{ ...primaryBtn, opacity: valid ? 1 : 0.4, cursor: valid ? 'pointer' : 'not-allowed' }}
              >
                {isLast ? t.modal.submit : t.modal.cont}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>{t.modal.received}</div>
            <h3 data-modal-thanks style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 48, letterSpacing: '-0.01em', margin: '0 0 16px' }}>{t.modal.thanksA} <span style={{ fontStyle: 'italic' }}>{data.brand}</span>{t.modal.thanksB}</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.65, color: 'var(--muted)', maxWidth: 420, margin: '0 auto 32px' }}>
              {t.modal.thanksBody}
            </p>
            <button onClick={close} style={primaryBtn}>{t.modal.doneBtn}</button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg)',
  background: 'transparent', border: 'none', borderBottom: '1px solid var(--line)',
  padding: '10px 0', outline: 'none', appearance: 'none',
};
const primaryBtn = {
  fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
  background: 'var(--fg)', color: 'var(--bg)', border: 'none', padding: '14px 28px', cursor: 'pointer',
};
const ghostBtn = {
  fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
  background: 'transparent', color: 'var(--fg)', border: '1px solid var(--line)', padding: '14px 22px', cursor: 'pointer',
};

// ────────────────────────────────────────────────────────────
function Tweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => { applyTheme(t); }, [t]);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Palette">
        <TweakRadio value={t.palette} onChange={(v) => setTweak('palette', v)} options={[
          { value: 'emerald', label: 'Emerald' },
          { value: 'midnight', label: 'Midnight' },
          { value: 'obsidian', label: 'Obsidian' },
          { value: 'cream', label: 'Cream' },
        ]} />
      </TweakSection>
      <TweakSection title="Typography">
        <TweakRadio value={t.fontPair} onChange={(v) => setTweak('fontPair', v)} options={[
          { value: 'serif-sans', label: 'Serif + Sans' },
          { value: 'all-serif', label: 'All Serif' },
          { value: 'sans-only', label: 'Sans Only' },
        ]} />
      </TweakSection>
      <TweakSection title="Density">
        <TweakRadio value={t.density} onChange={(v) => setTweak('density', v)} options={[
          { value: 'compact', label: 'Compact' },
          { value: 'spacious', label: 'Spacious' },
        ]} />
      </TweakSection>
      <TweakSection title="Texture">
        <TweakToggle label="Film grain overlay" value={t.showGrain} onChange={(v) => setTweak('showGrain', v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

// ────────────────────────────────────────────────────────────
function App() {
  const [modal, setModal] = useState(false);
  const [lang, setLangState] = useState(getInitialLang);

  useEffect(() => { applyTheme(TWEAK_DEFAULTS); }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('masovic_lang', lang); } catch (e) {}
  }, [lang]);

  const setLang = (l) => setLangState(l);
  const ctx = { lang, setLang, t: window.I18N[lang] || window.I18N.en };

  return (
    <LangCtx.Provider value={ctx}>
      <div style={{ background: 'var(--bg)', color: 'var(--fg)', minHeight: '100vh', position: 'relative' }}>
        <Nav onApply={() => setModal(true)} />
        <Hero onApply={() => setModal(true)} />
        <WhoWhat />
        <WhatWeDo />
        <Approach />
        <Proof />
        <Process />
        <Network />
        <About />
        <FinalCTA onApply={() => setModal(true)} />
        <Footer />
        <ApplyModal open={modal} onClose={() => setModal(false)} />
        <Tweaks />
      </div>
    </LangCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
