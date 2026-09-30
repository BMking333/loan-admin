import React, { useState } from "react";
import Search from "../components/Search";
import Userdetlise from "../components/Userdetlise";
import Userfulldetlise from "../components/Userfulldetlise";
import Payment from "../components/Payment";
import UserLoan from "../components/UserLoan";

const Useraudit = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResult = (data) => {
    if (!data) {
      setUser(null);
      return;
    }
    setUser(data);
  };

  const handleLoading = (value) => {
    setLoading(value);
  };

  const refreshUser = (updatedData) => {
    setUser(updatedData);
  };

  return (
    <div className="bg-[#0b1220] text-white min-h-screen">

      {/* ✅ mobile + desktop spacing fix */}
      <div className="pt-14 md:pt-6 p-4 md:ml-64 md:p-6">

        {/* SEARCH */}
        <Search onResult={handleResult} onLoading={handleLoading} />

        {/* LOADING */}
        {loading && (
          <div className="mt-6 flex justify-center items-center gap-2 text-gray-400">
            <span className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
            Loading...
          </div>
        )}

        {/* DATA */}
        {user && !loading && (
          <div className="space-y-5 mt-6">
            <Userdetlise data={user} />
            <Userfulldetlise data={user} />
            <Payment data={user} />
            <UserLoan user={user} refreshUser={refreshUser} />
          </div>
        )}

      </div>
    </div>
  );
};

export default Useraudit;
