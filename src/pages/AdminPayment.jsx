// src/pages/AdminPayment.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import BKash from "../assets/icons/BKash.png";
import Nagad from "../assets/icons/Nagad.png";

/* ================= STYLES ================= */

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

.ap-root {
  font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Kalpurush', system-ui, sans-serif;
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -webkit-tap-highlight-color: transparent;
}
.ap-root h1, .ap-root h2, .ap-root h3, .ap-root p, .ap-root span, .ap-root button, .ap-root label {
  letter-spacing: 0 !important;
}
.ap-root select, .ap-root input, .ap-root textarea { font-size: 17px; }
@keyframes ap-pop { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: none; } }
.ap-pop { animation: ap-pop .18s ease-out; }
`;

/* ===== THEME: dark navy blue + gold ===== */

const NAVY_BG = {
  background: "radial-gradient(900px 420px at 15% -20%, #1B4F66 0%, #071826 65%)",
};

const GOLD_BTN =
  "bg-gradient-to-b from-[#E8CB7E] via-[#C9A24B] to-[#B48A34] text-[#1B1405] " +
  "shadow-[0_10px_24px_-8px_rgba(201,162,75,0.75),inset_0_1px_0_rgba(255,255,255,0.55)] " +
  "hover:brightness-105 active:translate-y-px " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C9A24B]/40";

const OUTLINE_GOLD_BTN =
  "border-2 border-[#C9A24B] text-[#F2D98F] hover:bg-[#C9A24B] hover:text-[#1B1405] active:scale-95";

// Sidebar fixed থাকায় কনটেন্ট যেন তার নিচে ঢুকে না যায়
const OFFSET = "pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-0 md:pl-64";

const INPUT =
  "w-full rounded-xl border-2 border-[#C9A24B]/40 bg-[#0A1D2E] px-4 py-3.5 text-[17px] font-medium text-[#F5EBCB] " +
  "placeholder:text-[#7F90A0] focus:border-[#C9A24B] focus:outline-none focus:ring-4 focus:ring-[#C9A24B]/25";

/* ================= PAYMENT CHOICES (শুধু বিকাশ ও নগদ) ================= */

const METHODS = [
  { key: "bkash", label: "বিকাশ (bKash)", bn: "বিকাশ", name: "Bkash", logo: BKash },
  { key: "nagad", label: "নগদ (Nagad)", bn: "নগদ", name: "Nagad", logo: Nagad },
];

const keyOf = (m) => (m.method_name || "").trim().toLowerCase();
const findMethod = (m) => METHODS.find((x) => x.key === keyOf(m));

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

const BackIcon = () => (
  <Svg className="w-5 h-5">
    <path d="M15 18l-6-6 6-6" />
  </Svg>
);
const PlusIcon = () => (
  <Svg className="w-5 h-5">
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
const ChevronIcon = () => (
  <Svg className="w-5 h-5">
    <path d="M6 9l6 6 6-6" />
  </Svg>
);
const EditIcon = () => (
  <Svg className="w-4 h-4">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </Svg>
);
const TrashIcon = () => (
  <Svg className="w-4 h-4">
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
);
const CloseIcon = () => (
  <Svg className="w-5 h-5">
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
const AlertIcon = () => (
  <Svg>
    <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </Svg>
);

/* ================= HELPERS ================= */

const authHeaders = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  return { Authorization: token ? `Bearer ${token}` : "" };
};

const errText = (err, fallback) => {
  const d = err?.response?.data?.detail;
  if (typeof d === "string") {
    if (d === "Payment method already exists") return "এই নামের পেমেন্ট মেথড আগেই আছে";
    if (d === "Admin only") return "শুধু অ্যাডমিন এই কাজ করতে পারবেন";
    if (d === "Payment method not found") return "পেমেন্ট মেথড খুঁজে পাওয়া যায়নি";
    return d;
  }
  if (Array.isArray(d) && d[0]?.msg) return d[0].msg;
  return fallback;
};

// বাংলা অঙ্ক -> ইংরেজি অঙ্ক
const toEnDigits = (s) =>
  String(s).replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));

const EMPTY_FORM = {
  choice: "",
  account_number: "",
  description: "",
  is_active: true,
};

/* ================= MAIN ================= */

const AdminPayment = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2600);
  };

  const handleAuthError = useCallback(
    (err) => {
      const s = err?.response?.status;
      if (s === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return true;
      }
      if (s === 403) {
        setForbidden(true);
        return true;
      }
      return false;
    },
    [navigate]
  );

  const load = useCallback(async () => {
    try {
      const res = await api.get("/paymentmethod/admin", { headers: authHeaders() });
      const list = Array.isArray(res.data) ? res.data : [];
      // শুধু বিকাশ ও নগদ দেখাবে, বিকাশ আগে — রকেট ও ব্যাংক হাইড
      const filtered = list
        .filter((m) => findMethod(m))
        .sort(
          (a, b) =>
            METHODS.findIndex((x) => x.key === keyOf(a)) -
            METHODS.findIndex((x) => x.key === keyOf(b))
        );
      setItems(filtered);
    } catch (err) {
      if (!handleAuthError(err)) showToast("error", errText(err, "তালিকা লোড করা যায়নি"));
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------- একটা মেথড একবারের বেশি নয় ---------- */

  // এডিট করা আইটেম বাদে যেগুলো আগেই যোগ করা আছে
  const takenKeys = items.filter((m) => m.id !== editingId).map(keyOf);
  // বিকাশ ও নগদ দুইটাই যোগ করা হয়ে গেছে কি না
  const allAdded = METHODS.every((x) => items.some((m) => keyOf(m) === x.key));

  /* ---------- modal ---------- */

  const openAdd = () => {
    if (allAdded) {
      showToast("error", "বিকাশ ও নগদ দুইটাই আগে যোগ করা আছে");
      return;
    }
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (m) => {
    const found = findMethod(m);
    setEditingId(m.id);
    setForm({
      choice: found ? found.key : "",
      account_number: m.account_number || "",
      description: m.description || "",
      is_active: !!m.is_active,
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.choice) return setFormError("পেমেন্ট মেথড বেছে নিন");
    if (takenKeys.includes(form.choice)) {
      return setFormError("এই পেমেন্ট মেথড আগেই যোগ করা আছে, একটার বেশি যোগ করা যাবে না");
    }

    const number = toEnDigits(form.account_number).replace(/[\s-]/g, "");
    if (!number) return setFormError("মোবাইল নম্বর লিখুন");
    if (!/^01\d{9}$/.test(number)) {
      return setFormError("১১ ডিজিটের সঠিক নম্বর দিন (01XXXXXXXXX)");
    }

    const sel = METHODS.find((x) => x.key === form.choice);

    const payload = {
      method_name: sel.name,
      method_type: "mobile",
      account_number: number,
      description: form.description.trim(),
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.put(
          `/paymentmethod/admin/${editingId}`,
          { ...payload, is_active: form.is_active },
          { headers: authHeaders() }
        );
        showToast("success", "পেমেন্ট মেথড আপডেট হয়েছে");
      } else {
        await api.post("/paymentmethod/admin", payload, { headers: authHeaders() });
        showToast("success", "নতুন পেমেন্ট মেথড যোগ হয়েছে");
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      if (!handleAuthError(err)) setFormError(errText(err, "সেভ করা যায়নি, আবার চেষ্টা করুন"));
    } finally {
      setSaving(false);
    }
  };

  /* ---------- toggle ---------- */

  const toggleActive = async (m) => {
    setTogglingId(m.id);
    try {
      await api.put(
        `/paymentmethod/admin/${m.id}`,
        { is_active: !m.is_active },
        { headers: authHeaders() }
      );
      setItems((list) =>
        list.map((x) => (x.id === m.id ? { ...x, is_active: !m.is_active } : x))
      );
    } catch (err) {
      if (!handleAuthError(err)) showToast("error", errText(err, "স্ট্যাটাস বদলানো যায়নি"));
    } finally {
      setTogglingId(null);
    }
  };

  /* ---------- delete ---------- */

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/paymentmethod/admin/${deleteTarget.id}`, { headers: authHeaders() });
      setItems((list) => list.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("success", "পেমেন্ট মেথড মুছে ফেলা হয়েছে");
    } catch (err) {
      if (!handleAuthError(err)) showToast("error", errText(err, "মুছে ফেলা যায়নি"));
    } finally {
      setDeleting(false);
    }
  };

  const total = items.length;
  const activeCount = items.filter((m) => m.is_active).length;
  const inactiveCount = total - activeCount;

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className={`ap-root flex min-h-screen flex-col items-center justify-center gap-4 bg-[#06121F] ${OFFSET}`}>
        <style>{styles}</style>
        <svg className="h-10 w-10 animate-spin text-[#C9A24B]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="text-[18px] font-bold text-[#F2D98F]">লোড হচ্ছে...</p>
      </div>
    );
  }

  /* ================= FORBIDDEN ================= */
  if (forbidden) {
    return (
      <div className={`ap-root flex min-h-screen items-center justify-center bg-[#06121F] px-4 ${OFFSET}`}>
        <style>{styles}</style>
        <div className="w-full max-w-md rounded-2xl border-2 border-[#EDA9A9] bg-[#FDECEC] p-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8CFCF] text-[#B92A2A]">
            <AlertIcon />
          </span>
          <h2 className="mt-3 text-[21px] font-bold text-[#961F1F]">অনুমতি নেই</h2>
          <p className="mt-1 text-[17px] font-medium text-[#5E2626]">
            এই পেজ শুধু অ্যাডমিনের জন্য।
          </p>
          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className={`mt-5 w-full rounded-xl px-6 py-3.5 text-[17px] font-bold transition ${GOLD_BTN}`}
          >
            হোমে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`ap-root min-h-screen bg-[#06121F] pb-24 text-[#F5EBCB] ${OFFSET}`}>
      <style>{styles}</style>

      {/* ===== TOP BAR ===== */}
      <header className="sticky top-[calc(56px+env(safe-area-inset-top,0px))] z-30 border-b border-[#C9A24B]/40 bg-[#040D16] text-white shadow-lg md:top-0">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3.5">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C9A24B]/15 text-[#F2D98F] transition hover:bg-[#C9A24B]/30 active:scale-95"
            aria-label="পেছনে যান"
          >
            <BackIcon />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-[20px] font-bold text-[#F2D98F]">
            পেমেন্ট মেথড ম্যানেজ
          </h1>
          <button
            onClick={openAdd}
            aria-disabled={allAdded}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[16px] font-bold transition ${GOLD_BTN} ${
              allAdded ? "opacity-50" : ""
            }`}
          >
            <PlusIcon />
            নতুন
          </button>
        </div>
      </header>

      <main className="mx-auto mt-5 max-w-4xl space-y-5 px-4">
        {/* ===== SUMMARY ===== */}
        <section
          className="grid grid-cols-3 gap-3 rounded-3xl border border-[#C9A24B]/50 p-5 text-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]"
          style={NAVY_BG}
        >
          <Stat label="মোট" value={total} />
          <Stat label="সক্রিয়" value={activeCount} accent />
          <Stat label="নিষ্ক্রিয়" value={inactiveCount} />
        </section>

        {/* ===== EMPTY ===== */}
        {total === 0 && (
          <section className="rounded-2xl border-2 border-[#C9A24B]/60 bg-[#0D2538] p-6 text-center">
            <h3 className="text-[19px] font-bold text-[#F2D98F]">কোনো পেমেন্ট মেথড নেই</h3>
            <p className="mt-1 text-[16px] font-medium text-[#D8CFB4]">
              বিকাশ বা নগদ বেছে নিয়ে প্রথম নম্বর যোগ করুন।
            </p>
            <button
              onClick={openAdd}
              className={`mt-4 w-full rounded-xl px-6 py-3.5 text-[17px] font-bold transition sm:w-auto ${GOLD_BTN}`}
            >
              নতুন মেথড যোগ করুন
            </button>
          </section>
        )}

        {/* ===== LIST (দুইটা কার্ড: বিকাশ + নগদ) ===== */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((m) => {
            const meta = findMethod(m);
            return (
              <article
                key={m.id}
                className={`rounded-3xl border-2 bg-[#0D2538] p-4 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] transition sm:p-5 ${
                  m.is_active ? "border-[#C9A24B]/45" : "border-[#3A4A57] opacity-80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.6)]">
                    <img src={meta.logo} alt={meta.name} className="h-full w-full object-contain" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[20px] font-bold text-[#F5EBCB]">{meta.bn}</h3>
                    <p className="text-[15px] font-medium text-[#A9B7C2]">মোবাইল ব্যাংকিং</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[14px] font-bold ${
                      m.is_active
                        ? "bg-[#C5EBD5] text-[#0C5A3B]"
                        : "bg-[#E4E7EA] text-[#3F4A53]"
                    }`}
                  >
                    {m.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-[#C9A24B]/30 bg-[#081A2B] px-4 py-3">
                  <p className="text-[14px] font-medium text-[#A9B7C2]">মোবাইল নম্বর</p>
                  <p className="truncate font-mono text-[19px] font-bold tracking-wider text-[#F2D98F]">
                    {m.account_number || "—"}
                  </p>
                </div>

                {m.description && (
                  <p className="mt-3 whitespace-pre-line text-[16px] font-medium leading-[1.8] text-[#E6DCC0]">
                    {m.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#C9A24B]/25 pt-4">
                  {/* toggle */}
                  <button
                    type="button"
                    onClick={() => toggleActive(m)}
                    disabled={togglingId === m.id}
                    className="flex items-center gap-2.5 disabled:opacity-60"
                    aria-label="সক্রিয় বা নিষ্ক্রিয় করুন"
                  >
                    <span
                      className={`relative h-7 w-12 rounded-full transition-colors ${
                        m.is_active ? "bg-[#C9A24B]" : "bg-[#3A4A57]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                          m.is_active ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </span>
                    <span className="text-[15px] font-bold text-[#F5EBCB]">
                      {m.is_active ? "চালু" : "বন্ধ"}
                    </span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[15px] font-bold transition ${OUTLINE_GOLD_BTN}`}
                    >
                      <EditIcon />
                      এডিট
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(m)}
                      className="flex items-center gap-1.5 rounded-full border-2 border-[#D64545] px-4 py-2 text-[15px] font-bold text-[#FF8A8A] transition hover:bg-[#D64545] hover:text-white active:scale-95"
                    >
                      <TrashIcon />
                      মুছুন
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* ================= ADD / EDIT MODAL ================= */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
          onClick={closeModal}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="ap-pop max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-2 border-[#C9A24B]/50 bg-[#0B2236] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[21px] font-bold text-[#F2D98F]">
                {editingId ? "মেথড এডিট করুন" : "নতুন পেমেন্ট মেথড"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A24B]/15 text-[#F2D98F] transition hover:bg-[#C9A24B]/30 active:scale-95"
                aria-label="বন্ধ করুন"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="space-y-4">
              {/* ---- dropdown: শুধু বিকাশ ও নগদ ---- */}
              <Field label="পেমেন্ট মেথড বেছে নিন">
                <div className="relative">
                  <select
                    className={`${INPUT} appearance-none pr-12`}
                    value={form.choice}
                    onChange={(e) => setField("choice", e.target.value)}
                  >
                    <option value="" disabled className="bg-[#0A1D2E] text-[#7F90A0]">
                      -- বেছে নিন --
                    </option>
                    {METHODS.map((x) => {
                      const taken = takenKeys.includes(x.key);
                      return (
                        <option
                          key={x.key}
                          value={x.key}
                          disabled={taken}
                          className="bg-[#0A1D2E] text-[#F5EBCB]"
                        >
                          {x.label}
                          {taken ? " — আগেই যোগ করা আছে" : ""}
                        </option>
                      );
                    })}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#F2D98F]">
                    <ChevronIcon />
                  </span>
                </div>
              </Field>

              {form.choice && (
                <Field label="মোবাইল নম্বর">
                  <input
                    className={`${INPUT} font-mono tracking-wider`}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={11}
                    value={form.account_number}
                    onChange={(e) => setField("account_number", toEnDigits(e.target.value))}
                    placeholder="01XXXXXXXXX"
                  />
                </Field>
              )}

              <Field label="বিবরণ (ঐচ্ছিক)">
                <textarea
                  className={`${INPUT} min-h-[96px] resize-y`}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="ব্যবহারকারীর জন্য কোনো নির্দেশনা থাকলে লিখুন"
                />
              </Field>

              {editingId && (
                <button
                  type="button"
                  onClick={() => setField("is_active", !form.is_active)}
                  className="flex w-full items-center justify-between rounded-xl border-2 border-[#C9A24B]/40 bg-[#0A1D2E] px-4 py-3.5"
                >
                  <span className="text-[17px] font-bold text-[#F5EBCB]">সক্রিয় আছে</span>
                  <span
                    className={`relative h-7 w-12 rounded-full transition-colors ${
                      form.is_active ? "bg-[#C9A24B]" : "bg-[#3A4A57]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                        form.is_active ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
              )}

              {formError && (
                <p className="rounded-xl border-2 border-[#EDA9A9] bg-[#FDECEC] px-4 py-2.5 text-[16px] font-bold text-[#961F1F]">
                  {formError}
                </p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border-2 border-[#C9A24B] px-4 py-3.5 text-[17px] font-bold text-[#F2D98F] transition hover:bg-[#C9A24B]/10 active:translate-y-px disabled:opacity-60"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`rounded-xl px-4 py-3.5 text-[17px] font-bold transition disabled:opacity-60 ${GOLD_BTN}`}
              >
                {saving ? "সেভ হচ্ছে..." : editingId ? "আপডেট করুন" : "যোগ করুন"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= DELETE CONFIRM ================= */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="ap-pop w-full max-w-sm rounded-3xl border-2 border-[#C9A24B]/50 bg-[#0B2236] p-6 text-center shadow-2xl"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8CFCF] text-[#B92A2A]">
              <AlertIcon />
            </span>
            <h3 className="mt-3 text-[21px] font-bold text-[#F2D98F]">মুছে ফেলবেন?</h3>
            <p className="mt-1 text-[17px] font-medium leading-[1.8] text-[#D8CFB4]">
              "{findMethod(deleteTarget)?.bn || deleteTarget.method_name}" স্থায়ীভাবে মুছে যাবে। এটি আর ফেরত আনা যাবে না।
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

      {/* ================= TOAST ================= */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
          <div
            className={`ap-pop rounded-2xl px-5 py-3.5 text-center text-[17px] font-bold shadow-2xl ${
              toast.type === "success"
                ? "border border-[#C9A24B] bg-[#0C5A3B] text-white"
                : "bg-[#961F1F] text-white"
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= SMALL PARTS ================= */

const Stat = ({ label, value, accent }) => (
  <div className="text-center">
    <p className="text-[15px] font-medium text-white/85">{label}</p>
    <p className={`text-[30px] font-bold leading-tight ${accent ? "text-[#F2D98F]" : "text-white"}`}>
      {value}
    </p>
  </div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-[16px] font-bold text-[#F2D98F]">{label}</span>
    {children}
  </label>
);

export default AdminPayment;
