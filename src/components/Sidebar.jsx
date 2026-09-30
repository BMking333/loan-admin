import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { name: "ড্যাশবোর্ড", path: "/dashboard" },
    { name: "গ্রাহক নিরীক্ষা", path: "/audit" },
    { name: "পাসওয়ার্ড পরিবর্তন", path: "/change-password" },
    { name: "সব গ্রাহক", path: "/customers" },
    { name: "নথি তৈরী", path: "/documents" },
    { name: "রিপোর্ট", path: "/reports" },
    { name: "অন্যান্য", path: "/others" },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-black text-white border-b border-gray-800 p-3 flex justify-between items-center z-50">
        <h2 className="font-bold">ম্যানেজার</h2>
        <button onClick={() => setOpen(!open)}>
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black z-40 md:hidden opacity-70"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 bg-black text-white
          flex flex-col p-4 border-r border-gray-800 z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Title */}
        <h2 className="text-xl font-bold mb-6 hidden md:block">
          ম্যানেজার
        </h2>

        {/* Menu */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto mt-10 md:mt-0">
          {menuItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `p-3 rounded-lg transition ${
                  isActive
                    ? "bg-white text-black font-semibold"
                    : "hover:bg-gray-900"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-600 hover:bg-red-700 p-3 rounded-lg transition"
        >
          লগ আউট
        </button>
      </div>
    </>
  );
};

export default Sidebar;
