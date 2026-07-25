import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
  useParams,
  Outlet,
} from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  UserCheck,
  Trash2,
  RefreshCw,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Inbox,
  Clock,
  CheckCircle,
  UserX,
  ShieldCheck,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Shield,
  Info,
  ArrowLeft,
  Building2,
  Phone,
  Send,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  X,
  Menu,
  Activity,
  Layers,
  Check,
} from "lucide-react";

// ============================================================================
// 1. AXIOS CONFIGURATION & INTERCEPTORS
// ============================================================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401 & Automatic Refresh Token Rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = refreshResponse.data.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// ============================================================================
// 2. AUTHENTICATION CONTEXT & STATE MANAGEMENT
// ============================================================================

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));

  const checkAuth = async () => {
    const storedToken = localStorage.getItem("accessToken");
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      setUser(response.data.data.user);
    } catch (error) {
      console.error("Authentication verification failed:", error);
      setUser(null);
      localStorage.removeItem("accessToken");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { user: userData, accessToken } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
    setUser(userData);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    const { user: userData, accessToken } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
    setUser(userData);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    checkAuth,
    isAdmin: user?.role === "admin",
    isMember: user?.role === "member",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ============================================================================
// 3. UI HELPERS, SKELETONS & BADGES
// ============================================================================

const SkeletonLoader = ({ count = 5 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="h-16 bg-gray-100 rounded-2xl w-full flex items-center justify-between px-6"
        >
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-40" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-8 bg-gray-200 rounded-xl w-24" />
        </div>
      ))}
    </div>
  );
};

const SkeletonPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="space-y-4 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto"
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          Loading workspace...
        </p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    New: 'bg-[#2A4B3A]/10 text-[#2A4B3A] border-[#2A4B3A]/30',
    Contacted: 'bg-amber-100/70 text-amber-900 border-amber-300',
    Qualified: 'bg-[#49755B]/20 text-[#2A4B3A] border-[#49755B]/40 font-bold',
    'Proposal Sent': 'bg-stone-200/80 text-stone-900 border-stone-300',
    Won: 'bg-[#2A4B3A] text-white border-[#2A4B3A] font-black shadow-xs',
    Lost: 'bg-rose-100/70 text-rose-900 border-rose-300',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border leading-none tracking-wide ${
        styles[status] || styles.New
      }`}
    >
      {status}
    </span>
  );
};

const Pagination = ({ pagination, onPageChange }) => {
  const { page, totalPages, total, limit } = pagination;

  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 text-xs text-gray-500">
      <div>
        Showing <span className="font-semibold text-gray-900">{start}</span> to{" "}
        <span className="font-semibold text-gray-900">{end}</span> of{" "}
        <span className="font-semibold text-gray-900">{total}</span> leads
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3.5 py-1.5 font-semibold text-gray-800 bg-white rounded-xl border border-gray-200 shadow-sm">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select option",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || {
    label: placeholder,
    value: '',
  };

  const isScrollable = options.length > 7;

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#FAF8F0] hover:bg-[#EAE7DC] border border-[#C5C2B4] rounded-2xl px-4 py-2.5 text-[#161D18] text-xs font-bold shadow-xs flex items-center justify-between gap-2 transition-all outline-none focus:border-[#2A4B3A]"
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown
          className={`w-4 h-4 text-stone-600 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#2A4B3A]' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 top-full mt-1.5 w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl shadow-2xl z-50 p-1.5 ${
              isScrollable ? 'max-h-60 overflow-y-auto' : 'max-h-none overflow-visible'
            }`}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors my-0.5 ${
                    isSelected
                      ? "bg-[#2A4B3A] text-white shadow-xs"
                      : "text-[#161D18] hover:bg-[#EAE7DC]"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0 ml-2" />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// 4. NAVBAR & FOOTER LAYOUT
// ============================================================================

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

              <div className="flex items-center gap-3 pl-4 border-l border-[#C5C2B4]/60">
                {/* User Profile Pill Badge */}
                <div className="flex items-center gap-2 px-3 py-1 bg-[#EAE7DC] border border-[#C5C2B4]/80 rounded-full">
                  <div className="w-5 h-5 rounded-full bg-[#2A4B3A] text-white font-black text-[11px] flex items-center justify-center shrink-0">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="text-xs font-bold text-[#161D18] leading-none">
                    {user.name}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full leading-none ${
                      isAdmin
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-[#49755B]/20 text-[#2A4B3A] border border-[#49755B]/30"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-stone-600 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-all border border-transparent hover:border-rose-200 flex items-center justify-center shrink-0"
                >
                  <LogOut className="w-4 h-4" />
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

const Footer = () => {
  return (
    <footer className="bg-[#E7E4D8] border-t border-[#C5C2B4]/80 py-3.5 text-center text-xs text-[#575D58] shrink-0">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-medium">
          © {new Date().getFullYear()} Enterprise Lead Management System. All
          rights reserved.
        </p>
        <p className="flex items-center gap-1.5 font-medium">
          <span>Built for</span>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#2A4B3A] hover:text-[#1E372B] underline underline-offset-4 decoration-[#2A4B3A]/30 transition-colors"
          >
            Digital Heroes Training Task
          </a>
        </p>
      </div>
    </footer>
  );
};

// ============================================================================
// 5. ROUTE GUARDS
// ============================================================================

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SkeletonPage />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// ============================================================================
// 6. MODAL IMPLEMENTATIONS
// ============================================================================

const ModalBackdrop = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 10 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white/95 backdrop-blur-xl border border-stone-200/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5"
    >
      {children}
    </motion.div>
  </motion.div>
);

const CreateLeadModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    status: "New",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await api.post("/leads", formData);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
        status: "New",
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalBackdrop onClose={onClose}>
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Create New Lead</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555-0199"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Acme Inc."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Initial Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Message
            </label>
            <textarea
              name="message"
              rows={2}
              value={formData.message}
              onChange={handleChange}
              placeholder="Lead inquiry details..."
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Lead"}
            </button>
          </div>
        </form>
      </ModalBackdrop>
    </AnimatePresence>
  );
};

const CreateAdminModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await api.post("/auth/admins", formData);
      setFormData({ name: "", email: "", password: "" });
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create admin user");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalBackdrop onClose={onClose}>
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">
              Create Admin Account
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Admin Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Admin"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </ModalBackdrop>
    </AnimatePresence>
  );
};

const AssignModal = ({ lead, isOpen, onClose, onAssigned }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedUserId(lead?.assignedTo?._id || "");
    }
  }, [isOpen, lead]);

  const fetchUsers = async () => {
    try {
      setFetchingUsers(true);
      const res = await api.get("/auth/users");
      setUsers(res.data.data || []);
    } catch (err) {
      setError("Failed to fetch team members");
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError("Please select a team member");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.patch(`/leads/${lead._id}/assign`, {
        assignedTo: selectedUserId,
      });
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign lead");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalBackdrop onClose={onClose}>
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">Assign Lead</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Select Team Member
            </label>
            {fetchingUsers ? (
              <SkeletonLoader count={2} />
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-emerald-500 outline-none"
              >
                <option value="">-- Select Member --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role}) - {u.email}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedUserId}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Assigning..." : "Confirm Assignment"}
            </button>
          </div>
        </form>
      </ModalBackdrop>
    </AnimatePresence>
  );
};

const ConfirmDeleteModal = ({ lead, isOpen, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");
      await api.delete(`/leads/${lead._id}`);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lead");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalBackdrop onClose={onClose}>
        <div className="flex items-center gap-3 text-rose-600 pb-2">
          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Confirm Deletion
            </h3>
            <p className="text-xs text-rose-500">
              This action cannot be undone
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Are you sure you want to permanently delete lead{" "}
          <span className="font-bold text-gray-900">{lead?.name}</span>?
        </p>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Lead"}
          </button>
        </div>
      </ModalBackdrop>
    </AnimatePresence>
  );
};

const StatusUpdateModal = ({ lead, isOpen, onClose, onUpdated }) => {
  const [status, setStatus] = useState("New");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lead) setStatus(lead.status || "New");
  }, [lead]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await api.patch(`/leads/${lead._id}`, { status });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalBackdrop onClose={onClose}>
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            Update Lead Status
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-emerald-500 outline-none"
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </ModalBackdrop>
    </AnimatePresence>
  );
};

const AddNoteModal = ({ lead, isOpen, onClose, onNoteAdded }) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    try {
      setLoading(true);
      setError("");
      await api.post(`/leads/${lead._id}/notes`, { note });
      setNote("");
      onNoteAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalBackdrop onClose={onClose}>
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Add Internal Note</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={4}
            required
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Record meeting outcomes, client requests..."
            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 text-sm focus:border-emerald-500 outline-none"
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !note.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </ModalBackdrop>
    </AnimatePresence>
  );
};

// ============================================================================
// 7. PUBLIC LEAD LANDING PAGE
// ============================================================================

const PublicLeadPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await api.post("/leads/public", formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (err) {
      const msg =
        err.response?.data?.errors?.join(", ") ||
        err.response?.data?.message ||
        "Failed to submit lead. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col justify-center py-4 lg:py-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#E7E4D8] text-[#161D18]"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#49755B]/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10 my-auto">
        {/* Left Content Banner */}
        <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#2A4B3A]/10 border border-[#2A4B3A]/20 text-[#2A4B3A] text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2A4B3A]" />
            <span>Digital Heroes CRM Platform</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-[#161D18] leading-[1.05]">
            NO MORE <br />
            <span className="text-[#2A4B3A]">MISSED DEADLINES.</span>
          </h1>

          <p className="text-[#575D58] text-xs sm:text-sm leading-relaxed font-medium">
            <span className="font-serif text-3xl sm:text-4xl text-[#2A4B3A] float-left mr-2 leading-none font-bold">
              W
            </span>
            e build custom software, mobile apps, web apps, and
            Shopify/WordPress development Solution. Done Fast, Done right, done
            once, <em className="italic font-serif">the first time.</em>
          </p>

          <div className="space-y-2 pt-1 text-xs sm:text-sm text-[#161D18]">
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <div className="p-1 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-full shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold">
                Automated lead routing & assignment
              </span>
            </div>
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <div className="p-1 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-full shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold">
                Complete timeline notes & audit history
              </span>
            </div>
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <div className="p-1 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-full shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold">
                Enterprise JWT token rotation security
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Form Card */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          {/* Form Container Card */}
          <div className="w-full bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-5 sm:p-6 shadow-2xl relative z-10">
            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8 space-y-3"
              >
                <div className="w-14 h-14 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-[#161D18]">
                  Inquiry Received!
                </h3>
                <p className="text-[#575D58] text-xs sm:text-sm max-w-md mx-auto font-medium">
                  Thank you for reaching out. A digital sales specialist will
                  review your details and connect with you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 px-6 py-2.5 bg-[#2A4B3A] hover:bg-[#1E372B] text-white font-bold rounded-full text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  Submit Another Request
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <h2 className="text-lg font-black text-[#161D18] tracking-tight">
                    Get in Touch
                  </h2>
                  <p className="text-[11px] text-[#575D58] font-medium">
                    Fill in your inquiry details below for a quick consultation.
                  </p>
                </div>

                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl pl-9 pr-3 py-2 text-[#161D18] text-xs sm:text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl pl-9 pr-3 py-2 text-[#161D18] text-xs sm:text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 555-0199"
                        className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl pl-9 pr-3 py-2 text-[#161D18] text-xs sm:text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Acme Inc."
                      className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl pl-9 pr-3 py-2 text-[#161D18] text-xs sm:text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                    Message / Scope
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
                    <textarea
                      name="message"
                      rows={2}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your lead goals..."
                      className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl pl-9 pr-3 py-2 text-[#161D18] text-xs sm:text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Full-Width Send Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#2A4B3A] hover:bg-[#1E372B] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#2A4B3A]/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2.5 mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Project Inquiry — Get Started</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// 8. LOGIN PAGE
// ============================================================================

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await register(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isRegistering ? "Create Your Account" : "Welcome Back"}
          </h2>
          <p className="text-sm text-gray-500">
            {isRegistering
              ? "Join your sales workspace to start managing leads"
              : "Sign in to access your CRM pipeline"}
          </p>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setError("");
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${!isRegistering ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setError("");
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${isRegistering ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
            </div>

            {isRegistering && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-medium">
                <Info className="w-4 h-4 shrink-0 text-blue-500" />
                <span>All new accounts are registered as Team Members.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Authenticating..."
              ) : isRegistering ? (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// 9. DASHBOARD PAGE
// ============================================================================

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();

  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [assignModalData, setAssignModalData] = useState({
    isOpen: false,
    lead: null,
  });
  const [deleteModalData, setDeleteModalData] = useState({
    isOpen: false,
    lead: null,
  });
  const [statusModalData, setStatusModalData] = useState({
    isOpen: false,
    lead: null,
  });
  const [noteModalData, setNoteModalData] = useState({
    isOpen: false,
    lead: null,
  });

  useEffect(() => {
    fetchLeads();
    if (isAdmin) fetchTeamMembers();
  }, [pagination.page, statusFilter, assignedFilter]);

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get("/auth/users");
      setTeamMembers(res.data.data || []);
    } catch (err) {}
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { page: pagination.page, limit: pagination.limit };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (assignedFilter) params.assignedTo = assignedFilter;

      const res = await api.get("/leads", { params });
      setLeads(res.data.data.leads || []);
      setPagination(
        res.data.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchLeads();
  };

  const stats = {
    total: pagination.total || 0,
    new: leads.filter((l) => l.status === "New").length,
    qualified: leads.filter((l) => l.status === "Qualified").length,
    won: leads.filter((l) => l.status === "Won").length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-4rem)] bg-gray-50 text-gray-900 p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Summary Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              {isAdmin ? "Admin Management Workspace" : "Member Workspace"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {isAdmin
                ? "Manage pipeline leads, team assignments, and system users"
                : "Manage your assigned leads, status updates, and call notes"}
            </p>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCreateAdminOpen(true)}
                className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-sm rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Create Admin</span>
              </button>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Lead</span>
              </button>
            </div>
          )}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Total Leads
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">
              {stats.total}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                New
              </span>
              <div className="p-2 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-full">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{stats.new}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Qualified
              </span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">
              {stats.qualified}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Won Deals
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{stats.won}</p>
          </motion.div>
        </div>

        {/* Filter Controls & Search (higher z-index relative z-30 for dropdown popovers) */}
        <div className="bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-4 shadow-xl space-y-4 relative z-30">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lead name, email, or company..."
                className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl pl-10 pr-4 py-2.5 text-[#161D18] placeholder-stone-500 text-xs sm:text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-44">
                <CustomSelect
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  options={[
                    { label: 'All Statuses', value: '' },
                    { label: 'New', value: 'New' },
                    { label: 'Contacted', value: 'Contacted' },
                    { label: 'Qualified', value: 'Qualified' },
                    { label: 'Proposal Sent', value: 'Proposal Sent' },
                    { label: 'Won', value: 'Won' },
                    { label: 'Lost', value: 'Lost' },
                  ]}
                  placeholder="All Statuses"
                />
              </div>

              {isAdmin && (
                <div className="w-44">
                  <CustomSelect
                    value={assignedFilter}
                    onChange={(val) => {
                      setAssignedFilter(val);
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                    options={[
                      { label: 'All Assignees', value: '' },
                      ...teamMembers.map((m) => ({ label: m.name, value: m._id })),
                    ]}
                    placeholder="All Assignees"
                  />
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2A4B3A] hover:bg-[#1E372B] text-white font-bold text-xs rounded-full shadow-md shadow-[#2A4B3A]/20 transition-all hover:scale-105 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Lead Table (Desktop) & Responsive Cards (Mobile) */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden">
          {error && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <SkeletonLoader count={5} />
          ) : leads.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Inbox className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">
                No Leads Found
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                No leads match your current search terms or active filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-bold uppercase text-gray-500 tracking-wider bg-gray-50/50">
                      <th className="py-3.5 px-4">Lead Name</th>
                      <th className="py-3.5 px-4">Company</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Assigned To</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.map((lead) => (
                      <tr
                        key={lead._id}
                        className="hover:bg-emerald-50/40 transition-colors group"
                      >
                        <td className="py-4 px-4 font-semibold text-gray-900 group-hover:text-emerald-700">
                          {lead.name}
                          <div className="text-xs text-gray-500 font-normal">
                            {lead.email}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {lead.company || "N/A"}
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-gray-700">
                          {lead.assignedTo ? (
                            lead.assignedTo.name
                          ) : (
                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/leads/${lead._id}`}
                              title="View Details"
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {isAdmin && (
                              <button
                                onClick={() =>
                                  setAssignModalData({ isOpen: true, lead })
                                }
                                title="Assign Lead"
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setStatusModalData({ isOpen: true, lead })
                              }
                              title="Update Status"
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setNoteModalData({ isOpen: true, lead })
                              }
                              title="Add Note"
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() =>
                                  setDeleteModalData({ isOpen: true, lead })
                                }
                                title="Delete Lead"
                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead._id}
                    className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-gray-900 text-base">
                          {lead.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lead.email}
                        </div>
                      </div>
                      <StatusBadge status={lead.status} />
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        <span className="font-semibold text-gray-800">
                          Company:
                        </span>{" "}
                        {lead.company || "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">
                          Assigned:
                        </span>{" "}
                        {lead.assignedTo ? lead.assignedTo.name : "Unassigned"}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                      <Link
                        to={`/leads/${lead._id}`}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() =>
                          setStatusModalData({ isOpen: true, lead })
                        }
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl"
                      >
                        Status
                      </button>
                      <button
                        onClick={() => setNoteModalData({ isOpen: true, lead })}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl"
                      >
                        Note
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Pagination
            pagination={pagination}
            onPageChange={(p) =>
              setPagination((prev) => ({ ...prev, page: p }))
            }
          />
        </div>
      </div>

      <CreateLeadModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchLeads}
      />
      <CreateAdminModal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
        onCreated={fetchTeamMembers}
      />
      <AssignModal
        isOpen={assignModalData.isOpen}
        lead={assignModalData.lead}
        onClose={() => setAssignModalData({ isOpen: false, lead: null })}
        onAssigned={fetchLeads}
      />
      <StatusUpdateModal
        isOpen={statusModalData.isOpen}
        lead={statusModalData.lead}
        onClose={() => setStatusModalData({ isOpen: false, lead: null })}
        onUpdated={fetchLeads}
      />
      <AddNoteModal
        isOpen={noteModalData.isOpen}
        lead={noteModalData.lead}
        onClose={() => setNoteModalData({ isOpen: false, lead: null })}
        onNoteAdded={fetchLeads}
      />
      <ConfirmDeleteModal
        isOpen={deleteModalData.isOpen}
        lead={deleteModalData.lead}
        onClose={() => setDeleteModalData({ isOpen: false, lead: null })}
        onDeleted={fetchLeads}
      />
    </motion.div>
  );
};

