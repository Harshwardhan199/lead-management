import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  const { page, totalPages, total, limit } = pagination;

  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#C5C2B4]/60 text-xs text-[#575D58]">
      <div className="font-medium">
        Showing <span className="font-black text-[#161D18]">{start}</span> to{' '}
        <span className="font-black text-[#161D18]">{end}</span> of{' '}
        <span className="font-black text-[#161D18]">{total}</span> leads
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-full bg-[#FAF8F0] border border-[#C5C2B4] text-[#161D18] hover:bg-[#EAE7DC] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-4 py-1.5 font-bold text-[#161D18] bg-[#FAF8F0] rounded-full border border-[#C5C2B4] shadow-xs">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-full bg-[#FAF8F0] border border-[#C5C2B4] text-[#161D18] hover:bg-[#EAE7DC] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
