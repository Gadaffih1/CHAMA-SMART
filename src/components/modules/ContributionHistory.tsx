/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Download, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt, 
  Coins, 
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { Contribution } from '../../types';

interface ContributionHistoryProps {
  contributions: Contribution[];
  memberId: string;
  memberName: string;
  membershipNumber: string;
}

export const ContributionHistory: React.FC<ContributionHistoryProps> = ({
  contributions,
  memberId,
  memberName,
  membershipNumber,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [sortAscending, setSortAscending] = useState(false);

  // Filter contributions specific to this member
  const memberContributions = contributions.filter(c => c.memberId === memberId);

  // Apply search and filter
  const filteredList = memberContributions
    .filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.cycleName.toLowerCase().includes(q) ||
        (item.mpesaReceipt && item.mpesaReceipt.toLowerCase().includes(q)) ||
        (item.paidDate && item.paidDate.toLowerCase().includes(q)) ||
        (item.dueDate && item.dueDate.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.paidDate || a.dueDate).getTime();
      const dateB = new Date(b.paidDate || b.dueDate).getTime();
      return sortAscending ? dateA - dateB : dateB - dateA;
    });

  // Calculate stats
  const totalPaid = memberContributions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.paidAmount, 0);

  const pendingAmount = memberContributions
    .filter(c => c.status === 'pending' || c.status === 'overdue')
    .reduce((sum, c) => sum + (c.targetAmount - c.paidAmount), 0);

  // Export to CSV Functionality
  const handleExportCSV = () => {
    if (filteredList.length === 0) return;

    const headers = [
      'Record ID',
      'Cycle / Purpose',
      'Due Date',
      'Paid Date',
      'Target Amount (KSh)',
      'Paid Amount (KSh)',
      'Penalty (KSh)',
      'Reference / M-Pesa Receipt',
      'Status'
    ];

    const rows = filteredList.map(item => [
      `"${item.id}"`,
      `"${item.cycleName}"`,
      `"${item.dueDate}"`,
      `"${item.paidDate || 'N/A'}"`,
      item.targetAmount,
      item.paidAmount,
      item.penaltyAmount,
      `"${item.mpesaReceipt || 'Pending'}"`,
      `"${item.status.toUpperCase()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `chamasmart_contributions_${membershipNumber}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-200/90 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-emerald-950 text-base sm:text-lg">
              Contribution History & Payment Receipts
            </h3>
          </div>
          <p className="text-xs text-emerald-800/70">
            Immutable log of weekly and monthly chama savings, table-banking equity, and fund allocations
          </p>
        </div>

        {/* Quick Summary Pill & Export Button */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 shrink-0">
            <span>Total Paid: </span>
            <strong className="text-emerald-700 font-mono-num font-bold">KSh {totalPaid.toLocaleString()}</strong>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredList.length === 0}
            className="py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap disabled:opacity-50"
            title="Download CSV spreadsheet of payments"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by receipt (e.g. QX98), cycle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-emerald-950 placeholder-emerald-800/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Status Filter Tabs & Sort Toggle */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {(['all', 'paid', 'pending', 'overdue'] as const).map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer shrink-0 ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/70'
              }`}
            >
              {status}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setSortAscending(!sortAscending)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/70 flex items-center gap-1 shrink-0 cursor-pointer"
            title="Sort by date"
          >
            <ArrowUpDown className="w-3 h-3 text-emerald-700" />
            <span>{sortAscending ? 'Oldest' : 'Newest'}</span>
          </button>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll for Zero Overlap */}
      <div className="border border-emerald-200/80 rounded-xl overflow-hidden shadow-2xs bg-white">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[660px] text-xs text-left">
            <thead>
              <tr className="bg-emerald-50/80 text-emerald-950 font-bold border-b border-emerald-200/80">
                <th className="py-2.5 px-4 whitespace-nowrap">Payment Date</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Cycle / Purpose</th>
                <th className="py-2.5 px-4 whitespace-nowrap text-right">Amount (KSh)</th>
                <th className="py-2.5 px-4 whitespace-nowrap">M-Pesa Reference</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Fund Segregation</th>
                <th className="py-2.5 px-4 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/80 font-medium">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-emerald-800/60">
                    No contribution records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isPaid = item.status === 'paid';
                  const isPending = item.status === 'pending';
                  const isOverdue = item.status === 'overdue';

                  return (
                    <tr key={item.id} className="hover:bg-emerald-50/30 transition">
                      <td className="py-3 px-4 font-mono-num whitespace-nowrap text-emerald-950">
                        {item.paidDate || item.dueDate}
                      </td>

                      <td className="py-3 px-4 text-emerald-950 font-semibold whitespace-nowrap">
                        {item.cycleName}
                      </td>

                      <td className="py-3 px-4 text-right font-mono-num font-bold text-emerald-900 whitespace-nowrap">
                        KSh {(item.paidAmount || item.targetAmount).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.mpesaReceipt ? (
                          <span className="font-mono text-emerald-800 font-bold bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                            {item.mpesaReceipt}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Pending STK
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-emerald-800/80">
                        {item.fundAllocations && item.fundAllocations.length > 0 ? (
                          <span className="truncate block max-w-[200px]" title={item.fundAllocations.map(f => `${f.fundType.replace('_', ' ')}: KSh ${f.amount}`).join(', ')}>
                            {item.fundAllocations.map(f => `${f.fundType.replace('_', ' ')}: ${f.amount}`).join(' • ')}
                          </span>
                        ) : (
                          <span>General Savings</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Paid</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Pending</span>
                          </span>
                        )}
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Overdue</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
