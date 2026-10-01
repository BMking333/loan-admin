// src/pages/Staff.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// আপনার auth রাউটারের prefix (login-as-user যেখানে "/auth/admin/login-as-user")
const AUTH = "/auth";

/* ================= STYLES ================= */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap');

.st-root {
  font-family: 'Noto Sans Bengali', 'Hind Siliguri', 'Kalpurush', system-ui, sans-serif;
  font-feature-settings: "liga" 1, "clig" 1, "rlig" 1, "calt" 1;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  line-height: 1.7;
}
.st-root h1, .st-root h2, .st-root h3, .st-root p, .st-root span, .st-root button, .st-root label {
  letter-spacing: 0 !important;
}
.st-root input { font-size: 16px; }
@keyframes st-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.st-rise { animation: st-rise .3s ease-out both; }
@media (prefers-reduced-motion: reduce) { .st-rise { animation: none; } }
`;

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

/* ================= HELPERS ================= */
const authHeaders = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  return { Authorization: token ? `Bearer ${token}` : "" };
};

// বাংলা ডিজিট -> ইংরেজি ডিজিট
const bnToEn = (str) => str.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d).toString());

const errText = (err, fallback) => {
  const s = err?.response?.status;
  const d = err?.response?.data?.detail;
  if (s === 403) return "শুধু অ্যাডমিন এই কাজ করতে পারবে";
  if (s === 401) return "সেশন শেষ হয়েছে, আবার লগইন করুন";
  if (d === "Phone already exists") return "এই মোবাইল নাম্বারে আগেই একজন আছে";
  if (d === "Staff not found") return "স্টাফ খুঁজে পাওয়া যায়নি";
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d[0]?.msg) return d[0].msg;
  return fallback;
};

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

const UserIcon = () => (
  <Svg>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </Svg>
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
const EyeIcon = ({ off }) => (
  <Svg>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </Svg>
);
const TeamIcon = () => (
  <Svg className="h-7 w-7" strokeWidth={1.9}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.4c2 .7 3.5 2.6 3.5 5.6" />
  </Svg>
);
const TrashIcon = () => (
  <Svg className="h-4 w-4">
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
);
const AlertIcon = () => (
  <Svg className="h-6 w-6">
    <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
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
  placeholder,
  autoComplete,
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
          placeholder={placeholder}
          autoComplete={autoComplete}
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
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#F2D98F] transition hover:bg-[#C9A24B]/15"
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
const EMPTY = { username: "", phone: "", password: "" };

const Staff = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [created, setCreated] = useState(null);

  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ---------- স্টাফ তালিকা ---------- */
  const loadList = useCallback(async () => {
    try {
      const res = await api.get("/user/kyc/staff-list", { headers: authHeaders() });
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }
    } finally {
      setListLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  /* ---------- ফর্ম ---------- */
  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "phone") value = bnToEn(value).replace(/[^\d+]/g, "");
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setNotice(null);
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "স্টাফের ইউজারনেম দিন";
    if (!form.phone) e.phone = "মোবাইল নাম্বার দিন";
    else if (form.phone.replace(/\D/g, "").length < 10) e.phone = "সঠিক মোবাইল নাম্বার দিন";
    if (!form.password) e.password = "পাসওয়ার্ড দিন";
    else if (form.password.length < 6) e.password = "কমপক্ষে ৬ অক্ষর হতে হবে";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setNotice(null);
      setCreated(null);

      const body = new URLSearchParams();
      body.append("username", form.username.trim());
      body.append("phone_number", form.phone.trim());
      body.append("password", form.password);

      const res = await api.post(`${AUTH}/admin/create-staff`, body, {
        headers: { ...authHeaders(), "Content-Type": "application/x-www-form-urlencoded" },
      });

      // তালিকায় সাথে সাথে যোগ করা (staff_id থাকায় মুছতেও পারবে)
      setList((l) => [
        { id: res.data?.staff_id, name: form.username.trim(), phone_number: form.phone.trim() },
        ...l,
      ]);
      setCreated({ username: form.username.trim(), phone: form.phone.trim() });
      setForm(EMPTY);
      setNotice({ type: "ok", text: "স্টাফ সফলভাবে তৈরি হয়েছে" });
    } catch (err) {
      console.error(err);
      setNotice({ type: "err", text: errText(err, "স্টাফ তৈরি করা যায়নি") });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- মুছে ফেলা ---------- */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`${AUTH}/admin/staff/${deleteTarget.id}`, { headers: authHeaders() });
      setList((l) => l.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotice({ type: "ok", text: "স্টাফ মুছে ফেলা হয়েছে" });
      setCreated(null);
    } catch (err) {
      setDeleteTarget(null);
      setNotice({ type: "err", text: errText(err, "মুছে ফেলা যায়নি") });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div lang="bn" className={`st-root min-h-screen bg-[#06121F] pb-16 text-[#F5EBCB] ${OFFSET}`}>
      <style>{styles}</style>

      <div className="mx-auto max-w-2xl px-4 pt-6 md:pt-10">
        {/* ===== HEADER ===== */}
        <section
          className="st-rise relative overflow-hidden rounded-3xl border border-[#C9A24B]/50 p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]"
          style={HERO_BG}
        >
          <span className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[#C9A24B]/25" />
          <div className="relative flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#C9A24B]/60 bg-[#C9A24B]/15 text-[#F2D98F]">
              <TeamIcon />
            </span>
            <div className="min-w-0">
              <h1 className="text-[22px] font-bold text-[#F2D98F]">স্টাফ ম্যানেজ</h1>
              <p className="text-[15px] leading-relaxed text-white/75">
                নতুন স্টাফ তৈরি করুন। স্টাফ ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন করবে।
              </p>
            </div>
          </div>
        </section>

        {/* ===== CREATE FORM ===== */}
        <section className="st-rise mt-5 rounded-3xl border-2 border-[#C9A24B]/30 bg-[#0D2538] p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.85)] sm:p-6">
          <h2 className="mb-4 text-[19px] font-bold text-[#F2D98F]">নতুন স্টাফ</h2>

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
              {notice.type === "ok" && created && (
                <p className="mt-1 text-[13px] font-medium text-[#9FE5C4]/80">
                  ইউজারনেম: <span className="font-mono">{created.username}</span> · মোবাইল:{" "}
                  <span className="font-mono">{created.phone}</span>
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field
              label="ইউজারনেম (লগইনে এটাই লাগবে)"
              name="username"
              autoComplete="off"
              placeholder="স্টাফের ইউজারনেম"
              value={form.username}
              onChange={handleChange}
              icon={<UserIcon />}
              error={errors.username}
            />

            <Field
              label="মোবাইল নাম্বার"
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
              label="পাসওয়ার্ড"
              name="password"
              isPassword
              autoComplete="new-password"
              placeholder="পাসওয়ার্ড লিখুন"
              value={form.password}
              onChange={handleChange}
              icon={<LockIcon />}
              error={errors.password}
            />

            <button
              type="submit"
              disabled={saving}
              className={`flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[17px] font-bold transition ${GOLD_BTN}`}
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  তৈরি হচ্ছে...
                </>
              ) : (
                "স্টাফ তৈরি করুন"
              )}
            </button>
          </form>
        </section>

        {/* ===== STAFF LIST ===== */}
        <section className="st-rise mt-5 rounded-3xl border-2 border-[#C9A24B]/30 bg-[#0D2538] p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.85)] sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[19px] font-bold text-[#F2D98F]">স্টাফ তালিকা</h2>
            <span className="rounded-full bg-[#C9A24B]/15 px-3 py-1 text-[14px] font-bold text-[#F2D98F]">
              {list.length} জন
            </span>
          </div>

          {listLoading ? (
            <div className="flex items-center justify-center gap-2.5 py-8 text-[16px] font-medium text-[#F2D98F]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              লোড হচ্ছে...
            </div>
          ) : list.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#C9A24B]/30 bg-[#081A2B] p-5 text-center text-[15px] font-medium text-[#A9B7C2]">
              এখনো কোনো স্টাফ নেই
            </p>
          ) : (
            <ul className="space-y-3">
              {list.map((s, i) => (
                <li
                  key={s.id ?? `${s.name}-${i}`}
                  className="flex items-center gap-3 rounded-2xl border border-[#C9A24B]/25 bg-[#081A2B] p-3.5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C9A24B]/50 bg-[#16384F] text-[17px] font-bold text-[#F2D98F]">
                    {(s.name || "?").trim().charAt(0).toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[17px] font-bold text-[#F5EBCB]">{s.name}</p>
                    {s.phone_number && (
                      <p className="truncate font-mono text-[14px] text-[#A9B7C2]">{s.phone_number}</p>
                    )}
                  </div>

                  {s.id != null && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(s)}
                      className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-[#D64545] px-3.5 py-2 text-[14px] font-bold text-[#FF8A8A] transition hover:bg-[#D64545] hover:text-white active:scale-95"
                    >
                      <TrashIcon />
                      মুছুন
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-5 text-center text-[13px] font-medium text-[#A9B7C2]">
          এই পেজ শুধু অ্যাডমিনের জন্য
        </p>
      </div>

      {/* ===== DELETE CONFIRM ===== */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border-2 border-[#C9A24B]/50 bg-[#0B2236] p-6 text-center shadow-2xl"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8CFCF] text-[#B92A2A]">
              <AlertIcon />
            </span>
            <h3 className="mt-3 text-[21px] font-bold text-[#F2D98F]">স্টাফ মুছে ফেলবেন?</h3>
            <p className="mt-1 text-[16px] font-medium leading-[1.8] text-[#D8CFB4]">
              "{deleteTarget.name}" স্থায়ীভাবে মুছে যাবে এবং আর লগইন করতে পারবে না।
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl border-2 border-[#C9A24B] px-4 py-3 text-[17px] font-bold text-[#F2D98F] transition hover:bg-[#C9A24B]/10 disabled:opacity-60"
              >
                না
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-xl bg-[#D64545] px-4 py-3 text-[17px] font-bold text-white transition hover:bg-[#B92A2A] active:translate-y-px disabled:opacity-60"
              >
                {deleting ? "মুছছে..." : "হ্যাঁ, মুছুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
