// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

/* ================= CONFIG ================= */

// লগইনের পর যে পেজে যাবে (আপনার রাউট অনুযায়ী বদলান)
const ADMIN_HOME = "/admin/dashboard";
const STAFF_HOME = "/admin/dashboard";

/* ================= STYLES ================= */

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

.al-root { font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Kalpurush', system-ui, sans-serif; }
.al-num { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; font-variant-numeric: tabular-nums; }
`;

const NAVY_BG =
  "radial-gradient(1100px 600px at 12% -10%, #17495a 0%, #0A1F2E 60%, #071723 100%)";

const GOLD_BTN =
  "bg-gradient-to-b from-[#E8CB7E] via-[#C9A24B] to-[#B48A34] text-[#1B1405] " +
  "shadow-[0_10px_24px_-8px_rgba(201,162,75,0.75),inset_0_1px_0_rgba(255,255,255,0.55)] " +
  "hover:brightness-105 active:translate-y-px " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C9A24B]/40 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

const INPUT =
  "w-full rounded-xl border border-[#E2DAC2] bg-[#FAF8F3] py-3.5 pl-12 pr-4 text-[16px] text-[#0A1F2E] " +
  "placeholder:text-[#9AA3AA] transition " +
  "focus:border-[#C9A24B] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#C9A24B]/25";

/* ================= ICONS ================= */

const Svg = ({ children, className = "w-5 h-5" }) => (
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

const ShieldIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);

const PhoneIcon = () => (
  <Svg>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </Svg>
);

const UserIcon = () => (
  <Svg>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" />
  </Svg>
);

const LockIcon = () => (
  <Svg>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);

const EyeIcon = ({ off }) => (
  <Svg>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </Svg>
);

const AlertIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v5M12 16.5h.01" />
  </Svg>
);

/* ================= MAIN ================= */

const AdminLogin = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("admin"); // "admin" | "staff"
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = role === "admin";

  const switchRole = (r) => {
    setRole(r);
    setIdentity("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identity.trim() || !password) {
      setError(
        isAdmin
          ? "ফোন নম্বর ও পাসওয়ার্ড দিন"
          : "ইউজারনেম ও পাসওয়ার্ড দিন"
      );
      return;
    }

    setLoading(true);

    try {
      const body = new URLSearchParams();
      if (isAdmin) {
        body.append("phone_number", identity.trim());
      } else {
        body.append("username", identity.trim());
      }
      body.append("password", password);

      const res = await api.post(`/auth/login/${role}`, body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = res.data?.access_token;
      if (!token) {
        setError("লগইন সম্পন্ন হয়নি, আবার চেষ্টা করুন");
        setLoading(false);
        return;
      }

      localStorage.setItem("access", token);
      localStorage.setItem("token", token);
      localStorage.setItem("role", res.data?.role || role);

      navigate(isAdmin ? ADMIN_HOME : STAFF_HOME, { replace: true });
    } catch (err) {
      console.log("ADMIN LOGIN ERROR:", err.response?.data);

      const d = err.response?.data?.detail;
      const status = err.response?.status;

      if (status === 401) {
        setError(
          isAdmin
            ? "ফোন নম্বর বা পাসওয়ার্ড ভুল হয়েছে"
            : "ইউজারনেম বা পাসওয়ার্ড ভুল হয়েছে"
        );
      } else if (typeof d === "string") {
        setError(d);
      } else if (Array.isArray(d)) {
        setError(d.map((x) => `${(x.loc || []).join(".")}: ${x.msg}`).join(", "));
      } else {
        setError("সার্ভার সমস্যা হয়েছে, আবার চেষ্টা করুন");
      }
      setLoading(false);
    }
  };

  return (
    <div
      className="al-root relative flex min-h-screen flex-col items-center justify-center px-4 py-10 text-white"
      style={{ background: NAVY_BG }}
    >
      <style>{styles}</style>

      {/* সোনালি হেয়ারলাইন */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E6C878] to-transparent" />

      <div className="w-full max-w-md">
        {/* ===== BRAND ===== */}
        <div className="mb-7 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C9A24B]/50 bg-white/10 text-[#E6C878] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)]">
            <ShieldIcon className="h-8 w-8" />
          </span>
          <h1 className="mt-4 text-[26px] font-bold tracking-tight">অ্যাডমিন পোর্টাল</h1>
          <p className="mt-1 text-[14px] text-white/70">ক্ষুদ্র ঋণ উন্নয়ন প্রজেক্ট</p>
        </div>

        {/* ===== CARD ===== */}
        <div className="rounded-3xl border border-[#C9A24B]/40 bg-white p-6 text-[#0A1F2E] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] sm:p-8">
          {/* Role switch */}
          <div
            role="tablist"
            aria-label="লগইনের ধরন"
            className="grid grid-cols-2 gap-1 rounded-xl bg-[#F3EEDD] p-1"
          >
            {[
              { key: "admin", label: "অ্যাডমিন" },
              { key: "staff", label: "স্টাফ" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={role === t.key}
                onClick={() => switchRole(t.key)}
                className={`rounded-lg py-2.5 text-[15px] font-semibold transition ${
                  role === t.key
                    ? "bg-[#0A1F2E] text-[#E6C878] shadow-[0_8px_20px_-8px_rgba(10,31,46,0.7)]"
                    : "text-[#5B6770] hover:text-[#0A1F2E]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {/* Identity */}
            <div>
              <label htmlFor="identity" className="mb-1.5 block text-[14px] font-semibold text-[#33404A]">
                {isAdmin ? "ফোন নম্বর" : "ইউজারনেম"}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#B07A10]">
                  {isAdmin ? <PhoneIcon /> : <UserIcon />}
                </span>
                <input
                  id="identity"
                  type={isAdmin ? "tel" : "text"}
                  inputMode={isAdmin ? "numeric" : "text"}
                  autoComplete="username"
                  value={identity}
                  onChange={(e) => {
                    setIdentity(e.target.value);
                    setError("");
                  }}
                  placeholder={isAdmin ? "01XXXXXXXXX" : "ইউজারনেম লিখুন"}
                  className={`${INPUT} ${isAdmin ? "al-num" : ""}`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[14px] font-semibold text-[#33404A]">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#B07A10]">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className={`${INPUT} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#5B6770] transition hover:text-[#0A1F2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B]"
                >
                  <EyeIcon off={showPass} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-[#F0C9C9] bg-[#FCEFEF] p-3.5 text-[15px] font-medium text-[#B02F2F]"
              >
                <AlertIcon />
                <p>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-[17px] font-semibold transition ${GOLD_BTN}`}
            >
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <span>যাচাই হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldIcon />
                  <span>নিরাপদে লগইন করুন</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[13px] leading-relaxed text-white/55">
          এই পোর্টালটি শুধুমাত্র অনুমোদিত অ্যাডমিন ও স্টাফদের জন্য। অননুমোদিত প্রবেশ নিষিদ্ধ।
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
