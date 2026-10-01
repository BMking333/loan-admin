// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";

import BKash from "../assets/icons/BKash.png";
import Nagad from "../assets/icons/Nagad.png";

/* ================= STYLES ================= */

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

.db-root {
  font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Kalpurush', system-ui, sans-serif;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -webkit-tap-highlight-color: transparent;
}
.db-root h1, .db-root h2, .db-root h3, .db-root p, .db-root span, .db-root button {
  letter-spacing: 0 !important;
}
@keyframes db-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.db-rise { animation: db-rise .35s ease-out both; }
@keyframes db-pulse { 0%,100% { opacity: .55; } 50% { opacity: .25; } }
.db-skel { animation: db-pulse 1.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .db-rise, .db-skel { animation: none; }
}
`;

/* ===== THEME: dark navy blue + gold =====
   page bg   #06121F   card #0D2538   deep #081A2B
   cream     #F5EBCB   muted #A9B7C2
   gold      #C9A24B   light gold #F2D98F
*/

// সাইডবার fixed — কনটেন্ট যেন তার নিচে না ঢোকে
const OFFSET = "pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-0 md:pl-64";

const HERO_BG = {
  background:
    "radial-gradient(700px 320px at 10% -30%, #1E5A74 0%, transparent 60%), linear-gradient(160deg, #0F3045 0%, #071826 70%)",
};

const GOLD_GRAD = "bg-gradient-to-b from-[#E8CB7E] via-[#C9A24B] to-[#B48A34] text-[#1B1405]";
const GOLD_SHADOW =
  "shadow-[0_10px_24px_-8px_rgba(201,162,75,0.7),inset_0_1px_0_rgba(255,255,255,0.5)]";

/* ================= ICONS ================= */

const Svg = ({ children, className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const WalletIcon = () => (
  <Svg>
    <rect x="2" y="5" width="20" height="14" rx="2.5" />
    <path d="M2 10h20M6 15h4" />
  </Svg>
);
const CalcIcon = () => (
  <Svg>
    <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
    <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
  </Svg>
);

/* ================= HELPERS ================= */

const API_ACTIVE =
  "https://loan.microfinancedevelopmentprojectbangladesh.com/paymentmethod/active";

// শুধু বিকাশ ও নগদ দেখানো হবে (রকেট ও ব্যাংক হাইড)
const SHOWN = ["bkash", "nagad"];
const BN_NAMES = { bkash: "বিকাশ", nagad: "নগদ" };
const LOGOS = { bkash: BKash, nagad: Nagad };

const keyOf = (item) => (item.method_name || "").trim().toLowerCase();

const toBn = (n) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

const formatAmount = (value) => {
  if (value >= 100000) return `${toBn(value / 100000)} লক্ষ`;
  if (value >= 1000) return `${toBn(value / 1000)} হাজার`;
  return toBn(value);
};

const fmt = (n) => Math.round(n).toLocaleString("en-US");

const MONTH_OPTIONS = [12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120];

const AMOUNT_OPTIONS = [
  50000, 100000, 150000, 200000, 300000, 400000,
  500000, 600000, 700000, 800000, 900000,
  1000000, 1500000, 2000000, 2500000, 3000000,
];

const INTEREST_RATE = 2.4;

/* ================= MAIN ================= */

const Dashboard = () => {
  const [months, setMonths] = useState(null);
  const [amount, setAmount] = useState(null);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [payLoading, setPayLoading] = useState(true);
  const [payError, setPayError] = useState(false);

  /* ---------- fetch active payment numbers ---------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(API_ACTIVE);
        if (!res.ok) throw new Error("bad status");
        const data = await res.json();
        if (!alive) return;
        const list = Array.isArray(data) ? data : [];
        // শুধু বিকাশ ও নগদ, বিকাশ আগে
        const filtered = list
          .filter((x) => SHOWN.includes(keyOf(x)))
          .sort((a, b) => SHOWN.indexOf(keyOf(a)) - SHOWN.indexOf(keyOf(b)));
        setPaymentMethods(filtered);
        setPayError(false);
      } catch (err) {
        if (alive) setPayError(true);
      } finally {
        if (alive) setPayLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* ---------- calculation ---------- */
  const result = useMemo(() => {
    if (!months || !amount) return null;
    const yearlyInterest = (amount * INTEREST_RATE) / 100;
    const totalInterest = (yearlyInterest / 12) * months;
    const totalPayable = amount + totalInterest;
    return {
      monthly: totalPayable / months,
      total: totalPayable,
      interest: totalInterest,
    };
  }, [months, amount]);

  return (
    <div className={`db-root min-h-screen bg-[#06121F] pb-16 text-[#F5EBCB] ${OFFSET}`}>
      <style>{styles}</style>

      <div className="mx-auto max-w-4xl space-y-6 px-4 pt-5 md:px-6 md:pt-8">
        {/* ================= HERO ================= */}
        <section
          className="db-rise relative overflow-hidden rounded-3xl border border-[#C9A24B]/50 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] sm:p-6"
          style={HERO_BG}
        >
          <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-[#C9A24B]/25" />
          <span className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 rounded-full border border-[#C9A24B]/20" />
          <p className="text-[15px] font-medium text-[#F2D98F]/90">স্বাগতম</p>
          <h1 className="mt-0.5 text-[26px] font-bold leading-tight text-white sm:text-[30px]">
            ঋণ ড্যাশবোর্ড
          </h1>
          <p className="mt-1.5 max-w-md text-[16px] font-medium text-white/80">
            এজেন্টের পেমেন্ট নম্বর দেখুন এবং মাস ও টাকা বেছে কিস্তির হিসাব জেনে নিন।
          </p>
        </section>

        {/* ================= PAYMENT NUMBERS ================= */}
        <section className="db-rise" style={{ animationDelay: "60ms" }}>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A24B]/15 text-[#F2D98F]">
              <WalletIcon />
            </span>
            <h2 className="text-[20px] font-bold text-[#F2D98F]">এজেন্ট পেমেন্ট নম্বর</h2>
          </div>

          {/* loading skeleton */}
          {payLoading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="db-skel h-[118px] rounded-3xl border border-[#C9A24B]/20 bg-[#0D2538]"
                />
              ))}
            </div>
          )}

          {/* error */}
          {!payLoading && payError && (
            <div className="rounded-2xl border-2 border-[#EDA9A9] bg-[#FDECEC] p-4 text-[16px] font-bold text-[#961F1F]">
              পেমেন্ট নম্বর লোড করা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।
            </div>
          )}

          {/* empty */}
          {!payLoading && !payError && paymentMethods.length === 0 && (
            <div className="rounded-2xl border-2 border-[#C9A24B]/50 bg-[#0D2538] p-5 text-center text-[16px] font-medium text-[#D8CFB4]">
              এখনো কোনো পেমেন্ট নম্বর যোগ করা হয়নি।
            </div>
          )}

          {/* cards: শুধু বিকাশ ও নগদ */}
          {!payLoading && !payError && paymentMethods.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {paymentMethods.map((item) => {
                const k = keyOf(item);
                return (
                  <article
                    key={item.id}
                    className="rounded-3xl border-2 border-[#C9A24B]/40 bg-[#0D2538] p-4 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.6)]">
                        <img
                          src={LOGOS[k]}
                          alt={item.method_name}
                          className="h-full w-full object-contain"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[20px] font-bold text-[#F5EBCB]">
                          {BN_NAMES[k]}
                        </h3>
                        <p className="text-[14px] font-medium text-[#A9B7C2]">মোবাইল ব্যাংকিং</p>
                      </div>
                    </div>

                    <div className="mt-3.5 rounded-2xl border border-[#C9A24B]/30 bg-[#081A2B] px-4 py-3">
                      <p className="text-[13px] font-medium text-[#A9B7C2]">নম্বর</p>
                      <p className="truncate font-mono text-[20px] font-bold tracking-wider text-[#F2D98F]">
                        {item.account_number || "—"}
                      </p>
                    </div>

                    {item.description && (
                      <p className="mt-3 whitespace-pre-line text-[15px] font-medium leading-[1.75] text-[#E6DCC0]">
                        {item.description}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ================= CALCULATOR ================= */}
        <section className="db-rise space-y-5" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A24B]/15 text-[#F2D98F]">
              <CalcIcon />
            </span>
            <h2 className="text-[20px] font-bold text-[#F2D98F]">কিস্তির হিসাব</h2>
          </div>

          {/* MONTH */}
          <div className="rounded-3xl border-2 border-[#C9A24B]/30 bg-[#0D2538] p-4 sm:p-5">
            <h3 className="mb-3 text-[17px] font-bold text-[#F5EBCB]">মাস নির্বাচন</h3>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {MONTH_OPTIONS.map((m) => {
                const on = months === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    aria-pressed={on}
                    className={`min-h-[48px] rounded-xl border-2 px-2 text-[16px] font-bold transition active:scale-95 ${
                      on
                        ? `border-transparent ${GOLD_GRAD} ${GOLD_SHADOW}`
                        : "border-[#C9A24B]/30 bg-[#0A1D2E] text-[#F5EBCB] hover:border-[#C9A24B]"
                    }`}
                  >
                    {toBn(m)} মাস
                  </button>
                );
              })}
            </div>
          </div>

          {/* AMOUNT */}
          <div className="rounded-3xl border-2 border-[#C9A24B]/30 bg-[#0D2538] p-4 sm:p-5">
            <h3 className="mb-3 text-[17px] font-bold text-[#F5EBCB]">টাকা নির্বাচন</h3>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {AMOUNT_OPTIONS.map((a) => {
                const on = amount === a;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmount(a)}
                    aria-pressed={on}
                    className={`min-h-[48px] rounded-xl border-2 px-2 text-[16px] font-bold transition active:scale-95 ${
                      on
                        ? `border-transparent ${GOLD_GRAD} ${GOLD_SHADOW}`
                        : "border-[#C9A24B]/30 bg-[#0A1D2E] text-[#F5EBCB] hover:border-[#C9A24B]"
                    }`}
                  >
                    {formatAmount(a)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RESULT */}
          <div
            className="overflow-hidden rounded-3xl border-2 border-[#C9A24B]/60 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]"
            style={HERO_BG}
          >
            <div className="p-5 sm:p-6">
              <h3 className="text-[17px] font-bold text-[#F2D98F]">ঋণের হিসাব</h3>

              {result ? (
                <>
                  <div className="mt-3 rounded-2xl border border-[#C9A24B]/40 bg-black/25 p-4 text-center">
                    <p className="text-[15px] font-medium text-white/80">মাসিক কিস্তি</p>
                    <p className="text-[38px] font-bold leading-tight text-[#F2D98F] sm:text-[44px]">
                      ৳ {fmt(result.monthly)}
                    </p>
                  </div>

                  <dl className="mt-4 divide-y divide-white/10 text-[16px]">
                    <Row label="ঋণের পরিমাণ" value={`৳ ${fmt(amount)}`} />
                    <Row label="সময়" value={`${toBn(months)} মাস`} />
                    <Row label="বার্ষিক সুদ" value={`${toBn(INTEREST_RATE)}%`} />
                    <Row label="মোট সুদ" value={`৳ ${fmt(result.interest)}`} />
                    <Row label="মোট পরিশোধ" value={`৳ ${fmt(result.total)}`} strong />
                  </dl>
                </>
              ) : (
                <p className="mt-3 rounded-2xl border border-dashed border-[#C9A24B]/40 p-4 text-center text-[16px] font-medium text-white/75">
                  আগে মাস ও টাকা নির্বাচন করুন
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

/* ================= SMALL PARTS ================= */

const Row = ({ label, value, strong }) => (
  <div className="flex items-center justify-between gap-3 py-2.5">
    <dt className="font-medium text-white/80">{label}</dt>
    <dd className={`font-bold ${strong ? "text-[20px] text-[#F2D98F]" : "text-white"}`}>
      {value}
    </dd>
  </div>
);

export default Dashboard;
