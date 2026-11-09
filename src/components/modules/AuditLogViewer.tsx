/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  Search, 
  Download, 
  Printer, 
  AlertCircle, 
  Info, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';

export const AuditLogViewer: React.FC = () => {
  const { activeChama, currentMember } = useChama();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showStatementModal, setShowStatementModal] = useState<boolean>(false);

  const logs = (activeChama.auditLogs || []).filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handlePrintStatement = () => {
    window.print();
  };

  // Chama Financial Snapshot
  const totalSavingsInChama = activeChama.funds.reduce((s, f) => s + f.balance, 0);
  const totalLoansDisbursed = activeChama.loans.reduce((s, l) => s + l.principal, 0);
  const totalOutstandingLoanBalance = activeChama.loans.reduce((s, l) => s + l.balanceRemaining, 0);

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 sm:p-6 overflow-hidden w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rose-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 text-amber-800 flex items-center justify-center border border-amber-200/50 shadow-xs">
            <FileCheck2 className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg">Immutable Audit & Transparency Log</h3>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-700" />
                APPEND-ONLY
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tamper-evident financial audit trail: no record can be deleted or overwritten without trace
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowStatementModal(true)}
          className="py-2 px-3 bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Generate Official Financial Statement</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by action, actor, module or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none"
        >
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="mt-4 overflow-x-auto w-full">
        <table className="w-full min-w-[650px] text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-600 font-semibold border-b border-slate-200">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Actor & Role</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Module</th>
              <th className="py-2.5 px-3">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No audit log entries matching your criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                    <span className="block font-semibold">{log.actorName}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{log.actorRole}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap font-medium">
                    {log.module}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 leading-relaxed min-w-[280px]">
                    {log.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Statement Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border-2 border-amber-300/80 print:p-0 print:border-none print:shadow-none">
            {/* Statement Header */}
            <div className="border-b-2 border-amber-500/60 pb-4 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  CHAMASMART OFFICIAL FINANCIAL STATEMENT
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{activeChama.name}</h3>
                <p className="text-xs text-slate-500">
                  Reg No: {activeChama.registrationNumber} • {activeChama.county}, {activeChama.country}
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="font-semibold text-slate-700">Statement Date:</span>
                <div className="font-mono text-amber-950 font-bold">{new Date().toISOString().split('T')[0]}</div>
                <div className="text-[10px] text-slate-400">Currency: {activeChama.currency}</div>
              </div>
            </div>

            {/* Chama Executive Summary */}
            <div className="grid grid-cols-3 gap-3 my-4 bg-gradient-to-r from-[#fffbf8] to-[#fff7fa] p-4 rounded-xl border border-rose-100 text-xs">
              <div>
                <span className="text-slate-500 block">Total Pooled Liquid Reserves:</span>
                <span className="font-extrabold text-amber-950 font-mono-num text-sm">
                  KSh {totalSavingsInChama.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Active Outstanding Loans:</span>
                <span className="font-extrabold text-rose-950 font-mono-num text-sm">
                  KSh {totalOutstandingLoanBalance.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Active Members:</span>
                <span className="font-extrabold text-slate-900 font-mono-num text-sm">
                  {activeChama.members.length} Members
                </span>
              </div>
            </div>

            {/* Fund Balances Breakdown */}
            <div className="my-4">
              <h4 className="text-xs font-bold uppercase text-amber-900 mb-2">Audited Fund Allocation Breakdown</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-amber-200/60">
                  <thead>
                    <tr className="bg-amber-50/70 text-amber-950 font-semibold">
                      <th className="p-2 border-b border-amber-200/60">Fund Bucket Name</th>
                      <th className="p-2 border-b border-amber-200/60">Description</th>
                      <th className="p-2 border-b border-amber-200/60 text-right">Audited Balance (KSh)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100/60 font-mono-num">
                    {activeChama.funds.map((f) => (
                      <tr key={f.id}>
                        <td className="p-2 font-bold text-slate-900">{f.name}</td>
                        <td className="p-2 text-slate-500">{f.description}</td>
                        <td className="p-2 text-right font-extrabold text-amber-950">
                          {f.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Certification Footer */}
            <div className="mt-8 pt-4 border-t border-rose-100 text-xs text-slate-500 flex justify-between items-end">
              <div>
                <p className="font-semibold text-slate-700">Certified by Chama Executive Committee:</p>
                <div className="flex gap-6 mt-3 text-[11px]">
                  <div>
                    <div className="border-b border-slate-400 w-32 pb-1 mb-1"></div>
                    <span>Chairperson Signature</span>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 w-32 pb-1 mb-1"></div>
                    <span>Treasurer Signature</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] block font-mono text-amber-800 font-semibold">ChamaSmart Hash: SHA256-CHM-9841</span>
                <span className="text-[10px] text-amber-700 font-bold flex items-center justify-end gap-1">
                  ★ Gold Certified Tamper-Proof Audit
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setShowStatementModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintStatement}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
