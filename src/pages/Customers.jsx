import React, { useEffect, useState } from "react";
import api from "../services/api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const res = await api.get("/user/kyc/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone_number?.includes(search)
  );

  return (
    <div className="ml-64 p-6 bg-gray-100 min-h-screen">

      {/* TITLE */}
      <h1 className="text-2xl font-bold text-indigo-600">
        সব গ্রাহক
      </h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="নাম বা ফোন দিয়ে সার্চ করুন..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 p-2 border rounded-lg w-full md:w-1/3"
      />

      {/* LOADING */}
      {loading && (
        <p className="mt-4 text-gray-500">Loading...</p>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">নাম</th>
                <th className="p-3 text-left">ফোন</th>
                <th className="p-3 text-left">স্ট্যাটাস</th>
                <th className="p-3 text-left">ব্যালেন্স</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{user.full_name}</td>
                    <td className="p-3">{user.phone_number}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                        {user.status || "active"}
                      </span>
                    </td>
                    <td className="p-3">{user.balance || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-gray-500" colSpan="5">
                    কোন গ্রাহক পাওয়া যায়নি
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