import React, { useState } from "react";
import api from "../services/api";

const Page = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("phone_number", phoneNumber);
      formData.append("new_password", newPassword);

      await api.post("/auth/admin/user-reset-password", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      alert("Password Reset Successfully");

      setPhoneNumber("");
      setNewPassword("");

    } catch (err) {
      console.error(err);
      alert("Reset Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 ml-64">

      <h1 className="text-2xl font-bold text-indigo-600 mb-6">
        🔐 পাসওয়ার্ড রিসেট
      </h1>

      <form
        onSubmit={handleReset}
        className="bg-white p-6 rounded-xl shadow max-w-md space-y-4"
      >

        {/* PHONE */}
        <div>
          <label className="text-gray-600 text-sm">ফোন নম্বর</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter phone number"
            required
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="text-gray-600 text-sm">নতুন পাসওয়ার্ড</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter new password"
            required
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

      </form>

    </div>
  );
};

export default Page;