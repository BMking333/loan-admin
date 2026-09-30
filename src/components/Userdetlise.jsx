import React, { useState, useEffect } from "react";
import api from "../services/api";

const Userdetlise = ({ data }) => {
  if (!data) return null;

  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(data?.status || "Active");
  const [balance, setBalance] = useState(data?.balance || 0);
  const [fullName, setFullName] = useState(data?.full_name || "");
  const [cardActive, setCardActive] = useState(true);

  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(
    data?.assigned_staff_name || ""
  );

  const [loading, setLoading] = useState(false);

  // ✅ check assigned
  const isStaffAssigned = !!data?.assigned_staff_name;

  const rowClass =
    "grid grid-cols-[110px_16px_minmax(0,1fr)] items-center gap-2";

  // ================= STAFF LOAD =================
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const res = await api.get("/user/kyc/staff-list", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        setStaffList(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadStaff();
  }, []);

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const form = new FormData();

      form.append("user_id", String(data.id));
      form.append("full_name", fullName || "");
      form.append("balance", String(Number(balance)));
      form.append("status", status);

      // ✅ only send if not already assigned
      if (!isStaffAssigned && selectedStaff) {
        form.append("assigned_staff_name", selectedStaff);
      }

      const res = await api.post("/user/kyc/account/update", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("UPDATED:", res.data);
    } catch (err) {
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f1b2d] text-white rounded-2xl p-6 mt-6 shadow-lg max-w-full overflow-hidden">

      <h2 className="text-xl font-bold mb-3">গ্রাহক তথ্য</h2>

      <p className="text-sm text-gray-300 mb-4">
        তৈরি: {new Date(data.created_at).toLocaleString()} <br />
        আপডেট: {new Date(data.updated_at).toLocaleString()}
      </p>

      <div className="space-y-4">

        {/* ================= STAFF ================= */}
        <div className={rowClass}>
          <label className="whitespace-nowrap">স্টাফ</label>
          <span>:</span>

          {isStaffAssigned ? (
            // 🔒 LOCKED
            <input
              value={data.assigned_staff_name}
              disabled
              className="bg-gray-700 border border-gray-600 p-2 rounded w-full cursor-not-allowed"
            />
          ) : (
            // ✅ DROPDOWN
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="bg-[#1e2a3d] border border-gray-600 p-2 rounded w-full min-w-0"
            >
              <option value="">-- নির্বাচন করুন --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* FULL NAME */}
        <div className={rowClass}>
          <label>পুরো নাম</label>
          <span>:</span>

          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-[#1e2a3d] border border-gray-600 p-2 rounded w-full min-w-0"
          />
        </div>

        {/* BALANCE */}
        <div className={rowClass}>
          <label>ব্যালেন্স</label>
          <span>:</span>

          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="bg-[#1e2a3d] border border-gray-600 p-2 rounded w-full min-w-0"
          />
        </div>

        {/* STATUS */}
        <div className={rowClass}>
          <label>স্ট্যাটাস</label>
          <span>:</span>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#1e2a3d] border border-gray-600 p-2 rounded w-full min-w-0"
          >
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>

        {/* CARD TOGGLE */}
        <div className={rowClass}>
          <label>কার্ড</label>
          <span>:</span>

          <div
            onClick={() => setCardActive(!cardActive)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
              cardActive ? "bg-blue-500" : "bg-gray-500"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full transition ${
                cardActive ? "translate-x-6" : ""
              }`}
            />
          </div>
        </div>

        {/* COMMENT */}
        <div className={rowClass + " items-start"}>
          <label>মন্তব্য</label>
          <span>:</span>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-[#1e2a3d] border border-gray-600 p-3 rounded w-full min-w-0"
          />
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleUpdate}
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

export default Userdetlise;
