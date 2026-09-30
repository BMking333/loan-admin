// src/pages/ChangePassword.jsx
import React, { useState } from "react";
import api from "../services/api";

// ⚠️ আপনার ব্যাকএন্ডের endpoint ও field-এর নাম অনুযায়ী বদলে নিন
const ENDPOINT = "/auth/change-password";
const FIELD_NAMES = {
  current: "old_password",
  next: "new_password",
};

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("access")}`,
});

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
const STRENGTH_COLOR = ["bg-red-500", "bg-red-500", "bg-yellow-500", "bg-[#D4AF37]", "bg-green-500"];

const PasswordField = ({ label, name, value, onChange, autoComplete, error }) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm text-gray-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`w-full rounded-lg bg-[#1a2942] py-3 pl-3 pr-16 text-sm text-white outline-none border transition
            ${error ? "border-red-500" : "border-transparent focus:border-[#D4AF37]"}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute inset-y-0 right-0 px-3 text-xs text-[#D4AF37] hover:text-[#f0cf62]"
          aria-label={show ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
        >
          {show ? "লুকান" : "দেখান"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

const ChangePassword = () => {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const strength = getStrength(form.next);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setNotice(null);
  };

  const validate = () => {
    const e = {};
    if (!form.current) e.current = "বর্তমান পাসওয়ার্ড দিন";
    if (!form.next) e.next = "নতুন পাসওয়ার্ড দিন";
    else if (form.next.length < 6) e.next = "কমপক্ষে ৬ অক্ষর হতে হবে";
    else if (form.next === form.current) e.next = "নতুন পাসওয়ার্ড আগেরটার মতো হতে পারবে না";
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

      const body = new URLSearchParams();
      body.append(FIELD_NAMES.current, form.current);
      body.append(FIELD_NAMES.next, form.next);

      await api.post(ENDPOINT, body, {
        headers: {
          ...authHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      setForm({ current: "", next: "", confirm: "" });
      setNotice({ type: "ok", text: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে" });
    } catch (err) {
      console.error(err);
      setNotice({
        type: "err",
        text: err.response?.data?.detail || "পাসওয়ার্ড পরিবর্তন করা যায়নি",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      {/* মোবাইলে উপরে নেভ বারের জায়গা, ডেস্কটপে বাঁ দিকে সাইডবারের জায়গা */}
      <div className="px-4 pb-10 pt-16 md:ml-64 md:p-6">
        <div className="mx-auto w-full max-w-md md:mt-10">
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0f1b2d] p-5 shadow-lg sm:p-7">
            {/* HEADER */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-[#D4AF37] sm:text-2xl">🔒 পাসওয়ার্ড পরিবর্তন</h1>
              <p className="mt-1 text-sm text-gray-400">
                নিরাপত্তার জন্য একটি শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।
              </p>
            </div>

            {/* NOTICE */}
            {notice && (
              <div
                role="alert"
                className={`mb-5 rounded-lg px-3 py-2.5 text-sm ${
                  notice.type === "ok"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {notice.type === "ok" ? "✅ " : "⚠️ "}
                {notice.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <PasswordField
                label="বর্তমান পাসওয়ার্ড"
                name="current"
                value={form.current}
                onChange={handleChange}
                autoComplete="current-password"
                error={errors.current}
              />

              <div>
                <PasswordField
                  label="নতুন পাসওয়ার্ড"
                  name="next"
                  value={form.next}
                  onChange={handleChange}
                  autoComplete="new-password"
                  error={errors.next}
                />

                {form.next && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            strength >= i ? STRENGTH_COLOR[strength] : "bg-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{STRENGTH_LABEL[strength]}</p>
                  </div>
                )}
              </div>

              <PasswordField
                label="নতুন পাসওয়ার্ড নিশ্চিত করুন"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                autoComplete="new-password"
                error={errors.confirm}
              />

              <button
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold transition
                  ${
                    loading
                      ? "cursor-not-allowed bg-[#D4AF37]/60 text-[#0b1220]"
                      : "bg-[#D4AF37] text-[#0b1220] hover:bg-[#e3c050] active:scale-[0.98]"
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
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
