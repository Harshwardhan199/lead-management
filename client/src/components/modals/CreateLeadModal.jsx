import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const CreateLeadModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    status: 'New',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.post('/leads', formData);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        status: 'New',
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

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
          className="bg-[#FAF8F0]/95 backdrop-blur-xl border border-[#C5C2B4]/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#C5C2B4]/60">
            <h3 className="text-lg font-black text-[#161D18] tracking-tight">Create New Lead</h3>
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-[#161D18] p-1.5 rounded-full hover:bg-[#EAE7DC]/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-[#F0EEE4] border border-[#C5C2B4] rounded-2xl px-4 py-2.5 text-[#161D18] text-sm focus:border-[#2A4B3A] focus:ring-4 focus:ring-[#2A4B3A]/15 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-[#F0EEE4] border border-[#C5C2B4] rounded-2xl px-4 py-2.5 text-[#161D18] text-sm focus:border-[#2A4B3A] focus:ring-4 focus:ring-[#2A4B3A]/15 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-[#F0EEE4] border border-[#C5C2B4] rounded-2xl px-4 py-2.5 text-[#161D18] text-sm focus:border-[#2A4B3A] focus:ring-4 focus:ring-[#2A4B3A]/15 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Acme Technologies Inc."
                className="w-full bg-[#F0EEE4] border border-[#C5C2B4] rounded-2xl px-4 py-2.5 text-[#161D18] text-sm focus:border-[#2A4B3A] focus:ring-4 focus:ring-[#2A4B3A]/15 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                Initial Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-[#F0EEE4] border border-[#C5C2B4] rounded-2xl px-4 py-2.5 text-[#161D18] text-sm focus:border-[#2A4B3A] focus:ring-4 focus:ring-[#2A4B3A]/15 outline-none"
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
              <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                Message / Details
              </label>
              <textarea
                name="message"
                rows={2}
                value={formData.message}
                onChange={handleChange}
                placeholder="Lead inquiry details..."
                className="w-full bg-[#F0EEE4] border border-[#C5C2B4] rounded-2xl p-3 text-[#161D18] text-sm focus:border-[#2A4B3A] focus:ring-4 focus:ring-[#2A4B3A]/15 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C5C2B4]/60">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-[#575D58] hover:bg-[#EAE7DC]/60 rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2A4B3A] hover:bg-[#1E372B] text-white font-bold text-xs rounded-full shadow-md shadow-[#2A4B3A]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Create Lead</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateLeadModal;
