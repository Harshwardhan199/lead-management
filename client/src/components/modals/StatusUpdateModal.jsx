import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import CustomSelect from '../CustomSelect';

const StatusUpdateModal = ({ lead, isOpen, onClose, onUpdated }) => {
  const [status, setStatus] = useState('New');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lead) setStatus(lead.status || 'New');
  }, [lead]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.patch(`/leads/${lead._id}`, { status });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const statusOptions = [
    { label: 'New', value: 'New' },
    { label: 'Contacted', value: 'Contacted' },
    { label: 'Qualified', value: 'Qualified' },
    { label: 'Proposal Sent', value: 'Proposal Sent' },
    { label: 'Won', value: 'Won' },
    { label: 'Lost', value: 'Lost' },
  ];

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
          <div className="flex items-center justify-between pb-4 border-b border-[#C5C2B4]/60">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#2A4B3A]" />
              <h3 className="text-lg font-black text-[#161D18] tracking-tight">Update Lead Status</h3>
            </div>
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
              <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-2">
                Select New Status
              </label>
              <CustomSelect
                value={status}
                onChange={(val) => setStatus(val)}
                options={statusOptions}
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
                <span>Update Status</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StatusUpdateModal;
