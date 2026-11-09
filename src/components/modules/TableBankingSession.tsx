/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Coins, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle, 
  Users, 
  Building, 
  DollarSign, 
  Sparkles, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';

export const TableBankingSession: React.FC = () => {
  const { activeChama, currentMember } = useChama();

  // Simulated live session state
  const [sessionCashInBox, setSessionCashInBox] = useState<number>(38500);
  const [totalCollectedToday, setTotalCollectedToday] = useState<number>(55000);
  const [totalLentToday, setTotalLentToday] = useState<number>(16500);
  const [instantBorrower, setInstantBorrower] = useState<string>(activeChama.members[4]?.id || '');
  const [instantAmount, setInstantAmount] = useState<number>(5000);
  const [instantWeeks, setInstantWeeks] = useState<number>(4);
  const [instantPurpose, setInstantPurpose] = useState<string>('Market farm produce purchase');
  const [sessionSuccessMsg, setSessionSuccessMsg] = useState<string>('');

  const handleDisburseOnTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (instantAmount > sessionCashInBox) {
      alert('Insufficient physical cash in the table box!');
      return;
    }

    const borrowerMem = activeChama.members.find(m => m.id === instantBorrower);
    const bName = borrowerMem?.name || 'Member';

    setSessionCashInBox(prev => prev - instantAmount);
    setTotalLentToday(prev => prev + instantAmount);
    setSessionSuccessMsg(`Disbursed KSh ${instantAmount.toLocaleString()} to ${bName} on the table! Signed promissory receipt.`);
    setTimeout(() => setSessionSuccessMsg(''), 4000);
  };

  const handleDepositToBox = (amount: number) => {
    setSessionCashInBox(prev => prev + amount);
    setTotalCollectedToday(prev => prev + amount);
    setSessionSuccessMsg(`Added KSh ${amount.toLocaleString()} into the table box.`);
    setTimeout(() => setSessionSuccessMsg(''), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100/90 shadow-sm p-4 sm:p-6 overflow-hidden w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rose-100 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 text-amber-800 flex items-center justify-center border border-amber-200/60 shadow-xs">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg">Table Banking Live Session</h3>
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                ACTIVE MEETING
              </span>
            </div>
            <p className="text-xs text-slate-500">
              "Pesa Mezani" model: collect weekly savings and immediately lend cash to members in the room
            </p>
          </div>
        </div>
      </div>

      {sessionSuccessMsg && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{sessionSuccessMsg}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-br from-amber-50 via-rose-50/40 to-amber-100/30 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-600" />
            Cash in the Box (Available)
          </span>
          <div className="text-2xl font-black text-amber-950 font-mono-num mt-1">
            KSh {sessionCashInBox.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-800">Ready for instant borrowing</span>
        </div>

        <div className="bg-gradient-to-br from-rose-50/60 via-amber-50/30 to-rose-100/40 border border-rose-200/70 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-rose-900 flex items-center gap-1.5">
            <ArrowDownLeft className="w-4 h-4 text-rose-600" />
            Total Deposited on Table
          </span>
          <div className="text-2xl font-black text-rose-950 font-mono-num mt-1">
            KSh {totalCollectedToday.toLocaleString()}
          </div>
          <span className="text-[11px] text-rose-700">Savings + loan repayments</span>
        </div>

        <div className="bg-gradient-to-br from-amber-50/40 to-amber-100/20 border border-amber-200/60 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-amber-700" />
            Total Lent in Session
          </span>
          <div className="text-2xl font-black text-amber-950 font-mono-num mt-1">
            KSh {totalLentToday.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-800">Immediate revolving loans</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Disburse Instant Table Loan */}
        <div className="border border-rose-100 rounded-2xl p-5 bg-gradient-to-b from-[#fffbf9] to-[#fff7f9]">
          <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Instant In-Meeting Table Loan
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Disburse physical cash directly to a member with group verbal assent
          </p>

          <form onSubmit={handleDisburseOnTable} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Member Present</label>
              <select
                value={instantBorrower}
                onChange={(e) => setInstantBorrower(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {activeChama.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.membershipNumber}) - Savings: KSh {m.totalSavings.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Cash Amount (KSh)</label>
                <input
                  type="number"
                  step="500"
                  min="500"
                  max={sessionCashInBox}
                  value={instantAmount}
                  onChange={(e) => setInstantAmount(Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono-num bg-white border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Duration (Weeks)</label>
                <select
                  value={instantWeeks}
                  onChange={(e) => setInstantWeeks(Number(e.target.value))}
                  className="w-full text-xs font-medium bg-white border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value={2}>2 Weeks (2% int)</option>
                  <option value={4}>4 Weeks (5% int)</option>
                  <option value={8}>8 Weeks (10% int)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Loan Purpose</label>
              <input
                type="text"
                value={instantPurpose}
                onChange={(e) => setInstantPurpose(e.target.value)}
                placeholder="e.g. Stock purchase, medical..."
                className="w-full text-xs bg-white border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={sessionCashInBox < instantAmount}
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 hover:from-amber-700 hover:to-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-900/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Count & Hand Over Cash (KSh {instantAmount.toLocaleString()})</span>
            </button>
          </form>
        </div>

        {/* Quick Deposit onto Table */}
        <div className="border border-rose-100 rounded-2xl p-5 bg-gradient-to-b from-[#fffbf9] to-[#fff7f9] flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-rose-600" />
              Quick Cash Dropped on Table
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Treasurer records cash placed in the physical box by attending members
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleDepositToBox(1000)}
                className="py-2.5 px-3 bg-white hover:bg-rose-50/80 border border-rose-200/80 hover:border-rose-300 rounded-xl text-xs font-semibold text-slate-800 transition flex items-center justify-between"
              >
                <span>+ 1x Weekly Share</span>
                <span className="font-mono-num font-bold text-amber-700">KSh 1,000</span>
              </button>
              <button
                type="button"
                onClick={() => handleDepositToBox(2500)}
                className="py-2.5 px-3 bg-white hover:bg-rose-50/80 border border-rose-200/80 hover:border-rose-300 rounded-xl text-xs font-semibold text-slate-800 transition flex items-center justify-between"
              >
                <span>+ Loan Repayment</span>
                <span className="font-mono-num font-bold text-amber-700">KSh 2,500</span>
              </button>
              <button
                type="button"
                onClick={() => handleDepositToBox(200)}
                className="py-2.5 px-3 bg-white hover:bg-amber-50/80 border border-amber-200/80 hover:border-amber-300 rounded-xl text-xs font-semibold text-slate-800 transition flex items-center justify-between"
              >
                <span>+ Late Meeting Fine</span>
                <span className="font-mono-num font-bold text-rose-600">KSh 200</span>
              </button>
              <button
                type="button"
                onClick={() => handleDepositToBox(5000)}
                className="py-2.5 px-3 bg-white hover:bg-rose-50/80 border border-rose-200/80 hover:border-rose-300 rounded-xl text-xs font-semibold text-slate-800 transition flex items-center justify-between"
              >
                <span>+ Share Purchase</span>
                <span className="font-mono-num font-bold text-amber-700">KSh 5,000</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-rose-100 text-xs shadow-xs">
            <div className="flex justify-between items-center text-slate-600 mb-1">
              <span>Closing Surplus to Deposit:</span>
              <span className="font-mono-num font-bold text-amber-800">
                KSh {sessionCashInBox.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              At the end of the meeting, remaining cash is taken by Treasurer and Chairperson to deposit into the group's KCB / M-Pesa account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
