/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  CreditCard, 
  Receipt 
} from 'lucide-react';
import { Chama } from '../../types';
import { useChama } from '../../context/ChamaContext';

interface SuperAdminRecordPaymentModalProps {
  chama: Chama | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const SuperAdminRecordPaymentModal: React.FC<SuperAdminRecordPaymentModalProps> = ({
  chama,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { recordSubscriptionPayment } = useChama();

  if (!isOpen || !chama) return null;

  const [amount, setAmount] = useState<number>(chama.debtPending || chama.monthlySubscriptionKsh || 1500);
  const [mpesaReceipt, setMpesaReceipt] = useState<string>('');
  const [selectedBillId, setSelectedBillId] = useState<string>(
    (chama.subscriptionBills || []).find(b => b.status === 'unpaid')?.id || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }
    if (!mpesaReceipt.trim()) {
      alert('Please enter M-Pesa or Cash payment reference.');
      return;
    }

    const res = recordSubscriptionPayment(
      chama.id,
      selectedBillId || undefined,
      Number(amount),
      mpesaReceipt.trim()
    );

    if (res.success) {
      onSuccess(res.message);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-emerald-400 max-h-[90vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 flex items-center justify-between border-b border-emerald-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Receipt className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-base">Record Subscription Cash Received</h3>
              <p className="text-[11px] text-emerald-200">Reconcile tenant debt & log payment</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-emerald-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Chama Workspace:</span>
              <strong className="text-slate-900">{chama.name}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Current Debt Pending:</span>
              <strong className="text-rose-700 font-mono font-bold">
                KSh {(chama.debtPending || 0).toLocaleString()}
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Cash Received to Date:</span>
              <strong className="text-emerald-800 font-mono font-bold">
                KSh {(chama.cashReceived || 0).toLocaleString()}
              </strong>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Payment Amount (KSh) *
            </label>
            <input
              type="number"
              min="50"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              M-Pesa Transaction Ref / Receipt *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. RK981274KL or CASH-REC-01"
              value={mpesaReceipt}
              onChange={(e) => setMpesaReceipt(e.target.value.toUpperCase())}
              className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {(chama.subscriptionBills || []).length > 0 && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Link to Pushed Bill (Optional)
              </label>
              <select
                value={selectedBillId}
                onChange={(e) => setSelectedBillId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Auto-reconcile oldest unpaid bill</option>
                {(chama.subscriptionBills || []).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.billNumber} — KSh {b.amount.toLocaleString()} ({b.billingPeriod}) [{b.status.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-100" />
              <span>Confirm & Credit Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
