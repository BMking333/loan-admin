import React, { useState, useEffect } from "react";

import BKash from "../assets/icons/BKash.png";
import Nagad from "../assets/icons/Nagad.png";

const Dashboard = () => {
  const [months, setMonths] = useState(null);
  const [amount, setAmount] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const interestRate = 2.4;

  const [result, setResult] = useState({
    monthly: 0,
    total: 0,
  });

  /* ================= FETCH PAYMENT ================= */
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch(
        "https://loan.microfinancedevelopmentprojectbangladesh.com/paymentmethod/active"
      );
      const data = await res.json();

      // ✅ ONLY BKASH + NAGAD
      const filtered = data.filter((item) => {
        const name = item.method_name?.toLowerCase();
        return name === "bkash" || name === "nagad";
      });

      setPaymentMethods(filtered);
    } catch (err) {
      console.log("Payment method load error", err);
    }
  };

  /* ================= CALC ================= */
  useEffect(() => {
    if (!months || !amount) {
      setResult({ monthly: 0, total: 0 });
      return;
    }
    calculateLoan();
  }, [months, amount]);

  const calculateLoan = () => {
    const yearlyInterest = (amount * interestRate) / 100;
    const totalInterest = (yearlyInterest / 12) * months;

    const totalPayable = amount + totalInterest;
    const monthlyInstallment = totalPayable / months;

    setResult({
      monthly: Math.round(monthlyInstallment),
      total: Math.round(totalPayable),
    });
  };

  const monthOptions = [12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120];

  const amountOptions = [
    50000,100000,150000,200000,300000,400000,
    500000,600000,700000,800000,900000,
    1000000,1500000,2000000,2500000,3000000,
  ];

  const formatAmount = (value) => {
    if (value >= 100000) return `${value / 100000} লক্ষ`;
    if (value >= 1000) return `${value / 1000} হাজার`;
    return value;
  };

  const getIcon = (name) => {
    const m = name?.toLowerCase();

    if (m === "bkash") return BKash;
    if (m === "nagad") return Nagad;

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:ml-64 md:p-6">

      {/* ================= PAYMENT METHODS ================= */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">
          💳 এজেন্ট পেমেন্ট নম্বর
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {paymentMethods.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg"
            >

              <img
                src={getIcon(item.method_name)}
                className="w-12 h-12 object-contain"
                alt={item.method_name}
              />

              <div>
                <p className="font-bold capitalize">
                  {item.method_name === "bkash"
                    ? "বিকাশ"
                    : item.method_name === "nagad"
                    ? "নগদ"
                    : item.method_name}
                </p>

                <p className="text-sm opacity-80">
                  {item.account_number}
                </p>
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* ================= LOAN ================= */}
      <div className="space-y-6">

        {/* MONTH */}
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
          <h2 className="font-bold mb-3">মাস নির্বাচন</h2>

          <div className="flex flex-wrap gap-2">
            {monthOptions.map((m) => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`px-3 py-2 rounded-lg border ${
                  months === m ? "bg-blue-600" : "bg-white/10"
                }`}
              >
                {m} মাস
              </button>
            ))}
          </div>
        </div>

        {/* AMOUNT */}
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
          <h2 className="font-bold mb-3">টাকা নির্বাচন</h2>

          <div className="flex flex-wrap gap-2">
            {amountOptions.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`px-3 py-2 rounded-lg border ${
                  amount === a ? "bg-blue-600" : "bg-white/10"
                }`}
              >
                {formatAmount(a)}
              </button>
            ))}
          </div>
        </div>

        {/* RESULT */}
        <div className="bg-gradient-to-br from-blue-600/30 to-indigo-900/40 p-5 rounded-2xl border border-blue-500/30">
          <h2 className="font-bold mb-3">ঋণের হিসাব</h2>

          {months && amount ? (
            <>
              <p>💸 সুদ: <b>{interestRate}%</b></p>
              <p>📅 সময়: <b>{months} মাস</b></p>
              <p>💰 টাকা: <b>{amount.toLocaleString()}</b></p>

              <hr className="my-3 opacity-30" />

              <p className="text-lg">
                📆 মাসিক কিস্তি:{" "}
                <b className="text-green-300">
                  {result.monthly.toLocaleString()}
                </b>
              </p>

              <p className="text-lg">
                💵 মোট:{" "}
                <b className="text-yellow-300">
                  {result.total.toLocaleString()}
                </b>
              </p>
            </>
          ) : (
            <p className="opacity-70">
              👉 আগে মাস ও টাকা নির্বাচন করুন
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
