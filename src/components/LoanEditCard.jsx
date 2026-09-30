import React, { useEffect, useState } from "react";
import api from "../services/api";

const LoanEditCard = ({ loan, onUpdated }) => {
  const [form, setForm] = useState({
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
  });

  const [loading, setLoading] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    if (!loan) return;

    setForm({
      amount: loan.amount ?? "",
      months: loan.months ?? "",
      monthly_installment:
        loan.monthly_installment != null
          ? Math.round(Number(loan.monthly_installment))
          : "",
      installment_card: loan.installment_card ?? "Off",
      installment_status: loan.installment_status ?? "Pending",
      shot_status: loan.shot_status ?? "Off",
      shot_amount: loan.shot_amount ?? "",
      shot_info: loan.shot_info ?? "",
      loan_status: loan.loan_status ?? "Pending",
      comment:
        loan?.comments?.length > 0
          ? loan.comments[loan.comments.length - 1].comment
          : "",
    });
  }, [loan]);

  // ================= INPUT HANDLE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: ["amount", "months", "monthly_installment", "shot_amount"].includes(name)
        ? value === ""
          ? ""
          : Number(value)
        : value,
    }));
  };

  // ================= TOGGLE =================
  const toggle = (key) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key] === "On" ? "Off" : "On",
    }));
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const loanId = loan?.loan_id || loan?.id;

      const payload = new URLSearchParams();
      payload.append("loan_id", loanId);

      if (form.amount !== "") payload.append("amount", form.amount);
      if (form.months !== "") payload.append("months", form.months);

      if (form.monthly_installment !== "") {
        payload.append(
          "monthly_installment",
          Math.round(Number(form.monthly_installment))
        );
      }

      payload.append("loan_status", form.loan_status);
      payload.append("installment_status", form.installment_status);
      payload.append("installment_card", form.installment_card);
      payload.append("shot_status", form.shot_status);
      payload.append("shot_amount", form.shot_amount || 0);
      payload.append("shot_info", form.shot_info || "");

      if (form.comment?.trim()) {
        payload.append("comment", form.comment.trim());
      }

      const res = await api.post("/loan/loan/admin-update", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // ================= COMMENT REALTIME FIX =================
      const updatedComments = res?.data?.comments;

      if (updatedComments?.length > 0) {
        const latestComment =
          updatedComments[updatedComments.length - 1].comment;

        setForm((prev) => ({
          ...prev,
          comment: latestComment, // 👉 instant UI update
        }));
      }

      onUpdated?.();
    } catch (err) {
      console.error("আপডেট সমস্যা:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!loan) {
    return <div className="text-white p-4 text-center">লোড হচ্ছে...</div>;
  }

  const row = "flex items-center gap-3 w-full";

  return (
    <div className="w-full min-h-screen bg-[#020617] text-white p-4">
      <div className="bg-[#0b1220] p-6 rounded-xl w-full">

        <h2 className="text-lg font-semibold mb-5">📋 ঋণ তথ্য আপডেট</h2>

        <div className="space-y-4">

          {/* INPUT FIELDS */}
          {[
            ["পরিমাণ", "amount"],
            ["মাস সংখ্যা", "months"],
            ["মাসিক কিস্তি", "monthly_installment"],
          ].map(([label, key]) => (
            <div key={key} className={row}>
              <label className="w-40 text-sm text-gray-300">{label}</label>
              <span>:</span>
              <input
                name={key}
                value={form[key]}
                onChange={handleChange}
                className="flex-1 bg-[#1a2942] px-3 py-2 rounded-md text-sm"
              />
            </div>
          ))}

          {/* INSTALLMENT STATUS */}
          <div className={row}>
            <label className="w-40 text-sm text-gray-300">কিস্তি স্ট্যাটাস</label>
            <span>:</span>
            <select
              name="installment_status"
              value={form.installment_status}
              onChange={handleChange}
              className="flex-1 bg-[#1a2942] px-3 py-2 rounded-md text-sm"
            >
              <option value="Pending">অপেক্ষমান</option>
              <option value="Running">চলমান</option>
              <option value="Completed">সম্পন্ন</option>
            </select>
          </div>

          {/* LOAN STATUS */}
          <div className={row}>
            <label className="w-40 text-sm text-gray-300">ঋণ স্ট্যাটাস</label>
            <span>:</span>
            <select
              name="loan_status"
              value={form.loan_status}
              onChange={handleChange}
              className="flex-1 bg-[#1a2942] px-3 py-2 rounded-md text-sm"
            >
              <option value="Pending">অপেক্ষমান</option>
              <option value="Approved">অনুমোদিত</option>
              <option value="Processing">প্রক্রিয়াধীন</option>
              <option value="Rejected">বাতিল</option>
              <option value="Payment Pending">পেমেন্ট বাকি</option>
              <option value="Payment Success">পেমেন্ট সফল</option>
              <option value="Payment Failed">পেমেন্ট ব্যর্থ</option>
            </select>
          </div>

          {/* CARD TOGGLE */}
          <div className={row}>
            <label className="w-40 text-sm text-gray-300">কার্ড</label>
            <span>:</span>
            <div
              onClick={() => toggle("installment_card")}
              className={`w-12 h-6 flex items-center rounded-full cursor-pointer ${
                form.installment_card === "On"
                  ? "bg-blue-500"
                  : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transform ${
                  form.installment_card === "On"
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </div>
          </div>

          {/* SHOT TOGGLE */}
          <div className={row}>
            <label className="w-40 text-sm text-gray-300">শট স্ট্যাটাস</label>
            <span>:</span>
            <div
              onClick={() => toggle("shot_status")}
              className={`w-12 h-6 flex items-center rounded-full cursor-pointer ${
                form.shot_status === "On"
                  ? "bg-blue-500"
                  : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transform ${
                  form.shot_status === "On"
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </div>
          </div>

          {/* SHOT FIELDS */}
          {form.shot_status === "On" && (
            <>
              <div className={row}>
                <label className="w-40 text-sm text-gray-300">শট পরিমাণ</label>
                <span>:</span>
                <input
                  name="shot_amount"
                  value={form.shot_amount}
                  onChange={handleChange}
                  className="flex-1 bg-[#1a2942] px-3 py-2 rounded-md text-sm"
                />
              </div>

              <div className={row}>
                <label className="w-40 text-sm text-gray-300">শট তথ্য</label>
                <span>:</span>
                <textarea
                  name="shot_info"
                  value={form.shot_info}
                  onChange={handleChange}
                  className="flex-1 bg-[#1a2942] p-2 rounded-md text-sm h-20"
                />
              </div>
            </>
          )}

        </div>

        {/* COMMENT */}
        <div className="mt-4">
          <label className="text-sm text-gray-300">মন্তব্য লিখুন</label>
          <textarea
            name="comment"
            value={form.comment}
            onChange={handleChange}
            placeholder="এখানে মন্তব্য লিখুন..."
            className="w-full bg-[#1a2942] p-2 rounded-md mt-2 h-24"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleUpdate}
          disabled={loading}
          className={`w-full mt-6 py-3 rounded-md font-semibold transition ${
            loading
              ? "bg-blue-500 opacity-70 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-800"
          }`}
        >
          {loading ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
        </button>

      </div>
    </div>
  );
};

export default LoanEditCard;
