import React from "react";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-100 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;