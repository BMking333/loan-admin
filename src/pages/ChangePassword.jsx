// src/pages/ChangePassword.jsx
import React, { useState } from "react";
import api from "../services/api";

// ⚠️ আপনার রাউটারের prefix থাকলে এখানে বদলে নিন (যেমন "/auth/admin/user-reset-password")
const ENDPOINT = "/admin/user-reset-password";

const getToken = () =>
  localStorage.getItem("access") ||
  localStorage.getItem("token") ||
  localStorage.getItem("access_token");

// বাংলা ডিজিট -> ইংরেজি ডিজিট
const bnToEn = (str) =>
  str.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d).toString());

/* ================= STYLES ================= */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap');

.cp-root {
  font-family: 'Noto Sans Bengali', 'Hind Siliguri', 'Kalpurush', system-ui, sans-serif;
  font-feature-settings: "liga" 1, "clig" 1, "rlig" 1, "calt" 1;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  line-height: 1.7;
}
.cp-root h1, .cp-root h2, .cp-root p, .cp-root span, .cp-root button, .cp-root label {
  letter-spacing: 0 !important;
}
.cp-root input { font-size: 16px; }
@keyframes cp-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.cp-rise { animation: cp-rise .3s ease-out both; }
@media (prefers-reduced-motion: reduce) { .cp-rise { animation: none; } }
`;

/* ===== THEME: dark navy + gold ===== */
const OFFSET = "pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-0 md:pl-64";

const HERO_BG = {
  background:
    "radial-gradient(700px 320px at 10% -30%, #1E5A74 0%, transparent 60%), linear-gradient(160deg, #0F3045 0%, #071826 70%)",
};

const GOLD_BTN =
  "bg-gradient-to-b from-[#E8CB7E] via-[#C9A24B] to-[#B48A34] text-[#1B1405] " +
  "shadow-[0_10px_24px_-8px_rgba(201,162,75,0.7),inset_0_1px_0_rgba(255,255,255,0.5)] " +
  "hover:brightness-105 active:translate-y-px " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C9A24B]/40 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/* ================= ICONS ================= */
const Svg = ({ children, className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const PhoneIcon = () => (
  <Svg>
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </Svg>
);

const LockIcon = () => (
  <Svg>
    <rect x="4" y="11" width="16" height="10" rx="2.5" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);

const ShieldIcon = () => (
  <Svg className="h-7 w-7" strokeWidth={1.9}>
    <path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);

const EyeIcon = ({ off }) => (
  <Svg>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </Svg>
);

/* ================= INPUT FIELD ================= */
const Field = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon,
  error,
  autoComplete,
  placeholder,
  inputMode,
  maxLength,
  isPassword = false,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[15px] font-semibold text-[#F2D98F]/90">
        {label}
      </label>

      <div className="group relative">
        <span
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
            error ? "text-[#FF8A8A]" : "text-[#7F90A0] group-focus-within:text-[#F2D98F]"
          }`}
        >
          {icon}
        </span>

        <input
          id={name}
          name={name}
          type={isPassword ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={error ? "true" : "false"}
          className={`w-full min-w-0 rounded-xl border-2 bg-[#0A1D2E] py-3.5 pl-12 ${
            isPassword ? "pr-14" : "pr-4"
          } font-medium text-[#F5EBCB] outline-none transition placeholder:text-[#7F90A0] focus:ring-4 ${
            error
              ? "border-[#D64545]/70 focus:border-[#D64545] focus:ring-[#D64545]/20"
              : "border-[#C9A24B]/30 focus:border-[#C9A24B] focus:ring-[#C9A24B]/20"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#F2D98F] transition hover:bg-[#C9A24B]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B]/50"
            aria-label={show ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
          >
            <EyeIcon off={show} />
          </button>
        )}
      </div>

      {error && <p className="mt-1.5 text-[14px] font-semibold text-[#FF8A8A]">{error}</p>}
    </div>
  );
};

/* ================= PAGE ================= */
const ChangePassword = () => {
  const [form, setForm] = useState({ phone: "", next: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [done, setDone] = useState(null);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "phone") {
      value = bnToEn(value).replace(/[^\d+]/g, "");
    }

    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setNotice(null);
  };

  const validate = () => {
    const e = {};

    if (!form.phone) e.phone = "ইউজারের মোবাইল নাম্বার দিন";
    else if (form.phone.replace(/\D/g, "").length < 10) e.phone = "সঠিক মোবাইল নাম্বার দিন";

    if (!form.next) e.next = "নতুন পাসওয়ার্ড দিন";
    else if (form.next.length < 6) e.next = "কমপক্ষে ৬ অক্ষর হতে হবে";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setNotice(null);
      setDone(null);

      const body = new URLSearchParams();
      body.append("phone_number", form.phone.trim());
      body.append("new_password", form.next);

      await api.post(ENDPOINT, body, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      setDone(form.phone.trim());
      setForm({ phone: "", next: "" });
      setNotice({ type: "ok", text: "ইউজারের পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে" });
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      let text = err.response?.data?.detail || "পাসওয়ার্ড পরিবর্তন করা যায়নি";

      if (status === 404) text = "এই নাম্বারে কোনো ইউজার পাওয়া যায়নি";
      else if (status === 403) text = "শুধু অ্যাডমিন এই কাজ করতে পারবে";
      else if (status === 401) text = "সেশন শেষ হয়েছে, আবার লগইন করুন";

      setNotice({
        type: "err",
        text: typeof text === "string" ? text : "পাসওয়ার্ড পরিবর্তন করা যায়নি",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div lang="bn" className={`cp-root min-h-screen bg-[#06121F] pb-16 text-[#F5EBCB] ${OFFSET}`}>
      <style>{styles}</style>

      <div className="mx-auto max-w-md px-4 pt-6 md:pt-12">
        {/* ===== HEADER ===== */}
        <section
          className="cp-rise relative overflow-hidden rounded-3xl border border-[#C9A24B]/50 p-6 text-center shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]"
          style={HERO_BG}
        >
          <span className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[#C9A24B]/25" />
          <div className="relative">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C9A24B]/60 bg-[#C9A24B]/15 text-[#F2D98F]">
              <ShieldIcon />
            </span>
            <h1 className="mt-4 text-[22px] font-bold text-[#F2D98F]">ইউজার পাসওয়ার্ড রিসেট</h1>
            <p className="mt-1.5 text-[15px] leading-relaxed text-white/75">
              মোবাইল নাম্বার ও নতুন পাসওয়ার্ড দিলেই হবে। পুরনো পাসওয়ার্ড লাগবে না।
            </p>
          </div>
        </section>

        {/* ===== FORM CARD ===== */}
        <section className="cp-rise mt-5 rounded-3xl border-2 border-[#C9A24B]/30 bg-[#0D2538] p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.85)] sm:p-6">
          {notice && (
            <div
              role="alert"
              className={`mb-5 rounded-xl border px-3.5 py-3 text-[15px] font-semibold ${
                notice.type === "ok"
                  ? "border-[#1F9D6B]/50 bg-[#0C3A2A] text-[#9FE5C4]"
                  : "border-[#D64545]/50 bg-[#3A1417] text-[#FFB3B3]"
              }`}
            >
              <p>
                {notice.type === "ok" ? "✅ " : "⚠️ "}
                {notice.text}
              </p>
              {notice.type === "ok" && done && (
                <p className="mt-0.5 font-mono text-[13px] font-medium text-[#9FE5C4]/80">নাম্বার: {done}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field
              label="ইউজারের মোবাইল নাম্বার"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              placeholder="01XXXXXXXXX"
              maxLength={15}
              value={form.phone}
              onChange={handleChange}
              icon={<PhoneIcon />}
              error={errors.phone}
            />

            <Field
              label="নতুন পাসওয়ার্ড"
              name="next"
              isPassword
              autoComplete="new-password"
              placeholder="নতুন পাসওয়ার্ড লিখুন"
              value={form.next}
              onChange={handleChange}
              icon={<LockIcon />}
              error={errors.next}
            />

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[17px] font-bold transition ${GOLD_BTN}`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  আপডেট হচ্ছে...
                </>
              ) : (
                "পাসওয়ার্ড পরিবর্তন করুন"
              )}
            </button>
          </form>
        </section>

        <p className="mt-5 text-center text-[13px] font-medium text-[#A9B7C2]">
          এই পেজ শুধু অ্যাডমিনের জন্য
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
