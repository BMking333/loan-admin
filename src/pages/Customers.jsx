// src/pages/Customers.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";

const FILTERS = [
  { key: "", label: "সব" },
  { key: "today", label: "আজ" },
  { key: "yesterday", label: "গতকাল" },
];

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("access")}`,
});

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" }) : "-";

const CardBadge = ({ status }) => (
  <span
    className={`px-2 py-1 text-xs rounded ${
      status === "active"
        ? "bg-green-500/15 text-green-400"
        : "bg-gray-500/20 text-gray-400"
    }`}
  >
    {status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
  </span>
);

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  const fetchCustomers = async (type) => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/auth/admin/users", {
        params: type ? { filter_type: type } : {},
        headers: authHeader(),
      });

      setCustomers(res.data?.users || []);
      setTodayCount(res.data?.today_registrations || 0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "ডাটা লোড করা যায়নি");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(filterType);
  }, [filterType]);

  const q = search.trim().toLowerCase();
  const filtered = customers.filter(
    (c) =>
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.phone_number?.includes(search.trim()) ||
      c.unique_id?.includes(search.trim())
  );

  return (
    <div className="bg-[#0b1220] text-white min-h-screen">
      {/* মোবাইলে উপরে নেভ বারের জায়গা, ডেস্কটপে বাঁ দিকে সাইডবারের জায়গা */}
      <div className="pt-16 px-4 pb-8 md:pt-6 md:ml-64 md:p-6">
        {/* HEADER */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-[#D4AF37]">সব গ্রাহক</h1>
          <span className="text-sm text-gray-400">
            আজকের রেজিস্ট্রেশন: <b className="text-[#D4AF37]">{todayCount}</b>
          </span>
        </div>

        {/* FILTER TABS */}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:flex">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-4 py-2 sm:py-1.5 rounded-lg text-sm border transition ${
                filterType === f.key
                  ? "bg-[#D4AF37] text-[#0b1220] border-[#D4AF37] font-semibold"
                  : "bg-[#0f1b2d] text-gray-300 border-[#D4AF37]/30 hover:border-[#D4AF37]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="নাম, ফোন বা ইউনিক আইডি দিয়ে সার্চ করুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 p-2.5 rounded-lg w-full md:w-1/3 text-sm bg-[#0f1b2d] text-white placeholder-gray-500
            border border-[#D4AF37]/30 outline-none focus:border-[#D4AF37]"
        />

        {loading && <p className="mt-4 text-gray-400">Loading...</p>}
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

        {!loading && (
          <>
            {/* ================= MOBILE: CARDS ================= */}
            <div className="mt-5 space-y-3 md:hidden">
              {filtered.length > 0 ? (
                filtered.map((u) => (
                  <div
                    key={u.id}
                    className="bg-[#0f1b2d] rounded-xl border border-[#D4AF37]/20 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#D4AF37] truncate">{u.name}</p>
                        <p className="text-sm text-gray-300">{u.phone_number}</p>
                      </div>
                      <CardBadge status={u.card_status} />
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-gray-500">লোন (সংখ্যা / মোট)</dt>
                        <dd className="text-gray-100">
                          {u.loan_count} / ৳{u.total_loan_amount}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">ব্যালেন্স</dt>
                        <dd className="text-gray-100">৳{u.balance ?? 0}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-gray-500">রেজিস্ট্রেশন</dt>
                        <dd className="text-gray-100">{formatDate(u.created_at)}</dd>
                      </div>
                    </dl>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-gray-400">কোন গ্রাহক পাওয়া যায়নি</p>
              )}
            </div>

            {/* ================= DESKTOP: TABLE ================= */}
            <div className="mt-6 hidden md:block overflow-x-auto rounded-lg border border-[#D4AF37]/20">
              <table className="w-full bg-[#0f1b2d]">
                <thead className="bg-[#16243a] text-[#D4AF37]">
                  <tr>
                    <th className="p-3 text-left">নাম</th>
                    <th className="p-3 text-left">ফোন</th>
                    <th className="p-3 text-left">কার্ড</th>
                    <th className="p-3 text-left">লোন (সংখ্যা / মোট)</th>
                    <th className="p-3 text-left">ব্যালেন্স</th>
                    <th className="p-3 text-left">রেজিস্ট্রেশন</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((u) => (
                      <tr key={u.id} className="border-t border-[#D4AF37]/10 hover:bg-[#16243a]">
                        <td className="p-3">{u.name}</td>
                        <td className="p-3">{u.phone_number}</td>
                        <td className="p-3">
                          <CardBadge status={u.card_status} />
                        </td>
                        <td className="p-3">
                          {u.loan_count} / ৳{u.total_loan_amount}
                        </td>
                        <td className="p-3">৳{u.balance ?? 0}</td>
                        <td className="p-3 text-sm text-gray-400">{formatDate(u.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 text-gray-400" colSpan="6">
                        কোন গ্রাহক পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Customers;
