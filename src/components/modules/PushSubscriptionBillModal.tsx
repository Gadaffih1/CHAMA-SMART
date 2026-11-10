/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Send, 
  DollarSign, 
  Building2, 
  UserCheck, 
  Phone, 
  Calendar, 
  CreditCard, 
  BellRing, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { Chama } from '../../types';
import { useChama } from '../../context/ChamaContext';

interface PushSubscriptionBillModalProps {
  chama: Chama | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const PushSubscriptionBillModal: React.FC<PushSubscriptionBillModalProps> = ({
  chama,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { systemTillNumber: defaultSystemTill, pushSubscriptionBill } = useChama();

  if (!isOpen || !chama) return null;

  const chairPerson = chama.members.find(m => m.role === 'chairperson') || chama.members[0];

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const defaultDueDate = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [amount, setAmount] = useState<number>(chama.monthlySubscriptionKsh || 1500);
  const [billingPeriod, setBillingPeriod] = useState<string>(currentMonthName);
  const [dueDate, setDueDate] = useState<string>(defaultDueDate);
  const [targetSystemTill, setTargetSystemTill] = useState<string>(chama.systemTillNumber || defaultSystemTill);
  const [reminderNote, setReminderNote] = useState<string>(
    `Kindly settle your monthly platform subscription fee of KSh ${(chama.monthlySubscriptionKsh || 1500).toLocaleString()} for ${currentMonthName} via System Till ${chama.systemTillNumber || defaultSystemTill} by ${defaultDueDate}.`
  );

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    setReminderNote(
      `Kindly settle your monthly platform subscription fee of KSh ${newAmount.toLocaleString()} for ${billingPeriod} via System Till ${targetSystemTill} by ${dueDate}.`
    );
  };

  const handlePeriodChange = (newPeriod: string) => {
    setBillingPeriod(newPeriod);
    setReminderNote(
      `Kindly settle your monthly platform subscription fee of KSh ${amount.toLocaleString()} for ${newPeriod} via System Till ${targetSystemTill} by ${dueDate}.`
    );
  };

  const handleTillChange = (newTill: string) => {
    setTargetSystemTill(newTill);
    setReminderNote(
      `Kindly settle your monthly platform subscription fee of KSh ${amount.toLocaleString()} for ${billingPeriod} via System Till ${newTill} by ${dueDate}.`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Bill amount must be greater than zero.');
      return;
    }

    const res = pushSubscriptionBill(chama.id, {
      amount: Number(amount),
      billingPeriod: billingPeriod.trim(),
      dueDate: dueDate.trim(),
      systemTillNumber: targetSystemTill.trim(),
      reminderNote: reminderNote.trim(),
    });

    if (res.success) {
      onSuccess(res.message);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-amber-400 max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#170614] via-[#240c21] to-[#2b1208] text-white p-5 flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-600 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <DollarSign className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">Push Subscription Bill</h3>
              <p className="text-[11px] text-rose-200/80">Transmit formal platform invoice to tenant Chairman</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-rose-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Tenant & Chairman Profile Strip */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-700" />
                <strong className="text-slate-900 text-xs">{chama.name}</strong>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-950">
                Tier: {chama.planTier}
              </span>
            </div>

            <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Recipient: <strong className="text-slate-800">{chairPerson?.name || 'Chama Chairperson'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{chairPerson?.phoneNumber || 'No phone set'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-500">Current Pending Debt:</span>
              <strong className="text-rose-700 font-mono font-bold">
                KSh {(chama.debtPending || 0).toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Bill Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Bill Amount (KSh) *
              </label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={amount}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-950"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Billing Cycle / Period *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. November 2026"
                value={billingPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Payment Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-950"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                System Till Account Number *
              </label>
              <input
                type="text"
                required
                value={targetSystemTill}
                onChange={(e) => handleTillChange(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-white border border-amber-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
              <BellRing className="w-3.5 h-3.5 text-amber-600" />
              <span>Reminder Note to Tenant Chairman *</span>
            </label>
            <textarea
              rows={3}
              required
              value={reminderNote}
              onChange={(e) => setReminderNote(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 leading-relaxed"
            />
            <span className="text-[10px] text-slate-500">
              This note will immediately appear on the Chairman's dashboard and Officials portal notification feed.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md border border-amber-300 flex items-center gap-2 transition cursor-pointer"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>Push Bill to Chairman</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
