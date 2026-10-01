// src/pages/Useraudit.jsx
// Search + Customer + KYC + Payment + Loan cards in one file.
import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";

/* ============================================================
   CONFIG
============================================================ */
const BASE_URL = "https://loan.microfinancedevelopmentprojectbangladesh.com";

// "লগইন" বাটনে চাপ দিলে যে সাইটে ইউজার হিসেবে ঢুকবে
const USER_SITE = "https://microfinancedevelopmentprojectbangladesh.com";

/* ============================================================
   STYLES
============================================================ */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap');

.ua-root {
  font-family: 'Noto Sans Bengali', 'Hind Siliguri', 'Kalpurush', system-ui, sans-serif;
  font-feature-settings: "liga" 1, "clig" 1, "rlig" 1, "calt" 1;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  line-height: 1.7;
}
.ua-root h1, .ua-root h2, .ua-root h3, .ua-root p, .ua-root span, .ua-root button, .ua-root label {
  letter-spacing: 0 !important;
}
.ua-root input, .ua-root select, .ua-root textarea { font-size: 16px; }
@keyframes ua-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.ua-rise { animation: ua-rise .3s ease-out both; }
@media (prefers-reduced-motion: reduce) { .ua-rise { animation: none; } }
`;

/* ===== THEME: dark navy blue + gold =====
   page #06121F  card #0D2538  field #0A1D2E  deep #081A2B
   cream #F5EBCB muted #A9B7C2  gold #C9A24B  light gold #F2D98F
*/

// সাইডবার fixed — কনটেন্ট যেন তার নিচে না ঢোকে
const OFFSET = "pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-0 md:pl-64";

const HERO_BG = {
  background:
    "radial-gradient(700px 320px at 10% -30%, #1E5A74 0%, transparent 60%), linear-gradient(160deg, #0F3045 0%, #071826 70%)",
};

const GOLD_GRAD = "bg-gradient-to-b from-[#E8CB7E] via-[#C9A24B] to-[#B48A34] text-[#1B1405]";
const GOLD_BTN =
  GOLD_GRAD +
  " shadow-[0_10px_24px_-8px_rgba(201,162,75,0.7),inset_0_1px_0_rgba(255,255,255,0.5)] " +
  "hover:brightness-105 active:translate-y-px " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C9A24B]/40 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const inputCls =
  "w-full min-w-0 rounded-xl border-2 border-[#C9A24B]/30 bg-[#0A1D2E] px-4 py-3 font-medium text-[#F5EBCB] " +
  "placeholder:text-[#7F90A0] outline-none transition " +
  "focus:border-[#C9A24B] focus:ring-4 focus:ring-[#C9A24B]/20 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/* ============================================================
   HELPERS
============================================================ */
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("access")}`,
});

const imageUrl = (p) => (!p ? null : p.startsWith("http") ? p : `${BASE_URL}${p}`);

const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "-");

const getInitial = (name) => name?.trim()?.charAt(0)?.toUpperCase() || "U";

// success / error message that disappears by itself
const useNotice = () => {
  const [notice, setNotice] = useState(null);
  const show = useCallback((type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 2800);
  }, []);
  return [notice, show];
};

/* ============================================================
   ICONS
============================================================ */
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

