import React, { useState, useEffect } from "react";
import api from "../services/api";

const InputField = ({ name, label, value, onChange }) => (
  <div className="grid grid-cols-[140px_16px_minmax(0,1fr)] items-center gap-2 mb-3">
    <label className="whitespace-nowrap text-gray-300">{label}</label>
    <span>:</span>
    <input
      name={name}
      value={value}
      onChange={onChange}
      className="bg-[#1e2a3d] border border-gray-600 p-2 rounded w-full min-w-0"
    />
  </div>
);

const Payment = ({ data }) => {
  const [method, setMethod] = useState("bank");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    mobile_wallet_number: "",
    payment_comment: "",
    bank_account_number: "",
    bank_account_name: "",
    bank_name: "",
    bank_branch_name: "",
  });

  const methodMap = {
    bkash: 1,
    nagad: 2,
    rocket: 3,
    bank: 4,
  };

  // ================= AUTO LOAD =================
  useEffect(() => {
    if (!data) return;

    let detected = "bank";
    const m = (data.payment_method || "").toLowerCase();

    if (m.includes("nagad")) detected = "nagad";
    else if (m.includes("rocket")) detected = "rocket";
    else if (m.includes("bkash")) detected = "bkash";

    setMethod(detected);

    setForm({
      mobile_wallet_number: data.mobile_wallet_number || "",
      payment_comment: data.payment_comment || "",
      bank_account_number: data.bank_account_number || "",
      bank_account_name: data.bank_account_name || "",
      bank_name: data.bank_name || "",
      bank_branch_name: data.bank_branch_name || "",
    });
  }, [data]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!data?.id) return;

    setLoading(true);
    setSuccess(false);

    try {
      const params = new URLSearchParams();

      params.append("user_id", data.id);
      params.append("payment_method_id", methodMap[method]);
      params.append("payment_comment", form.payment_comment || "");

      if (["bkash", "nagad", "rocket"].includes(method)) {
        params.append("mobile_wallet_number", form.mobile_wallet_number || "");
      }

      if (method === "bank") {
        params.append("bank_account_number", form.bank_account_number || "");
        params.append("bank_account_name", form.bank_account_name || "");
        params.append("bank_name", form.bank_name || "");
        params.append("bank_branch_name", form.bank_branch_name || "");
      }

      await api.post("/user/payment/admin/update", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f1b2d] text-white rounded-2xl p-6 mt-6 shadow-lg max-w-full overflow-hidden">

      {/* HEADER */}
      <h2 className="text-xl font-bold mb-3">💳 ব্যাংক তথ্য</h2>

      {/* DATE */}
      <p className="text-sm text-gray-300 mb-4">
        তৈরির সময়: {data?.created_at ? new Date(data.created_at).toLocaleString() : "-"} <br />
        আপডেট: {data?.updated_at ? new Date(data.updated_at).toLocaleString() : "-"}
      </p>

      {/* SUCCESS */}
      {success && (
        <div className="mb-3 text-green-400 text-sm">
          ✅ আপডেট সফল হয়েছে
        </div>
      )}

      {/* METHOD */}
      <div className="grid grid-cols-[140px_16px_minmax(0,1fr)] items-center gap-2 mb-3">
        <label className="text-gray-300">পেমেন্ট মাধ্যম</label>
        <span>:</span>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="bg-[#1e2a3d] border border-gray-600 p-2 rounded w-full"
        >
          <option value="bkash">বিকাশ</option>
          <option value="nagad">নগদ</option>
          <option value="rocket">রকেট</option>
          <option value="bank">ব্যাংক</option>
        </select>
      </div>

      {/* MOBILE */}
      {["bkash", "nagad", "rocket"].includes(method) && (
        <InputField
          name="mobile_wallet_number"
          label="মোবাইল নাম্বার"
          value={form.mobile_wallet_number}
          onChange={handleChange}
        />
      )}

      {/* BANK */}
      {method === "bank" && (
        <>
          <InputField
            name="bank_account_name"
            label="একাউন্ট হোল্ডারের নাম"
            value={form.bank_account_name}
            onChange={handleChange}
          />

          <InputField
            name="bank_account_number"
            label="একাউন্ট নম্বর"
            value={form.bank_account_number}
            onChange={handleChange}
          />

          <InputField
            name="bank_name"
            label="ব্যাংকের নাম"
            value={form.bank_name}
            onChange={handleChange}
          />

          <InputField
            name="bank_branch_name"
            label="শাখার নাম"
            value={form.bank_branch_name}
            onChange={handleChange}
          />
        </>
      )}

      {/* COMMENT */}
      <div className="grid grid-cols-[140px_16px_minmax(0,1fr)] items-start gap-2 mt-2">
        <label className="text-gray-300">মন্তব্য</label>
        <span>:</span>
        <textarea
          name="payment_comment"
          value={form.payment_comment}
          onChange={handleChange}
          className="bg-[#1e2a3d] border border-gray-600 p-3 rounded w-full"
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`mt-6 w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] active:scale-95"
        }`}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Updating...
          </>
        ) : (
          "আপডেট"
        )}
      </button>
    </div>
  );
};

export default Payment;