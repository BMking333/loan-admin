import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const menuItems = [
  { name: "ড্যাশবোর্ড", path: "/dashboard" },
  { name: "গ্রাহক নিরীক্ষা", path: "/audit" },
  { name: "সব গ্রাহক", path: "/customers" },
  { name: "নথি তৈরী", path: "/documents" },
  { name: "রিপোর্ট", path: "/reports" },
  { name: "পেমেন্ট মেথড", path: "/admin/payment" },
  { name: "পাসওয়ার্ড পরিবর্তন", path: "/change-password" },
  { name: "অন্যান্য", path: "/others" },
];

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* মেনু খোলা থাকলে পেছনের স্ক্রল বন্ধ + Esc দিয়ে বন্ধ */
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* ================= Mobile Top Bar ================= */}
      <div
        className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b border-gray-800 bg-black px-4 text-white md:hidden"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          height: "calc(56px + env(safe-area-inset-top, 0px))",
        }}
      >
        <h2 className="text-[19px] font-bold">ম্যানেজার</h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10 active:scale-95"
          aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
          aria-expanded={open}
        >
          {open ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>
      </div>

      {/* ================= Overlay ================= */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/70 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* ================= Sidebar ================= */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-[100dvh] w-[80%] max-w-[300px] flex-col
          border-r border-gray-800 bg-black p-4 text-white
          transform transition-transform duration-300 ease-out
          md:w-64 md:max-w-none md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top, 0px))",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
        }}
        aria-label="প্রধান মেনু"
      >
        {/* Title */}
        <h2 className="mb-6 hidden text-[22px] font-bold md:block">ম্যানেজার</h2>

        {/* Mobile menu header */}
        <div className="mb-4 flex items-center justify-between md:hidden">
          <h2 className="text-[20px] font-bold">মেনু</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10 active:scale-95"
            aria-label="মেনু বন্ধ করুন"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex min-h-[48px] items-center rounded-xl px-4 text-[17px] transition active:scale-[0.98] ${
                  isActive
                    ? "bg-white font-bold text-black"
                    : "font-medium text-white/90 hover:bg-gray-900"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 min-h-[48px] rounded-xl bg-red-600 px-4 text-[17px] font-bold transition hover:bg-red-700 active:scale-[0.98]"
        >
          লগ আউট
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
