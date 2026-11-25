import React from 'react';

const statusConfig = {
  // Transaction / Listing Statuses
  AVAILABLE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Available' },
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
  BORROWED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Borrowed' },
  SOLD: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', label: 'Sold' },
  DONATED: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', label: 'Donated' },
  EXCHANGED: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Exchanged' },
  UNAVAILABLE: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Unavailable' },
  
  // Transaction Request Statuses
  ACCEPTED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Accepted' },
  REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Declined' },
  CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Cancelled' },
  COMPLETED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Completed' },
  
  // Borrowing Statuses
  ACTIVE: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Active Borrowing' },
  RETURNED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Returned' },
  OVERDUE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', label: 'Overdue!' },

  // Listing Types
  SALE: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', label: 'For Sale' },
  LEND: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', label: 'For Lending' },
  DONATION: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', label: 'Donation' },
  EXCHANGE: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', label: 'Exchange' },

  // Conditions
  NEW: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Brand New' },
  GOOD: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Good' },
  FAIR: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Fair' },
  USED: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Heavily Used' },
};

export default function StatusBadge({ status, customLabel, size = 'md' }) {
  const config = statusConfig[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    label: status,
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {customLabel || config.label}
    </span>
  );
}

