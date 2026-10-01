// src/pages/Others.jsx  (ডেমো — "আপডেট চলছে")
import React from "react";

/* ================= STYLES ================= */

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

.ot-root {
  font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Kalpurush', system-ui, sans-serif;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -webkit-tap-highlight-color: transparent;
}
.ot-root h1, .ot-root h2, .ot-root p, .ot-root span {
  letter-spacing: 0 !important;
}
@keyframes ot-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.ot-rise { animation: ot-rise .4s ease-out both; }
@keyframes ot-spin { to { transform: rotate(360deg); } }
.ot-spin { animation: ot-spin 8s linear infinite; }
@keyframes ot-dot { 0%,80%,100% { opacity: .25; } 40% { opacity: 1; } }
.ot-dot { animation: ot-dot 1.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .ot-rise, .ot-spin, .ot-dot { animation: none; }
}
`;

/* ===== THEME: navy blue + gold ===== */

// সাইডবার fixed — কনটেন্ট যেন তার নিচে না ঢোকে
const OFFSET = "pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-0 md:pl-64";

const HERO_BG = {
  background:
    "radial-gradient(700px 320px at 10% -30%, #1E5A74 0%, transparent 60%), linear-gradient(160deg, #0F3045 0%, #071826 70%)",
};

/* ================= ICON ================= */

const GearIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-14 w-14 sm:h-16 sm:w-16"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
  </svg>
);

/* ================= MAIN ================= */

const Others = () => (
  <div
    className={`ot-root flex min-h-screen items-center justify-center bg-[#06121F] px-4 pb-10 text-[#F5EBCB] ${OFFSET}`}
  >
    <style>{styles}</style>

    <section
      className="ot-rise relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-[#C9A24B]/60 p-8 text-center shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] sm:p-10"
      style={HERO_BG}
    >
      <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-[#C9A24B]/25" />
      <span className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full border border-[#C9A24B]/20" />

      <span className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#C9A24B]/60 bg-[#0A2133] text-[#F2D98F] sm:h-32 sm:w-32">
        <span className="ot-spin">
          <GearIcon />
        </span>
      </span>

      <h1 className="relative mt-6 text-[30px] font-bold leading-tight text-[#F2D98F] sm:text-[36px]">
        আপডেট চলছে
      </h1>

      <div className="relative mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="ot-dot h-2.5 w-2.5 rounded-full bg-[#C9A24B]"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </section>
  </div>
);

export default Others;