const SearchIcon = () => (
  <Svg>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Svg>
);
const PhoneIcon = () => (
  <Svg>
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </Svg>
);
const UserIcon = () => (
  <Svg>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </Svg>
);
const IdIcon = () => (
  <Svg>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <circle cx="9" cy="11" r="2" />
    <path d="M6 16c.5-1.6 1.6-2.4 3-2.4s2.5.8 3 2.4M15 10h3M15 14h3" />
  </Svg>
);
const BankIcon = () => (
  <Svg>
    <path d="M3 10l9-6 9 6" />
    <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
    <path d="M3 21h18" />
  </Svg>
);
const ClipboardIcon = () => (
  <Svg>
    <rect x="5" y="4" width="14" height="17" rx="2.5" />
    <path d="M9 4.5V3h6v1.5M9 11h6M9 15h4" />
  </Svg>
);
const LoginIcon = () => (
  <Svg>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M10 8l4 4-4 4M14 12H3" />
  </Svg>
);
const ChevronIcon = () => (
  <Svg className="w-5 h-5">
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

/* ============================================================
   SHARED UI PARTS
============================================================ */
const Spinner = ({ className = "w-4 h-4" }) => (
  <span
    className={`${className} inline-block animate-spin rounded-full border-2 border-current border-t-transparent`}
  />
);

const Card = ({ title, icon, meta, children }) => (
  <section className="ua-rise overflow-hidden rounded-3xl border-2 border-[#C9A24B]/30 bg-[#0D2538] p-4 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.85)] sm:p-6">
    <div className="flex items-center gap-3">
      {icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C9A24B]/50 bg-[#16384F] text-[#F2D98F]">
          {icon}
        </span>
      )}
      <h2 className="text-[19px] font-bold text-[#F2D98F] sm:text-[21px]">{title}</h2>
    </div>
    {meta && <p className="mt-2 text-[13px] leading-relaxed text-[#A9B7C2] sm:text-sm">{meta}</p>}
    <div className="mt-4">{children}</div>
  </section>
);

// mobile: label on top of input | sm and up: label left, input right
const Field = ({ label, children, top }) => (
  <div
    className={`grid grid-cols-1 gap-1.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-3 ${
      top ? "sm:items-start" : "sm:items-center"
    }`}
  >
    <label className="text-[15px] font-semibold text-[#F2D98F]/90">{label}</label>
    {children}
  </div>
);

const TextField = ({ label, ...props }) => (
  <Field label={label}>
    <input {...props} className={inputCls} />
  </Field>
);

