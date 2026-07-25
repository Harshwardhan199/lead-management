import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  LogIn,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Globe,
} from "lucide-react";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const dashboardLabel = isAdmin ? "Admin Dashboard" : "My Leads";
  const isHomePage = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-all">
      <nav className="max-w-7xl mx-auto bg-[#FAF8F0]/90 backdrop-blur-xl border border-[#C5C2B4]/80 rounded-full px-5 h-14 flex items-center justify-between shadow-xs">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-1.5 bg-[#2A4B3A] rounded-full shadow-sm shadow-[#2A4B3A]/20 group-hover:scale-105 transition-transform text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-black text-base tracking-tight text-[#161D18]">
            Digital Heroes <span className="text-[#2A4B3A]">CRM</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <>
              {/* Single Contextual Quick Link */}
              {isHomePage ? (
                <Link
                  to="/dashboard"
                  className="text-xs font-bold uppercase tracking-wider text-[#575D58] hover:text-[#161D18] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#EAE7DC]/60"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#2A4B3A]" />
                  <span>{dashboardLabel}</span>
                </Link>
              ) : (
                <Link
                  to="/"
                  className="text-xs font-bold uppercase tracking-wider text-[#575D58] hover:text-[#161D18] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#EAE7DC]/60"
                >
                  <Globe className="w-4 h-4 text-[#2A4B3A]" />
                  <span>Public Portal</span>
                </Link>
              )}

              <div className="flex items-center gap-2 pl-4 border-l border-[#C5C2B4]/60">
                {/* User Pill */}
                <div className="flex items-center gap-2.5 bg-[#EAE7DC]/80 border border-[#C5C2B4] rounded-full pl-1.5 pr-2 py-1">
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-[#2A4B3A] text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-sm">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  {/* Name */}
                  <span className="text-[13px] font-bold text-[#161D18] leading-none tracking-tight">
                    {user.name?.split(" ")[0]}
                  </span>
                  {/* Divider */}
                  {/* <span className="w-px h-3.5 bg-[#C5C2B4] rounded-full shrink-0" /> */}
                  {/* Role badge */}
                  <div
                    className={`flex items-center text-[10px] h-7 font-black uppercase tracking-widest px-2.5 py-1 rounded-full leading-none shrink-0 ${
                      isAdmin
                        ? "bg-[#2A4B3A] text-white"
                        : "bg-[#49755B] text-[#2A4B3A]"
                    }`}
                  >
                    {user.role}
                  </div>
                </div>

                {/* Logout */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  title="Sign Out"
                  className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-all border border-transparent hover:border-rose-200 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-5 py-2 bg-[#2A4B3A] hover:bg-[#1E372B] text-white font-bold text-xs rounded-full shadow-md shadow-[#2A4B3A]/20 transition-all hover:scale-105 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-stone-700 hover:text-[#161D18] rounded-full hover:bg-[#EAE7DC]/60 focus:outline-none"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="md:hidden max-w-7xl mx-auto mt-2 bg-[#FAF8F0]/95 backdrop-blur-xl border border-[#C5C2B4]/80 rounded-3xl p-4 space-y-4 shadow-xl"
          >
            {user ? (
              <>
                {/* User Profile Card */}
                <div className="p-3 bg-[#EAE7DC] border border-[#C5C2B4]/80 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2A4B3A] text-white font-black text-xs flex items-center justify-center shrink-0">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#161D18] leading-tight">
                          {user.name}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full leading-tight ${
                            isAdmin
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-[#49755B]/20 text-[#2A4B3A] border border-[#49755B]/30"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#575D58]">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Single Contextual Quick Link */}
                <div className="space-y-1">
                  {isHomePage ? (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-[#161D18] hover:bg-[#EAE7DC]/60"
                    >
                      <div className="p-1.5 bg-[#FAF8F0] border border-[#C5C2B4]/80 rounded-xl text-[#2A4B3A] shadow-xs">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <span>{dashboardLabel}</span>
                    </Link>
                  ) : (
                    <Link
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-[#161D18] hover:bg-[#EAE7DC]/60"
                    >
                      <div className="p-1.5 bg-[#FAF8F0] border border-[#C5C2B4]/80 rounded-xl text-[#2A4B3A] shadow-xs">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span>Public Portal</span>
                    </Link>
                  )}
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-full transition-all active:scale-98"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2A4B3A] text-white font-bold text-xs rounded-full shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
