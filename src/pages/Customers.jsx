// src/pages/Customers.jsx
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

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("access")}`,
});

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" }) : "-";

const CardBadge = ({ status }) => (
  <span
    className={`px-2 py-1 text-xs rounded ${
      status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
    }`}
  >
    {status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
  </span>
);

const LoginButton = ({ onClick, loading, className = "" }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50 ${className}`}
  >
    {loading ? "..." : "ইউজার হিসেবে লগইন"}
  </button>
);

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loginLoadingId, setLoginLoadingId] = useState(null);

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

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* মোবাইলে উপরে নেভ বারের জায়গা, ডেস্কটপে বাঁ দিকে সাইডবারের জায়গা */}
      <div className="pt-16 px-4 pb-8 md:pt-6 md:ml-64 md:p-6">
        {/* HEADER */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-indigo-600">সব গ্রাহক</h1>
          <span className="text-sm text-gray-600">
            আজকের রেজিস্ট্রেশন: <b>{todayCount}</b>
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
          className="mt-4 p-2.5 border rounded-lg w-full md:w-1/3 text-sm outline-none focus:border-indigo-500"
        />

        {loading && <p className="mt-4 text-gray-500">Loading...</p>}
        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

        {!loading && (
          <>
            {/* ================= MOBILE: CARDS ================= */}
            <div className="mt-5 space-y-3 md:hidden">
              {filtered.length > 0 ? (
                filtered.map((u) => (
                  <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                        <p className="text-sm text-gray-600">{u.phone_number}</p>
                      </div>
                      <CardBadge status={u.card_status} />
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-gray-500">ID</dt>
                        <dd className="text-gray-800">{u.id}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">ইউনিক আইডি</dt>
                        <dd className="text-gray-800 break-all">{u.unique_id}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">লোন (সংখ্যা / মোট)</dt>
                        <dd className="text-gray-800">
                          {u.loan_count} / ৳{u.total_loan_amount}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">ব্যালেন্স</dt>
                        <dd className="text-gray-800">৳{u.balance ?? 0}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-gray-500">রেজিস্ট্রেশন</dt>
                        <dd className="text-gray-800">{formatDate(u.created_at)}</dd>
                      </div>
                    </dl>

                    <LoginButton
                      onClick={() => loginAsUser(u)}
                      loading={loginLoadingId === u.id}
                      className="mt-4 w-full py-2.5"
                    />
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-gray-500">কোন গ্রাহক পাওয়া যায়নি</p>
              )}
            </div>

            {/* ================= DESKTOP: TABLE ================= */}
            <div className="mt-6 hidden md:block overflow-x-auto">
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
                          <CardBadge status={u.card_status} />
                        </td>
                        <td className="p-3">
                          {u.loan_count} / ৳{u.total_loan_amount}
                        </td>
                        <td className="p-3">৳{u.balance ?? 0}</td>
                        <td className="p-3 text-sm text-gray-600">{formatDate(u.created_at)}</td>
                        <td className="p-3">
                          <LoginButton
                            onClick={() => loginAsUser(u)}
                            loading={loginLoadingId === u.id}
                            className="px-3 py-1"
                          />
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
          </>
        )}
      </div>
    </div>
  );
};

export default Customers;
