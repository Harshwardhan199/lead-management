import React from 'react';

const STATUS_STYLES = {
  New: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Contacted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Qualified: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Proposal Sent': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Lost: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || 'bg-slate-800 text-slate-400 border-slate-700';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
