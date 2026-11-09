/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  Check 
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { FundType } from '../../types';

export const DualAuthModal: React.FC = () => {
  const { 
    activeChama, 
    currentOfficialRole, 
    initiateWithdrawal, 
    approveWithdrawal 
  } = useChama();

  const [showInitiateForm, setShowInitiateForm] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(10000);
  const [fundType, setFundType] = useState<FundType>('welfare');
  const [purpose, setPurpose] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('+2547');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const pendingWithdrawals = activeChama.pendingWithdrawals || [];
  const isChairperson = currentOfficialRole === 'chairperson';
  const isTreasurer = currentOfficialRole === 'treasurer';

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose || !recipientName) {
      alert('Please fill out all required fields');
      return;
    }

    initiateWithdrawal({
      amount: Number(amount),
      fundType,
      purpose,
      recipientName,
      recipientPhone,
    });

    setShowInitiateForm(false);
    setPurpose('');
    setRecipientName('');
    setSuccessMsg('Withdrawal initiated! Waiting for Chairperson dual-authorization.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleApprove = (id: string, approved: boolean) => {
    approveWithdrawal(id, approved);
    setSuccessMsg(approved ? 'Withdrawal approved & disbursed to ledger!' : 'Withdrawal rejected.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 sm:p-6 overflow-hidden w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rose-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-amber-100 text-rose-800 flex items-center justify-center border border-amber-200/50 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-rose-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg">Dual-Authorization Protocol</h3>
              <span className="text-[10px] font-bold text-rose-900 bg-gradient-to-r from-rose-100 to-amber-100 border border-amber-300/80 px-2 py-0.5 rounded-full uppercase">
                Anti-Embezzlement
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Strict governance rule: Treasurer initiates, Chairperson or Secretary approves before release
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowInitiateForm(!showInitiateForm)}
          className="py-2 px-3 bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Initiate Withdrawal Request</span>
        </button>
      </div>

      {successMsg && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Initiate Withdrawal Form */}
      {showInitiateForm && (
        <form onSubmit={handleInitiate} className="mt-5 p-5 bg-gradient-to-b from-[#fffbf9] to-[#fff7f9] border border-rose-100 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600" />
              New Outbound Withdrawal Request
            </h4>
            <span className="text-xs text-slate-500">
              Initiated by: <span className="font-bold text-slate-700 capitalize">{currentOfficialRole}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Source Fund</label>
              <select
                value={fundType}
                onChange={(e) => setFundType(e.target.value as FundType)}
                className="w-full text-xs font-medium bg-white border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {activeChama.funds.map((f) => (
                  <option key={f.id} value={f.type}>
                    {f.name} (Balance: KSh {f.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Amount to Withdraw (KSh)</label>
              <input
                type="number"
                min="100"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full text-xs font-bold font-mono-num bg-white border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Recipient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Grace Wanjiku (Hospital Cashier)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full text-xs bg-white border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Recipient M-Pesa / Phone</label>
              <input
                type="text"
                required
                placeholder="+2547XXXXXXXX"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full text-xs font-mono-num bg-white border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Detailed Governance Reason / Purpose</label>
            <textarea
              rows={2}
              required
              placeholder="State the AGM minute or committee approval resolution authorizing this expenditure..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full text-xs bg-white border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowInitiateForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Submit for Dual Sign-off
            </button>
          </div>
        </form>
      )}

      {/* Pending Withdrawals List */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center justify-between">
          <span>Active Dual-Authorization Requests ({pendingWithdrawals.filter(w => w.status === 'pending').length})</span>
          {!isChairperson && (
            <span className="text-[11px] font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              Switch role to Chairperson to approve/reject
            </span>
          )}
        </h4>

        {pendingWithdrawals.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
            No withdrawal requests currently pending.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingWithdrawals.map((pwd) => {
              const isPending = pwd.status === 'pending';
              const fundObj = activeChama.funds.find(f => f.type === pwd.fundType);

              return (
                <div
                  key={pwd.id}
                  className={`p-4 rounded-2xl border transition ${
                    isPending
                      ? 'bg-amber-50/50 border-amber-200'
                      : pwd.status === 'approved'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 font-mono-num text-base">
                          KSh {pwd.amount.toLocaleString()}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-white border border-slate-200 text-slate-700">
                          {fundObj?.name || pwd.fundType}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isPending
                              ? 'bg-amber-100 text-amber-800'
                              : pwd.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {pwd.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{pwd.purpose}</p>
                      <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Recipient: <strong className="text-slate-700">{pwd.recipientName} ({pwd.recipientPhone})</strong></span>
                        <span>Initiator: <strong className="text-slate-700">{pwd.initiatedBy}</strong> ({pwd.initiatedAt})</span>
                        {pwd.approvedBy && <span>Signed: <strong className="text-slate-700">{pwd.approvedBy}</strong></span>}
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApprove(pwd.id, false)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(pwd.id, true)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Release</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
