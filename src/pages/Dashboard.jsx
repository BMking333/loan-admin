// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api";

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

// প্রিমিয়াম ব্যাংক কার্ডের ব্যাকগ্রাউন্ড
const PREMIUM_CARD_BG = {
  background:
    "radial-gradient(420px 220px at 100% 0%, rgba(242,217,143,0.16) 0%, transparent 60%), " +
    "radial-gradient(380px 260px at 0% 110%, rgba(30,90,116,0.55) 0%, transparent 65%), " +
    "linear-gradient(145deg, #12344C 0%, #0A2133 55%, #061523 100%)",
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
const UsersIcon = () => (
  <Svg>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
  </Svg>
);
const ContactlessIcon = () => (
  <Svg className="w-7 h-7">
    <path d="M8.5 8.5a5 5 0 0 1 0 7" />
    <path d="M12 6a8.5 8.5 0 0 1 0 12" />
    <path d="M15.5 3.5a12 12 0 0 1 0 17" />
  </Svg>
);

/* ===== সোনালি চিপ ===== */
const ChipIcon = () => (
  <svg viewBox="0 0 48 36" className="h-9 w-12" aria-hidden="true">
    <defs>
      <linearGradient id="chipGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F2D98F" />
        <stop offset="0.55" stopColor="#C9A24B" />
        <stop offset="1" stopColor="#9B7424" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="46" height="34" rx="6" fill="url(#chipGold)" />
    <g stroke="#7A5A17" strokeWidth="1" fill="none" opacity="0.7">
      <path d="M1 12h14M1 24h14M33 12h14M33 24h14" />
      <path d="M15 1v34M33 1v34" />
      <rect x="15" y="12" width="18" height="12" rx="3" />
    </g>
  </svg>
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

// 01712345678 -> 01712 345678
const prettyNumber = (n) => {
  const s = String(n || "").replace(/\s/g, "");
  return /^\d{11}$/.test(s) ? `${s.slice(0, 5)} ${s.slice(5)}` : s || "—";
};

const formatAmount = (value) => {
  if (value >= 100000) return `${toBn(value / 100000)} লক্ষ`;
  if (value >= 1000) return `${toBn(value / 1000)} হাজার`;
  return toBn(value);
};

const fmt = (n) => Math.round(n).toLocaleString("en-US");

const authHeaders = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  return { Authorization: token ? `Bearer ${token}` : "" };
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

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

  // রেজিস্ট্রেশন পরিসংখ্যান
  const [users, setUsers] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [statsHidden, setStatsHidden] = useState(false); // অ্যাডমিন না হলে লুকানো থাকবে

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

  /* ---------- fetch registrations ---------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/auth/admin/users", { headers: authHeaders() });
        if (!alive) return;
        setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
        setStatsError(false);
      } catch (err) {
        if (!alive) return;
        const s = err?.response?.status;
        if (s === 401 || s === 403) setStatsHidden(true);
        else setStatsError(true);
      } finally {
        if (alive) setStatsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* ---------- registration counts ---------- */
  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
    const yesterday = addDays(today, -1);
    // সপ্তাহ শুরু শনিবার
    const weekStart = addDays(today, -((today.getDay() + 1) % 7));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const c = { today: 0, yesterday: 0, week: 0, month: 0 };
    users.forEach((u) => {
      const d = new Date(u.created_at);
      if (!u.created_at || Number.isNaN(d.getTime())) return;
      if (d >= today && d < tomorrow) c.today += 1;
      if (d >= yesterday && d < today) c.yesterday += 1;
      if (d >= weekStart && d < tomorrow) c.week += 1;
      if (d >= monthStart && d < tomorrow) c.month += 1;
    });
    return c;
  }, [users]);

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

  const STAT_TILES = [
    { label: "আজ", value: stats.today, accent: true },
    { label: "গতকাল", value: stats.yesterday },
    { label: "এই সপ্তাহে", value: stats.week },
    { label: "এই মাসে", value: stats.month },
  ];

  return (
    <div className={`db-root min-h-screen bg-[#06121F] pb-16 text-[#F5EBCB] ${OFFSET}`}>
      <style>{styles}</style>

      <div className="mx-auto max-w-4xl space-y-6 px-4 pt-5 md:px-6 md:pt-8">
        {/* ================= REGISTRATIONS ================= */}
        {!statsHidden && (
          <section className="db-rise">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A24B]/15 text-[#F2D98F]">
                <UsersIcon />
              </span>
              <h2 className="text-[20px] font-bold text-[#F2D98F]">রেজিস্ট্রেশন</h2>
            </div>

            {statsError ? (
              <div className="rounded-2xl border-2 border-[#EDA9A9] bg-[#FDECEC] p-4 text-[16px] font-bold text-[#961F1F]">
                রেজিস্ট্রেশনের তথ্য লোড করা যায়নি।
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STAT_TILES.map((t) => (
                  <div
                    key={t.label}
                    className={`rounded-2xl border-2 p-4 text-center ${
                      t.accent
                        ? "border-[#C9A24B]/70 bg-[#12344C]"
                        : "border-[#C9A24B]/30 bg-[#0D2538]"
                    }`}
                  >
                    <p className="text-[15px] font-medium text-[#A9B7C2]">{t.label}</p>
                    {statsLoading ? (
                      <div className="db-skel mx-auto mt-1 h-9 w-12 rounded-lg bg-[#16384F]" />
                    ) : (
                      <p className="text-[32px] font-bold leading-tight text-[#F2D98F]">
                        {toBn(t.value)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================= PAYMENT NUMBERS (একটাই প্রিমিয়াম কার্ড) ================= */}
        <section className="db-rise" style={{ animationDelay: "60ms" }}>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A24B]/15 text-[#F2D98F]">
              <WalletIcon />
            </span>
            <h2 className="text-[20px] font-bold text-[#F2D98F]">এজেন্ট পেমেন্ট নম্বর</h2>
          </div>

          {/* loading skeleton */}
          {payLoading && (
            <div className="db-skel h-[300px] rounded-[28px] border border-[#C9A24B]/20 bg-[#0D2538]" />
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

          {/* premium card */}
          {!payLoading && !payError && paymentMethods.length > 0 && (
            <div className="mx-auto max-w-xl rounded-[28px] bg-gradient-to-br from-[#F2D98F] via-[#C9A24B] to-[#7A5A17] p-[1.5px] shadow-[0_30px_70px_-28px_rgba(0,0,0,0.95),0_0_0_1px_rgba(201,162,75,0.15)]">
              <article
                className="relative overflow-hidden rounded-[26.5px] p-5 sm:p-6"
                style={PREMIUM_CARD_BG}
              >
                {/* সাজসজ্জার বৃত্ত */}
                <span className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full border border-[#F2D98F]/15" />
                <span className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full border border-[#F2D98F]/15" />

                {/* top: chip + contactless */}
                <div className="relative flex items-start justify-between">
                  <ChipIcon />
                  <span className="text-[#F2D98F]/80">
                    <ContactlessIcon />
                  </span>
                </div>

                <p className="relative mt-4 text-[14px] font-medium text-[#A9B7C2]">
                  এজেন্ট পেমেন্ট নম্বর
                </p>

                {/* rows */}
                <div className="relative mt-2 divide-y divide-[#C9A24B]/25">
                  {paymentMethods.map((item) => {
                    const k = keyOf(item);
                    return (
                      <div key={item.id} className="py-4 first:pt-2 last:pb-1">
                        <div className="flex items-center gap-3.5">
                          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.7)]">
                            <img
                              src={LOGOS[k]}
                              alt={item.method_name}
                              className="h-full w-full object-contain"
                            />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[16px] font-bold text-[#F5EBCB]">{BN_NAMES[k]}</p>
                            <p className="truncate font-mono text-[23px] font-bold tracking-[0.12em] text-[#F2D98F] sm:text-[26px]">
                              {prettyNumber(item.account_number)}
                            </p>
                          </div>
                        </div>
                        {item.description && (
                          <p className="mt-2 whitespace-pre-line text-[15px] font-medium leading-[1.75] text-[#E6DCC0]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
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
