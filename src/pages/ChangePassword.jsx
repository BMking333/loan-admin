// src/pages/ChangePassword.jsx
import React, { useState } from "react";
import api from "../services/api";

// ⚠️ আপনার রাউটারের prefix থাকলে এখানে বদলে নিন (যেমন "/auth/admin/user-reset-password")
const ENDPOINT = "/admin/user-reset-password";

// টোকেন আপনার Login পেজে যে key-তে সেভ করেছেন সেটা দিন
const getToken = () =>
  localStorage.getItem("access") ||
  localStorage.getItem("token") ||
  localStorage.getItem("access_token");

// পাসওয়ার্ডের শক্তি: 0–4
const getStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const STRENGTH_LABEL = ["খুব দুর্বল", "দুর্বল", "মোটামুটি", "ভালো", "শক্তিশালী"];
const STRENGTH_COLOR = [
  "bg-red-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-[#D4AF37]",
  "bg-green-500",
];

// বাংলা ডিজিট -> ইংরেজি ডিজিট
const bnToEn = (str) =>
  str.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d).toString());

/* ---------------- Icons ---------------- */
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372a1.125 1.125 0 00-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293a1.125 1.125 0 01-1.21.38 12.035 12.035 0 01-7.143-7.143 1.125 1.125 0 01.38-1.21l1.293-.97a1.125 1.125 0 00.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
    />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);

/* ---------------- Input Field ---------------- */
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
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="group relative">
        <span
          className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors ${
            error ? "text-red-400" : "text-gray-500 group-focus-within:text-[#D4AF37]"
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
          className={`w-full rounded-xl border bg-[#14233a] py-3.5 pl-11 ${
            isPassword ? "pr-20" : "pr-4"
          } text-[15px] text-white placeholder-gray-500 outline-none transition
            ${
              error
                ? "border-red-500/70 focus:ring-2 focus:ring-red-500/20"
                : "border-white/5 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
            }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute inset-y-0 right-0 px-4 text-xs font-medium text-[#D4AF37] hover:text-[#f0cf62]"
            aria-label={show ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
          >
            {show ? "লুকান" : "দেখান"}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
};

/* ---------------- Page ---------------- */
const ChangePassword = () => {
  const [form, setForm] = useState({ phone: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [done, setDone] = useState(null); // সফল হলে কার পাসওয়ার্ড বদলেছে

  const strength = getStrength(form.next);

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
    else if (form.phone.replace(/\D/g, "").length < 10)
      e.phone = "সঠিক মোবাইল নাম্বার দিন";

    if (!form.next) e.next = "নতুন পাসওয়ার্ড দিন";
    else if (form.next.length < 6) e.next = "কমপক্ষে ৬ অক্ষর হতে হবে";

    if (!form.confirm) e.confirm = "পাসওয়ার্ড আবার লিখুন";
    else if (form.confirm !== form.next) e.confirm = "পাসওয়ার্ড মিলছে না";

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
      setForm({ phone: "", next: "", confirm: "" });
      setNotice({ type: "ok", text: "ইউজারের পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে" });
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      let text = err.response?.data?.detail || "পাসওয়ার্ড পরিবর্তন করা যায়নি";

      if (status === 404) text = "এই নাম্বারে কোনো ইউজার পাওয়া যায়নি";
      else if (status === 403) text = "শুধু অ্যাডমিন এই কাজ করতে পারবে";
      else if (status === 401) text = "সেশন শেষ হয়েছে, আবার লগইন করুন";

      setNotice({ type: "err", text: typeof text === "string" ? text : "পাসওয়ার্ড পরিবর্তন করা যায়নি" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1220] text-white">
      {/* ব্যাকগ্রাউন্ড গ্লো */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

      {/* মোবাইলে উপরে নেভ বারের জায়গা, ডেস্কটপে বাঁ দিকে সাইডবারের জায়গা */}
      <div className="relative px-4 pb-12 pt-20 md:ml-64 md:p-8">
        <div className="mx-auto w-full max-w-md md:mt-8">
          {/* CARD */}
          <div className="rounded-3xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#12213a] to-[#0d1829] p-5 shadow-2xl shadow-black/40 sm:p-8">
            {/* HEADER */}
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
                <ShieldIcon />
              </div>
              <h1 className="text-xl font-bold text-[#D4AF37] sm:text-2xl">
                ইউজার পাসওয়ার্ড রিসেট
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                ইউজারের মোবাইল নাম্বার দিয়ে নতুন পাসওয়ার্ড সেট করুন। পুরনো পাসওয়ার্ড লাগবে না।
              </p>
            </div>

            {/* NOTICE */}
            {notice && (
              <div
                role="alert"
                className={`mb-5 flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${
                  notice.type === "ok"
                    ? "border-green-500/20 bg-green-500/10 text-green-400"
                    : "border-red-500/20 bg-red-500/10 text-red-400"
                }`}
              >
                <span>{notice.type === "ok" ? "✅" : "⚠️"}</span>
                <div>
                  <p>{notice.text}</p>
                  {notice.type === "ok" && done && (
                    <p className="mt-0.5 text-xs text-green-300/80">নাম্বার: {done}</p>
                  )}
                </div>
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

              <div>
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

                {form.next && (
                  <div className="mt-2.5">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            strength >= i ? STRENGTH_COLOR[strength] : "bg-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400">{STRENGTH_LABEL[strength]}</p>
                  </div>
                )}
              </div>

              <Field
                label="নতুন পাসওয়ার্ড নিশ্চিত করুন"
                name="confirm"
                isPassword
                autoComplete="new-password"
                placeholder="পাসওয়ার্ড আবার লিখুন"
                value={form.confirm}
                onChange={handleChange}
                icon={<LockIcon />}
                error={errors.confirm}
              />

              <button
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold transition
                  ${
                    loading
                      ? "cursor-not-allowed bg-[#D4AF37]/60 text-[#0b1220]"
                      : "bg-gradient-to-r from-[#D4AF37] to-[#f0cf62] text-[#0b1220] shadow-lg shadow-[#D4AF37]/20 hover:brightness-105 active:scale-[0.98]"
                  }`}
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
          </div>

          <p className="mt-5 text-center text-xs text-gray-500">
            🔐 এই পেজ শুধু অ্যাডমিনের জন্য
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