// ============================================================================
// 10. LEAD DETAILS PAGE
// ============================================================================

const LeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteText, setNoteText] = useState("");

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      const [leadRes, actRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/leads/${id}/activity`),
      ]);
      setLead(leadRes.data.data.lead);
      setNotes(leadRes.data.data.notes || []);
      setActivities(actRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch lead");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/leads/${id}`, { status });
      fetchLeadData();
    } catch (err) {}
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await api.post(`/leads/${id}/notes`, { note: noteText });
      setNoteText("");
      fetchLeadData();
    } catch (err) {}
  };

  if (loading) return <SkeletonPage />;
  if (!lead)
    return (
      <div className="p-8 text-center text-gray-700">Lead file not found.</div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-4rem)] bg-gray-50 text-gray-900 p-4 sm:p-6 lg:p-8 space-y-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Leads
          </Link>

          {isAdmin && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAssignOpen(true)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl shadow-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" /> Assign Lead
              </button>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 font-semibold text-sm rounded-xl hover:bg-rose-100 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Lead Main Info Banner */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900">
                  {lead.name}
                </h1>
                <StatusBadge status={lead.status} />
              </div>
              <p className="text-xs text-gray-500">
                Created on {new Date(lead.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-2.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-2">
                Status:
              </span>
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-white border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl px-3 py-1.5 outline-none"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-semibold uppercase">
                  Email
                </span>
                <a
                  href={`mailto:${lead.email}`}
                  className="text-sm font-semibold text-gray-900 hover:text-emerald-600"
                >
                  {lead.email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-semibold uppercase">
                  Phone
                </span>
                <a
                  href={`tel:${lead.phone}`}
                  className="text-sm font-semibold text-gray-900 hover:text-emerald-600"
                >
                  {lead.phone}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-semibold uppercase">
                  Company
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {lead.company || "N/A"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-semibold uppercase">
                  Assigned To
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {lead.assignedTo?.name || "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          {lead.message && (
            <div className="pt-4 border-t border-gray-100">
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Lead Message / Inquiry
              </span>
              <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl p-4 leading-relaxed">
                {lead.message}
              </p>
            </div>
          )}
        </div>

        {/* Two-Column: Notes & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" /> Internal
              Notes ({notes.length})
            </h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                required
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add meeting outcome or call update..."
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-gray-900 text-sm focus:border-emerald-500 outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm"
                >
                  Post Note
                </button>
              </div>
            </form>
            <div className="space-y-3">
              {notes.map((n) => (
                <div
                  key={n._id}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1"
                >
                  <div className="flex justify-between text-xs text-gray-500 font-semibold">
                    <span className="text-emerald-700">{n.user?.name}</span>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-800">{n.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" /> Activity Audit
              History
            </h3>
            <div className="space-y-4">
              {activities.map((act) => (
                <div
                  key={act._id}
                  className="text-xs border-b border-gray-100 pb-3 space-y-1"
                >
                  <div className="font-bold text-gray-900">{act.action}</div>
                  <div className="text-gray-500">
                    By{" "}
                    <span className="font-semibold text-gray-700">
                      {act.user?.name || "System"}
                    </span>{" "}
                    at {new Date(act.createdAt).toLocaleTimeString()}
                  </div>
                  {act.metadata && (
                    <div className="text-[11px] font-mono bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-600">
                      {JSON.stringify(act.metadata)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AssignModal
        isOpen={isAssignOpen}
        lead={lead}
        onClose={() => setIsAssignOpen(false)}
        onAssigned={fetchLeadData}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        lead={lead}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={() => navigate("/dashboard")}
      />
    </motion.div>
  );
};

// ============================================================================
// 11. MAIN DEMO COMPONENT & ROUTING
// ============================================================================

export default function Demo() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gray-50 flex flex-col font-sans antialiased text-gray-900 selection:bg-emerald-500 selection:text-white">
          <Navbar />
          <main className="flex-1 flex flex-col justify-center min-h-0 overflow-y-auto lg:overflow-hidden">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLeadPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/leads/:id" element={<LeadDetailsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
