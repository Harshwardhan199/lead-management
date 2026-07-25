import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Search, ChevronDown, Check, Loader2, ShieldCheck, User } from 'lucide-react';
import api from '../../api/axios';

// ─── Inline role mini-select ──────────────────────────────────────────────────
const RoleSelect = ({ userId, currentRole, onRoleChanged }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(currentRole);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (newRole) => {
    if (newRole === value) { setIsOpen(false); return; }
    try {
      setLoading(true);
      await api.patch(`/auth/users/${userId}/role`, { role: newRole });
      setValue(newRole);
      if (onRoleChanged) onRoleChanged(userId, newRole);
    } catch (err) {
      // silent – could add toast
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const isAdmin = value === 'admin';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border transition-all ${
          isAdmin
            ? 'bg-[#2A4B3A] text-white border-[#2A4B3A]'
            : 'bg-[#FAF8F0] text-[#161D18] border-[#C5C2B4] hover:bg-[#EAE7DC]'
        }`}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <>
            <span className="capitalize">{value}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 w-32 bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl shadow-xl z-50 p-1.5"
          >
            {['member', 'admin'].map((role) => (
              <div
                key={role}
                onClick={() => handleSelect(role)}
                className={`flex items-center justify-between px-3 py-1.5 text-[11px] font-bold rounded-xl cursor-pointer transition-colors capitalize ${
                  value === role
                    ? 'bg-[#2A4B3A] text-white'
                    : 'text-[#161D18] hover:bg-[#EAE7DC]'
                }`}
              >
                <span>{role}</span>
                {value === role && <Check className="w-3 h-3" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
const ManageRolesModal = ({ isOpen, onClose, onUpdated }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users');
      setUsers(res.data.data || []);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChanged = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
    );
    if (onUpdated) onUpdated();
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-[#FAF8F0]/95 backdrop-blur-xl border border-[#C5C2B4]/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#C5C2B4]/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2A4B3A]" />
              <h3 className="text-lg font-black text-[#161D18] tracking-tight">Manage Team Roles</h3>
            </div>
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-[#161D18] p-1.5 rounded-full hover:bg-[#EAE7DC]/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full bg-[#F0EEE4] border border-[#C5C2B4] rounded-2xl pl-9 pr-4 py-2 text-[#161D18] text-xs focus:border-[#2A4B3A] outline-none"
            />
          </div>

          {/* User list */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {loading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#2A4B3A]" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-xs text-[#575D58] py-6 font-medium">No users found.</p>
            ) : (
              filtered.map((u) => {
                const isAdminUser = u.role === 'admin';
                const initials = u.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={u._id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#F0EEE4] rounded-2xl border border-[#C5C2B4]/60"
                  >
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                          isAdminUser
                            ? 'bg-[#2A4B3A] text-white'
                            : 'bg-[#C5C2B4]/60 text-[#161D18]'
                        }`}
                      >
                        {isAdminUser ? (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-[#161D18] truncate">{u.name}</div>
                        <div className="text-[10px] text-[#575D58] truncate font-medium">{u.email}</div>
                      </div>
                    </div>

                    {/* Role dropdown */}
                    <RoleSelect
                      userId={u._id}
                      currentRole={u.role}
                      onRoleChanged={handleRoleChanged}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-2 border-t border-[#C5C2B4]/60">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#2A4B3A] hover:bg-[#1E372B] rounded-full shadow-md shadow-[#2A4B3A]/20 transition-all hover:scale-105 active:scale-95"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ManageRolesModal;
