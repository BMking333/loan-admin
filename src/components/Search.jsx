import React, { useState } from "react";
import api from "../services/api";

const Search = ({ onResult, onLoading }) => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!phone) return;

    setLoading(true);
    setError("");
    onLoading(true);

    try {
      const res = await api.post(
        "/user/kyc/search-by-phone",
        { phone_number: phone },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
            "Content-Type": "application/json",
          },
        }
      );

      onResult(res.data);
    } catch (err) {
      setError("User পাওয়া যায়নি");
      onResult(null);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 relative mt-6 md:mt-0">

      {/* INPUT */}
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Customer Number"
        className="px-4 py-2 rounded-full bg-[#0f172a] text-white text-sm
        border border-gray-700 outline-none w-full max-w-xs focus:border-blue-500"
      />

      {/* BUTTON */}
      <button
        onClick={handleSearch}
        disabled={loading}
        className={`px-5 py-2 rounded-full text-sm font-medium transition
        ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-[#0f172a] hover:bg-blue-600"
        }`}
      >
        {loading ? "..." : "Search"}
      </button>

      {/* ERROR */}
      {error && (
        <p className="absolute top-full left-0 text-red-400 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Search;
