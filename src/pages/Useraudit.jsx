// src/pages/Useraudit.jsx
// Search + Customer + KYC + Payment + Loan cards in one file.
import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";

/* ============================================================
   HELPERS
============================================================ */
const BASE_URL = "https://loan.microfinancedevelopmentprojectbangladesh.com";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("access")}`,
});

const imageUrl = (p) => (!p ? null : p.startsWith("http") ? p : `${BASE_URL}${p}`);

const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "-");

const inputCls =
  "w-full min-w-0 rounded-lg bg-[#1a2942] border border-transparent px-3 py-2.5 text-sm text-white " +
  "placeholder-gray-500 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60";

// success / error message that disappears by itself
const useNotice = () => {
  const [notice, setNotice] = useState(null);
  const show = useCallback((type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 2500);
  }, []);
  return [notice, show];
};

/* ============================================================
   SHARED UI PARTS
============================================================ */
const Spinner = ({ className = "w-4 h-4" }) => (
  <span
    className={`${className} inline-block border-2 border-current border-t-transparent rounded-full animate-spin`}
  />
);

const Card = ({ title, meta, children }) => (
  <section className="bg-[#0f1b2d] rounded-2xl p-4 sm:p-6 shadow-lg overflow-hidden">
    <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
    {meta && <p className="mt-1 mb-4 text-xs sm:text-sm text-gray-400 leading-relaxed">{meta}</p>}
    <div className={meta ? "" : "mt-4"}>{children}</div>
  </section>
);

// mobile: label on top of input | sm and up: label left, input right
const Field = ({ label, children, top }) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-[150px_minmax(0,1fr)] gap-1 sm:gap-3 ${
      top ? "sm:items-start" : "sm:items-center"
    }`}
  >
    <label className="text-sm text-gray-300">{label}</label>
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
    <select {...props} className={inputCls}>
      {options.map(([v, t]) => (
        <option key={v} value={v}>
          {t}
        </option>
      ))}
    </select>
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
      className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-blue-500" : "bg-gray-600"}`}
    >
      <span
        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition-transform ${
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
    className={`mt-6 w-full flex items-center justify-center gap-2 rounded-lg py-3 font-semibold transition
      ${loading ? "bg-blue-500/60 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 active:scale-[0.98]"}`}
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
      className={`mb-4 rounded-lg px-3 py-2 text-sm ${
        notice.type === "ok" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
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
    <div>
      <div className="flex gap-2">
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Customer Number"
          className="min-w-0 flex-1 md:max-w-sm rounded-full bg-[#0f172a] border border-gray-700 px-4 py-2.5 text-sm
            text-white outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
            loading ? "bg-blue-500/60 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {loading ? <Spinner /> : "Search"}
        </button>
      </div>
      {error && <p className="mt-2 px-2 text-xs text-red-400">{error}</p>}
    </div>
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
    <Card title="👤 ব্যবহারকারীর তথ্য">
      <Notice notice={notice} />
      <div className="space-y-4">{renderFields(BASIC_FIELDS)}</div>

      <div className="mt-6 border-t border-gray-700 pt-5">
        <h3 className="mb-3 font-bold">📄 ডকুমেন্ট</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {docs.map((d) => (
            <div key={d.label}>
              <p className="mb-1 text-xs sm:text-sm text-gray-300">{d.label}</p>
              {d.img ? (
                <img
                  src={imageUrl(d.img)}
                  alt={d.label}
                  loading="lazy"
                  onClick={() => setPreview(imageUrl(d.img))}
                  className={`w-full ${d.ratio} cursor-pointer rounded-lg object-cover`}
                />
              ) : (
                <div className="flex h-24 w-full items-center justify-center rounded-lg bg-gray-800 text-xs text-gray-400">
                  No Image
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-gray-700 pt-5">
        <h3 className="mb-3 font-bold">👨‍👩‍👧 নমিনীর তথ্য</h3>
        <div className="space-y-4">{renderFields(NOMINEE_FIELDS)}</div>
      </div>

      <SaveButton loading={loading} onClick={handleUpdate} label="আপডেট" />

      {preview && (
        <div
          onClick={() => setPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <img src={preview} alt="preview" className="max-h-full max-w-full rounded-lg" />
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
      title="💳 ব্যাংক তথ্য"
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

  if (!loan) return <div className="p-4 text-center text-gray-400">লোড হচ্ছে...</div>;

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
    <Card title="📋 ঋণ তথ্য আপডেট">
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
      <div className="rounded-2xl bg-[#0f1b2d] p-4 text-center text-sm text-gray-400">
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
    <div className="min-h-screen bg-[#0b1220] text-white">
      <div className="mx-auto max-w-4xl px-4 pb-10 pt-16 md:ml-64 md:max-w-none md:px-6 md:pt-6">
        <div className="md:max-w-4xl">
          <Search onResult={handleResult} onLoading={setLoading} />

          {loading && (
            <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
              <Spinner className="h-5 w-5" /> Loading...
            </div>
          )}

          {user && !loading && (
            <div className="mt-6 space-y-5">
              <CustomerSummary data={user} />
              <KycDetails data={user} />
              <Payment data={user} />
              <UserLoans user={user} onUpdated={refreshUser} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Useraudit;