const SelectField = ({ label, options, ...props }) => (
  <Field label={label}>
    <div className="relative">
      <select {...props} className={`${inputCls} appearance-none pr-11`}>
        {options.map(([v, t]) => (
          <option key={v} value={v} className="bg-[#0A1D2E] text-[#F5EBCB]">
            {t}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#F2D98F]">
        <ChevronIcon />
      </span>
    </div>
  </Field>
);

const TextArea = ({ label, ...props }) => (
  <Field label={label} top>
    <textarea rows={3} {...props} className={`${inputCls} resize-y`} />
  </Field>
);

const Toggle = ({ label, on, onChange }) => (
  <Field label={label}>
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-[#C9A24B]" : "bg-[#3A4A57]"}`}
    >
      <span
        className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : ""
        }`}
      />
    </button>
  </Field>
);

const SaveButton = ({ loading, onClick, label = "আপডেট করুন" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[17px] font-bold transition ${GOLD_BTN}`}
  >
    {loading ? (
      <>
        <Spinner /> আপডেট হচ্ছে...
      </>
    ) : (
      label
    )}
  </button>
);

const Notice = ({ notice }) =>
  notice ? (
    <div
      className={`mb-4 rounded-xl border px-3.5 py-2.5 text-[15px] font-semibold ${
        notice.type === "ok"
          ? "border-[#1F9D6B]/50 bg-[#0C3A2A] text-[#9FE5C4]"
          : "border-[#D64545]/50 bg-[#3A1417] text-[#FFB3B3]"
      }`}
    >
      {notice.type === "ok" ? "✅ " : "⚠️ "}
      {notice.text}
    </div>
  ) : null;

/* ============================================================
   SEARCH
============================================================ */
const Search = ({ onResult, onLoading }) => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const number = phone.trim();
    if (!number) return;

    setLoading(true);
    setError("");
    onLoading(true);

    try {
      const res = await api.post(
        "/user/kyc/search-by-phone",
        { phone_number: number },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
      onResult(res.data, number);
    } catch {
      setError("গ্রাহক পাওয়া যায়নি");
      onResult(null, number);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <div className="ua-rise">
      <div className="flex gap-2.5">
        <div className="relative min-w-0 flex-1 md:max-w-md">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A24B]">
            <PhoneIcon />
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="গ্রাহকের মোবাইল নম্বর"
            className="w-full min-w-0 rounded-2xl border-2 border-[#C9A24B]/40 bg-[#0A1D2E] py-3.5 pl-12 pr-4 font-medium
              text-[#F5EBCB] placeholder:text-[#7F90A0] outline-none transition
              focus:border-[#C9A24B] focus:ring-4 focus:ring-[#C9A24B]/20"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className={`flex shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-[16px] font-bold transition ${GOLD_BTN}`}
        >
          {loading ? <Spinner /> : <SearchIcon />}
          <span className="hidden sm:inline">খুঁজুন</span>
        </button>
      </div>
      {error && <p className="mt-2 px-1 text-[14px] font-semibold text-[#FF8A8A]">{error}</p>}
    </div>
  );
};

/* ============================================================
   PROFILE HEADER  (নাম + স্ট্যাটাস + "লগইন" বাটন পাশে)
============================================================ */
const STATUS_TONE = {
  Active: "bg-[#C5EBD5] text-[#0C5A3B]",
  Suspended: "bg-[#F8E9B8] text-[#8A5F08]",
  Disabled: "bg-[#E4E7EA] text-[#3F4A53]",
};

const ProfileHeader = ({ data, phone }) => {
  const [busy, setBusy] = useState(false);
  const [notice, showNotice] = useNotice();

  const status = data?.status || "Active";

  // অ্যাডমিন/স্টাফ ওই ইউজার হিসেবে লগইন করবে — নতুন ট্যাবে ইউজার সাইট খুলবে
  const handleLoginAsUser = async () => {
    if (busy) return;
    setBusy(true);

    // পপআপ-ব্লক এড়াতে ক্লিকের সাথে সাথেই ট্যাব খোলা হচ্ছে
    const win = window.open("", "_blank");

    try {
      const body = new URLSearchParams();
      body.append("phone_number", phone || data?.phone_number || "");

      const res = await api.post("/auth/admin/login-as-user", body, {
        headers: { ...authHeader(), "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = res.data?.access_token;
      if (!token) throw new Error("token missing");

      // টোকেন hash-এ যায় (সার্ভারে পাঠানো হয় না)
      const url = `${USER_SITE}/#impersonate=${encodeURIComponent(token)}`;

      if (win) {
        win.opener = null;
        win.location.href = url;
      } else {
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error(err?.response?.data || err);
      if (win) win.close();
      showNotice("err", "ইউজার হিসেবে লগইন করা যায়নি");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="ua-rise relative overflow-hidden rounded-3xl border border-[#C9A24B]/50 p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] sm:p-6"
      style={HERO_BG}
    >
      <span className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[#C9A24B]/25" />
      <Notice notice={notice} />

      <div className="relative flex items-center gap-3 sm:gap-4">
        {/* avatar */}
        {data?.selfie ? (
          <img
            src={imageUrl(data.selfie)}
            alt="প্রোফাইল ছবি"
            className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-[#C9A24B] sm:h-16 sm:w-16"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#C9A24B]/70 bg-[#C9A24B]/15 text-[22px] font-bold text-[#F2D98F] sm:h-16 sm:w-16">
            {getInitial(data?.full_name)}
          </span>
        )}

        {/* info */}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[19px] font-bold text-white sm:text-[22px]">
            {data?.full_name || "নাম নেই"}
          </h2>
          <p className="truncate font-mono text-[14px] text-[#F2D98F] sm:text-[15px]">{phone || "-"}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${
                STATUS_TONE[status] || STATUS_TONE.Disabled
              }`}
            >
              {status}
            </span>
            <span className="text-[13px] font-medium text-white/80">
              ব্যালেন্স: ৳{Number(data?.balance || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* login button (পাশে) */}
        <button
          type="button"
          onClick={handleLoginAsUser}
          disabled={busy}
          title="এই ইউজার হিসেবে লগইন করুন"
          className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-[15px] font-bold transition sm:px-5 sm:py-3 ${GOLD_BTN}`}
        >
          {busy ? <Spinner /> : <LoginIcon />}
          <span>লগইন</span>
        </button>
      </div>
    </section>
  );
};

/* ============================================================
   CUSTOMER SUMMARY (status, balance, staff)
============================================================ */
const CustomerSummary = ({ data }) => {
  const [fullName, setFullName] = useState("");
  const [balance, setBalance] = useState(0);
  const [status, setStatus] = useState("Active");
  const [cardActive, setCardActive] = useState(true);
  const [comment, setComment] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, showNotice] = useNotice();

  const isStaffAssigned = !!data?.assigned_staff_name;

  useEffect(() => {
    setFullName(data?.full_name || "");
    setBalance(data?.balance || 0);
    setStatus(data?.status || "Active");
    setSelectedStaff(data?.assigned_staff_name || "");
  }, [data]);

  useEffect(() => {
    api
      .get("/user/kyc/staff-list", { headers: authHeader() })
      .then((res) => setStaffList(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const form = new FormData();
      form.append("user_id", String(data.id));
      form.append("full_name", fullName || "");
      form.append("balance", String(Number(balance)));
      form.append("status", status);
      if (!isStaffAssigned && selectedStaff) form.append("assigned_staff_name", selectedStaff);

      await api.post("/user/kyc/account/update", form, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
      });
      showNotice("ok", "আপডেট সফল হয়েছে");
    } catch (err) {
      console.error(err.response?.data || err);
      showNotice("err", "আপডেট ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="গ্রাহক তথ্য"
      icon={<UserIcon />}
      meta={
        <>
          তৈরি: {fmtDate(data.created_at)} <br />
          আপডেট: {fmtDate(data.updated_at)}
        </>
      }
    >
      <Notice notice={notice} />
      <div className="space-y-4">
        {isStaffAssigned ? (
          <TextField label="স্টাফ" value={data.assigned_staff_name} disabled readOnly />
        ) : (
          <SelectField
            label="স্টাফ"
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            options={[["", "-- নির্বাচন করুন --"], ...staffList.map((s) => [s.name, s.name])]}
          />
        )}

        <TextField label="পুরো নাম" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <TextField
          label="ব্যালেন্স"
          type="number"
          inputMode="decimal"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
        <SelectField
          label="স্ট্যাটাস"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            ["Active", "Active"],
            ["Suspended", "Suspended"],
            ["Disabled", "Disabled"],
          ]}
        />
        <Toggle label="কার্ড" on={cardActive} onChange={() => setCardActive((v) => !v)} />
        <TextArea label="মন্তব্য" value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>
      <SaveButton loading={loading} onClick={handleUpdate} label="আপডেট" />
    </Card>
  );
};

/* ============================================================
   KYC DETAILS + DOCUMENTS
============================================================ */
const BASIC_FIELDS = [
  ["পূর্ণ নাম", "full_name"],
  ["এনআইডি নম্বর", "nid_number"],
  ["বর্তমান ঠিকানা", "current_address"],
  ["স্থায়ী ঠিকানা", "permanent_address"],
  ["মোবাইল নম্বর", "mobile_number"],
  ["পেশা", "profession"],
  ["ঋণের কারণ", "loan_reason"],
];

const NOMINEE_FIELDS = [
  ["নাম", "nominee_name"],
  ["সম্পর্ক", "nominee_relation"],
  ["মোবাইল", "nominee_phone"],
];

const KycDetails = ({ data }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [notice, showNotice] = useNotice();

  useEffect(() => {
    const next = {};
    [...BASIC_FIELDS, ...NOMINEE_FIELDS].forEach(([, k]) => (next[k] = data?.[k] || ""));
    setForm(next);
  }, [data]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("user_id", data.id);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));

      await api.post("/user/kyc/account/update", fd, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
      });
      showNotice("ok", "আপডেট সফল হয়েছে");
    } catch (err) {
      console.error(err);
      showNotice("err", "আপডেট ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const docs = [
    { label: "সেলফি", img: data.selfie, ratio: "aspect-square" },
    { label: "আইডি (সামনে)", img: data.nid_front, ratio: "aspect-[16/10]" },
    { label: "আইডি (পেছনে)", img: data.nid_back, ratio: "aspect-[16/10]" },
    { label: "স্বাক্ষর", img: data.signature, ratio: "aspect-[2/1]" },
  ];

  const renderFields = (list) =>
    list.map(([label, key]) => (
      <TextField key={key} label={label} name={key} value={form[key] || ""} onChange={handleChange} />
    ));

  return (
    <Card title="ব্যবহারকারীর তথ্য" icon={<IdIcon />}>
      <Notice notice={notice} />
      <div className="space-y-4">{renderFields(BASIC_FIELDS)}</div>

      <div className="mt-6 border-t border-[#C9A24B]/25 pt-5">
        <h3 className="mb-3 text-[17px] font-bold text-[#F2D98F]">ডকুমেন্ট</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {docs.map((d) => (
            <div key={d.label}>
              <p className="mb-1.5 text-[13px] font-medium text-[#A9B7C2] sm:text-sm">{d.label}</p>
              {d.img ? (
                <img
                  src={imageUrl(d.img)}
                  alt={d.label}
                  loading="lazy"
                  onClick={() => setPreview(imageUrl(d.img))}
                  className={`w-full ${d.ratio} cursor-pointer rounded-xl border border-[#C9A24B]/40 object-cover transition hover:border-[#C9A24B]`}
                />
              ) : (
                <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-[#C9A24B]/30 bg-[#081A2B] text-[13px] text-[#A9B7C2]">
                  ছবি নেই
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-[#C9A24B]/25 pt-5">
        <h3 className="mb-3 text-[17px] font-bold text-[#F2D98F]">নমিনীর তথ্য</h3>
        <div className="space-y-4">{renderFields(NOMINEE_FIELDS)}</div>
      </div>

      <SaveButton loading={loading} onClick={handleUpdate} label="আপডেট" />

      {preview && (
        <div
          onClick={() => setPreview(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
        >
          <img src={preview} alt="preview" className="max-h-full max-w-full rounded-xl border border-[#C9A24B]/50" />
        </div>
      )}
    </Card>
  );
};

/* ============================================================
   PAYMENT
============================================================ */
const METHOD_ID = { bkash: 1, nagad: 2, rocket: 3, bank: 4 };

const Payment = ({ data }) => {
  const [method, setMethod] = useState("bank");
  const [loading, setLoading] = useState(false);
  const [notice, showNotice] = useNotice();
  const [form, setForm] = useState({
    mobile_wallet_number: "",
    payment_comment: "",
    bank_account_number: "",
    bank_account_name: "",
    bank_name: "",
    bank_branch_name: "",
  });

  useEffect(() => {
    if (!data) return;
    const m = (data.payment_method || "").toLowerCase();
    setMethod(
      m.includes("nagad") ? "nagad" : m.includes("rocket") ? "rocket" : m.includes("bkash") ? "bkash" : "bank"
    );
    setForm({
      mobile_wallet_number: data.mobile_wallet_number || "",
      payment_comment: data.payment_comment || "",
      bank_account_number: data.bank_account_number || "",
      bank_account_name: data.bank_account_name || "",
      bank_name: data.bank_name || "",
      bank_branch_name: data.bank_branch_name || "",
    });
  }, [data]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!data?.id) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("user_id", data.id);
      params.append("payment_method_id", METHOD_ID[method]);
      params.append("payment_comment", form.payment_comment || "");

      if (method === "bank") {
        ["bank_account_number", "bank_account_name", "bank_name", "bank_branch_name"].forEach((k) =>
          params.append(k, form[k] || "")
        );
      } else {
        params.append("mobile_wallet_number", form.mobile_wallet_number || "");
      }

      await api.post("/user/payment/admin/update", params, {
        headers: { ...authHeader(), "Content-Type": "application/x-www-form-urlencoded" },
      });
      showNotice("ok", "আপডেট সফল হয়েছে");
    } catch (err) {
      console.error(err);
      showNotice("err", "আপডেট ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name) => (
    <TextField label={label} name={name} value={form[name]} onChange={handleChange} />
  );

  return (
    <Card
      title="ব্যাংক তথ্য"
      icon={<BankIcon />}
      meta={
        <>
          তৈরির সময়: {fmtDate(data?.created_at)} <br />
          আপডেট: {fmtDate(data?.updated_at)}
        </>
      }
    >
      <Notice notice={notice} />
      <div className="space-y-4">
        <SelectField
          label="পেমেন্ট মাধ্যম"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          options={[
            ["bkash", "বিকাশ"],
            ["nagad", "নগদ"],
            ["rocket", "রকেট"],
            ["bank", "ব্যাংক"],
          ]}
        />

        {method === "bank" ? (
          <>
            {field("একাউন্ট হোল্ডারের নাম", "bank_account_name")}
            {field("একাউন্ট নম্বর", "bank_account_number")}
            {field("ব্যাংকের নাম", "bank_name")}
            {field("শাখার নাম", "bank_branch_name")}
          </>
        ) : (
          <TextField
            label="মোবাইল নাম্বার"
            type="tel"
            inputMode="numeric"
            name="mobile_wallet_number"
            value={form.mobile_wallet_number}
            onChange={handleChange}
          />
        )}

        <TextArea label="মন্তব্য" name="payment_comment" value={form.payment_comment} onChange={handleChange} />
      </div>
      <SaveButton loading={loading} onClick={handleSubmit} label="আপডেট" />
    </Card>
  );
};

/* ============================================================
   LOAN EDIT CARD
============================================================ */
const NUMERIC = ["amount", "months", "monthly_installment", "shot_amount"];

const EMPTY_LOAN = {
  amount: "",
  months: "",
  monthly_installment: "",
  installment_card: "Off",
  installment_status: "Pending",
  shot_status: "Off",
  shot_amount: "",
  shot_info: "",
  loan_status: "Pending",
  comment: "",
};

const LoanEditCard = ({ loan, onUpdated }) => {
  const [form, setForm] = useState(EMPTY_LOAN);
  const [loading, setLoading] = useState(false);
  const [notice, showNotice] = useNotice();

  useEffect(() => {
    if (!loan) return;
    setForm({
      amount: loan.amount ?? "",
      months: loan.months ?? "",
      monthly_installment:
        loan.monthly_installment != null ? Math.round(Number(loan.monthly_installment)) : "",
      installment_card: loan.installment_card ?? "Off",
      installment_status: loan.installment_status ?? "Pending",
      shot_status: loan.shot_status ?? "Off",
      shot_amount: loan.shot_amount ?? "",
      shot_info: loan.shot_info ?? "",
      loan_status: loan.loan_status ?? "Pending",
      comment: loan?.comments?.length ? loan.comments[loan.comments.length - 1].comment : "",
    });
  }, [loan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: NUMERIC.includes(name) ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const toggle = (key) => setForm((p) => ({ ...p, [key]: p[key] === "On" ? "Off" : "On" }));

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const payload = new URLSearchParams();
      payload.append("loan_id", loan?.loan_id || loan?.id);

      if (form.amount !== "") payload.append("amount", form.amount);
      if (form.months !== "") payload.append("months", form.months);
      if (form.monthly_installment !== "")
        payload.append("monthly_installment", Math.round(Number(form.monthly_installment)));

      payload.append("loan_status", form.loan_status);
      payload.append("installment_status", form.installment_status);
      payload.append("installment_card", form.installment_card);
      payload.append("shot_status", form.shot_status);
      payload.append("shot_amount", form.shot_amount || 0);
      payload.append("shot_info", form.shot_info || "");
      if (form.comment?.trim()) payload.append("comment", form.comment.trim());

      const res = await api.post("/loan/loan/admin-update", payload, {
        headers: { ...authHeader(), "Content-Type": "application/x-www-form-urlencoded" },
      });

      const comments = res?.data?.comments;
      if (comments?.length) {
        setForm((p) => ({ ...p, comment: comments[comments.length - 1].comment }));
      }

      showNotice("ok", "আপডেট সফল হয়েছে");
      onUpdated?.();
    } catch (err) {
      console.error("আপডেট সমস্যা:", err?.response?.data || err.message);
      showNotice("err", "আপডেট ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  if (!loan) return <div className="p-4 text-center text-[#A9B7C2]">লোড হচ্ছে...</div>;

  const numField = (label, name) => (
    <TextField
      label={label}
      name={name}
      type="number"
      inputMode="numeric"
      value={form[name]}
      onChange={handleChange}
    />
  );

  return (
    <Card title="ঋণ তথ্য আপডেট" icon={<ClipboardIcon />}>
      <Notice notice={notice} />
      <div className="space-y-4">
        {numField("পরিমাণ", "amount")}
        {numField("মাস সংখ্যা", "months")}
        {numField("মাসিক কিস্তি", "monthly_installment")}

        <SelectField
          label="কিস্তি স্ট্যাটাস"
          name="installment_status"
          value={form.installment_status}
          onChange={handleChange}
          options={[
            ["Pending", "অপেক্ষমান"],
            ["Running", "চলমান"],
            ["Completed", "সম্পন্ন"],
          ]}
        />

        <SelectField
          label="ঋণ স্ট্যাটাস"
          name="loan_status"
          value={form.loan_status}
          onChange={handleChange}
          options={[
            ["Pending", "অপেক্ষমান"],
            ["Approved", "অনুমোদিত"],
            ["Processing", "প্রক্রিয়াধীন"],
            ["Rejected", "বাতিল"],
            ["Payment Pending", "পেমেন্ট বাকি"],
            ["Payment Success", "পেমেন্ট সফল"],
            ["Payment Failed", "পেমেন্ট ব্যর্থ"],
          ]}
        />

        <Toggle label="কার্ড" on={form.installment_card === "On"} onChange={() => toggle("installment_card")} />
        <Toggle label="শট স্ট্যাটাস" on={form.shot_status === "On"} onChange={() => toggle("shot_status")} />

        {form.shot_status === "On" && (
          <>
            {numField("শট পরিমাণ", "shot_amount")}
            <TextArea label="শট তথ্য" name="shot_info" value={form.shot_info} onChange={handleChange} />
          </>
        )}

        <TextArea
          label="মন্তব্য"
          name="comment"
          placeholder="এখানে মন্তব্য লিখুন..."
          value={form.comment}
          onChange={handleChange}
        />
      </div>
      <SaveButton loading={loading} onClick={handleUpdate} />
    </Card>
  );
};

const UserLoans = ({ user, onUpdated }) => {
  if (!user?.loans?.length) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-[#C9A24B]/30 bg-[#0D2538] p-5 text-center text-[15px] font-medium text-[#A9B7C2]">
        কোনো ঋণ পাওয়া যায়নি
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {user.loans.map((loan) => (
        <LoanEditCard key={loan.loan_id || loan.id} loan={loan} onUpdated={onUpdated} />
      ))}
    </div>
  );
};

/* ============================================================
   PAGE
============================================================ */
const Useraudit = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastPhone, setLastPhone] = useState("");

  const handleResult = (data, phone) => {
    setUser(data || null);
    if (phone) setLastPhone(phone);
  };

  // reload fresh data after a loan update (no loading spinner flicker)
  const refreshUser = async () => {
    if (!lastPhone) return;
    try {
      const res = await api.post(
        "/user/kyc/search-by-phone",
        { phone_number: lastPhone },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div lang="bn" className={`ua-root min-h-screen bg-[#06121F] pb-16 text-[#F5EBCB] ${OFFSET}`}>
      <style>{styles}</style>

      <div className="mx-auto max-w-4xl px-4 pt-5 md:px-6 md:pt-8">
        <h1 className="mb-4 text-[24px] font-bold text-[#F2D98F] sm:text-[28px]">গ্রাহক নিরীক্ষা</h1>

        <Search onResult={handleResult} onLoading={setLoading} />

        {loading && (
          <div className="mt-8 flex items-center justify-center gap-2.5 text-[16px] font-medium text-[#F2D98F]">
            <Spinner className="h-5 w-5" /> লোড হচ্ছে...
          </div>
        )}

        {user && !loading && (
          <div className="mt-6 space-y-5">
            <ProfileHeader data={user} phone={lastPhone} />
            <CustomerSummary data={user} />
            <KycDetails data={user} />
            <Payment data={user} />
            <UserLoans user={user} onUpdated={refreshUser} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Useraudit;
