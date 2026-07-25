import React from 'react';

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

export default StatusBadge;
