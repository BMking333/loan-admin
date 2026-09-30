import React, { useEffect, useState } from "react";
import api from "../services/api";

const Userfulldetlise = ({ data }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    if (!data) return;

    setForm({
      full_name: data.full_name || "",
      nid_number: data.nid_number || "",
      current_address: data.current_address || "",
      permanent_address: data.permanent_address || "",
      mobile_number: data.mobile_number || "",
      profession: data.profession || "",
      loan_reason: data.loan_reason || "",
      nominee_name: data.nominee_name || "",
      nominee_relation: data.nominee_relation || "",
      nominee_phone: data.nominee_phone || "",
    });
  }, [data]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("user_id", data.id);

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });

      await api.post("/user/kyc/account/update", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "multipart/form-data",
        },
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://loan.microfinancedevelopmentprojectbangladesh.com${path}`;
  };

  const row = "grid grid-cols-[150px_10px_1fr] gap-2 items-center py-2";

  if (!data) return null;

  return (
    <div className="bg-[#0b1220] text-white p-6 rounded-2xl space-y-6">

      {/* HEADER */}
      <div className="border-b border-gray-700 pb-3">
        <h2 className="text-xl font-bold">👤 ব্যবহারকারীর তথ্য</h2>
      </div>

      {/* BASIC INFO */}
      <div className="space-y-3">
        {[
          ["পূর্ণ নাম", "full_name"],
          ["এনআইডি নম্বর", "nid_number"],
          ["বর্তমান ঠিকানা", "current_address"],
          ["স্থায়ী ঠিকানা", "permanent_address"],
          ["মোবাইল নম্বর", "mobile_number"],
          ["পেশা", "profession"],
          ["ঋণের কারণ", "loan_reason"],
        ].map(([label, key], i) => (
          <div key={i} className={row}>
            <label>{label}</label>
            <span>:</span>
            <input
              name={key}
              value={form[key] || ""}
              onChange={handleChange}
              className="bg-[#1a2942] p-2 rounded w-full outline-none"
            />
          </div>
        ))}
      </div>

      {/* DOCUMENTS */}
      <div className="border-t border-gray-700 pt-5">
        <h3 className="font-bold mb-3">📄 ডকুমেন্ট</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "সেলফি", img: data.selfie, ratio: "aspect-square" },
            { label: "আইডি (সামনে)", img: data.nid_front, ratio: "aspect-[16/10]" },
            { label: "আইডি (পেছনে)", img: data.nid_back, ratio: "aspect-[16/10]" },
            { label: "স্বাক্ষর", img: data.signature, ratio: "aspect-[4/2]" },
          ].map((item, i) => (
            <div key={i}>
              <p className="text-sm mb-1">{item.label}</p>

              {item.img ? (
                <img
                  src={getImageUrl(item.img)}
                  onClick={() => setPreviewImg(getImageUrl(item.img))}
                  className={`w-full ${item.ratio} object-cover rounded cursor-pointer hover:scale-105 transition`}
                />
              ) : (
                <div className="w-full h-24 bg-gray-800 flex items-center justify-center rounded">
                  No Image
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* NOMINEE */}
      <div className="border-t border-gray-700 pt-5 space-y-3">
        <h3 className="font-bold">👨‍👩‍👧 নমিনীর তথ্য</h3>

        {[
          ["নাম", "nominee_name"],
          ["সম্পর্ক", "nominee_relation"],
          ["মোবাইল", "nominee_phone"],
        ].map(([label, key], i) => (
          <div key={i} className={row}>
            <label>{label}</label>
            <span>:</span>
            <input
              name={key}
              value={form[key] || ""}
              onChange={handleChange}
              className="bg-[#1a2942] p-2 rounded w-full outline-none"
            />
          </div>
        ))}
      </div>

      {/* ================= UPDATE BUTTON (ANIMATION) ================= */}
      <button
        onClick={handleUpdate}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 transform
        ${
          loading
            ? "bg-gray-500 scale-95 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95"
        }`}
      >
        {loading ? "⏳ আপডেট হচ্ছে..." : " আপডেট "}
      </button>

      {/* IMAGE PREVIEW */}
      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center"
        >
          <img src={previewImg} className="max-w-[90%] max-h-[90%] rounded" />
        </div>
      )}
    </div>
  );
};

export default Userfulldetlise;
