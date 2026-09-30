import React, { useEffect, useState } from "react";
import api from "../services/api";

const FILTERS = [
  { key: "", label: "সব" },
  { key: "today", label: "আজ" },
  { key: "yesterday", label: "গতকাল" },
];

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

      const res = await api.get("/admin/users", {
        params: type ? { filter_type: type } : {},
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      setCustomers(res.data?.users || []);
      setTodayCount(res.data?.today_registrations || 0);
    } catch (err) {
      console.error(err);
      setError("ডাটা লোড করা যায়নি");
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

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })
      : "-";

  return (
    <div className="ml-64 p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-600">সব গ্রাহক</h1>
        <span className="text-sm text-gray-600">
          আজকের রেজিস্ট্রেশন: <b>{todayCount}</b>
        </span>
      </div>

      {/* FILTER TABS */}
      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterType(f.key)}
            className={`px-4 py-1.5 rounded-lg text-sm border ${
              filterType === f.key
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 hover:bg-gray-50"
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
        className="mt-4 p-2 border rounded-lg w-full md:w-1/3"
      />

      {loading && <p className="mt-4 text-gray-500">Loading...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {!loading && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">ইউনিক আইডি</th>
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
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{u.id}</td>
                    <td className="p-3">{u.unique_id}</td>
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.phone_number}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          u.card_status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {u.card_status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.loan_count} / ৳{u.total_loan_amount}
                    </td>
                    <td className="p-3">৳{u.balance ?? 0}</td>
                    <td className="p-3 text-sm text-gray-600">{formatDate(u.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-gray-500" colSpan="8">
                    কোন গ্রাহক পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Customers;
