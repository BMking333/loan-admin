import React, { useEffect, useState } from "react";
import api from "../services/api";

// ইউজার অ্যাপের URL (Netlify-র আসল URL দিন, শেষে / ছাড়া)
const USER_APP_URL =
  import.meta.env.VITE_USER_APP_URL || "https://loan.microfinancedevelopmentprojectbangladesh.com";

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
  const [loginLoadingId, setLoginLoadingId] = useState(null);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  });

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

  // ========= LOGIN AS USER =========
  const loginAsUser = async (u) => {
    if (!window.confirm(`"${u.name}" (${u.phone_number}) হিসেবে লগইন করবেন?`)) return;

    try {
      setLoginLoadingId(u.id);

      const body = new URLSearchParams();
      body.append("phone_number", u.phone_number);

      const res = await api.post("/auth/admin/login-as-user", body, {
        headers: {
          ...authHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { access_token, impersonation } = res.data;

      // টোকেন URL fragment-এ পাঠানো হচ্ছে (সার্ভারে যায় না)
      const params = new URLSearchParams({
        impersonate_token: access_token,
        by: impersonation?.by_name || "",
        by_role: impersonation?.by_role || "",
      });

      window.open(`${USER_APP_URL}/#${params.toString()}`, "_blank");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "ইউজার হিসেবে লগইন করা যায়নি");
    } finally {
      setLoginLoadingId(null);
    }
  };

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
                <th className="p-3 text-left">অ্যাকশন</th>
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
                    <td className="p-3">
                      <button
                        onClick={() => loginAsUser(u)}
                        disabled={loginLoadingId === u.id}
                        className="px-3 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {loginLoadingId === u.id ? "..." : "ইউজার হিসেবে লগইন"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-gray-500" colSpan="9">
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
