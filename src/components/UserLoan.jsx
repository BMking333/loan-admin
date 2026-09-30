import React from "react";
import LoanEditCard from "./LoanEditCard";

const UserLoan = ({ user }) => {
  if (!user || !user.loans || user.loans.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <p className="text-gray-400">কোনো ঋণ পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {user.loans.map((loan) => (
        <LoanEditCard key={loan.loan_id} loan={loan} />
      ))}
    </div>
  );
};

export default UserLoan;