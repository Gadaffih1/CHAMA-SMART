/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Save, 
  Trash2, 
  ShieldAlert, 
  AlertTriangle, 
  CreditCard, 
  CheckCircle2, 
  BellRing, 
  DollarSign,
  Power,
  ShieldCheck
} from 'lucide-react';
import { Chama } from '../../types';
import { useChama } from '../../context/ChamaContext';

interface SuperAdminEditChamaModalProps {
  chama: Chama | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (chamaId: string, updates: Partial<Chama>) => void;
  onDelete: (chamaId: string) => void;
}

export const SuperAdminEditChamaModal: React.FC<SuperAdminEditChamaModalProps> = ({
  chama,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const { categoryOptions, subscriptionTiers, systemTillNumber: globalSystemTill } = useChama();

  if (!isOpen || !chama) return null;

  // Basic Details
  const [name, setName] = useState(chama.name);
  const [category, setCategory] = useState(chama.category);
  const [county, setCounty] = useState(chama.county);
  const [country, setCountry] = useState(chama.country || 'Kenya');
  const [tagline, setTagline] = useState(chama.tagline || '');
  const [registrationNumber, setRegistrationNumber] = useState(chama.registrationNumber || '');
  const [formedDate, setFormedDate] = useState(chama.formedDate || '');
  const [currency, setCurrency] = useState(chama.currency || 'KSh');
  const [mpesaTill, setMpesaTill] = useState(chama.mpesaPaybillOrTill || '');
  const [accountNumber, setAccountNumber] = useState(chama.accountNumber || '');

  // Account Lifecycle Status: Active, Suspended, Deactivated
  const [status, setStatus] = useState<'active' | 'suspended' | 'deactivated'>(chama.status || 'active');
  const [statusReason, setStatusReason] = useState(chama.statusReason || '');

  // Commercial Subscription & Tenant Billing Details
  const [planTier, setPlanTier] = useState(chama.planTier || 'Basic');
  const [monthlySubscriptionKsh, setMonthlySubscriptionKsh] = useState(chama.monthlySubscriptionKsh || 0);
  const [systemTillNumber, setSystemTillNumber] = useState(chama.systemTillNumber || globalSystemTill);
  const [cashReceived, setCashReceived] = useState(chama.cashReceived || 0);
  const [debtPending, setDebtPending] = useState(chama.debtPending || 0);
  const [reminderNote, setReminderNote] = useState(chama.reminderNote || '');

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleTierChange = (newTier: string) => {
    setPlanTier(newTier);
    const matched = subscriptionTiers.find(t => t.id === newTier || t.name === newTier);
    if (matched) {
      setMonthlySubscriptionKsh(matched.monthlyFeeKsh);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(chama.id, {
      name: name.trim(),
      category,
      county: county.trim(),
      country: country.trim(),
      tagline: tagline.trim(),
      registrationNumber: registrationNumber.trim(),
      formedDate: formedDate.trim() || undefined,
      currency: currency.trim() || 'KSh',
      mpesaPaybillOrTill: mpesaTill.trim(),
      accountNumber: accountNumber.trim(),
      status,
      statusReason: statusReason.trim(),
      planTier,
      monthlySubscriptionKsh: Number(monthlySubscriptionKsh),
      systemTillNumber: systemTillNumber.trim(),
      cashReceived: Number(cashReceived),
      debtPending: Number(debtPending),
      reminderNote: reminderNote.trim(),
    });
    onClose();
  };

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(chama.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-amber-400 max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#170614] via-[#240c21] to-[#2b1208] text-white p-5 flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-600 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Building2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">SuperAdmin: Tenant Workspace Governance</h3>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  status === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                    : status === 'suspended'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                }`}>
                  {status}
                </span>
              </div>
              <span className="text-[11px] text-rose-200/80 font-mono">Workspace ID: {chama.id}</span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* SECTION 1: ACCOUNT STATUS & LIFECYCLE (Active, Suspended, Deactivated) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/60 to-rose-50/60 border border-amber-300/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-amber-950">
                <Power className="w-4 h-4 text-amber-700" />
                <span>1. Tenant Account Lifecycle & Access Control</span>
              </div>
              <span className="text-[11px] text-slate-500">Super Admin Authority</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option: Active */}
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                  status === 'active'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${status === 'active' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400'}`}>
                  {status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="font-black text-xs block text-emerald-900">Active</span>
                  <span className="text-[10px] text-slate-500">Full platform access</span>
                </div>
              </button>

              {/* Option: Suspended */}
              <button
                type="button"
                onClick={() => setStatus('suspended')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                  status === 'suspended'
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${status === 'suspended' ? 'border-amber-600 bg-amber-600' : 'border-slate-400'}`}>
                  {status === 'suspended' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="font-black text-xs block text-amber-900">Suspended</span>
                  <span className="text-[10px] text-slate-500">Subscription or audit hold</span>
                </div>
              </button>

              {/* Option: Deactivated */}
              <button
                type="button"
                onClick={() => setStatus('deactivated')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                  status === 'deactivated'
                    ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${status === 'deactivated' ? 'border-rose-600 bg-rose-600' : 'border-slate-400'}`}>
                  {status === 'deactivated' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="font-black text-xs block text-rose-900">Deactivated</span>
                  <span className="text-[10px] text-slate-500">Workspace locked</span>
                </div>
              </button>
            </div>

            {status !== 'active' && (
              <div className="pt-1 space-y-1">
                <label className="text-[11px] font-bold text-rose-900 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reason for Suspension / Deactivation (shown to members on sign-in)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unpaid monthly subscription fee of KSh 1,500. Contact 0700123456 to settle."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-white border border-rose-300 rounded-xl text-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            )}
          </div>

          {/* SECTION 2: SUBSCRIPTION TIERS & BILLING SETTINGS */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-slate-900">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>2. Subscription Tiers, System Till & Tenant Debt</span>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded-md">
                Billing Controls
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Assigned Subscription Tier
                </label>
                <select
                  value={planTier}
                  onChange={(e) => handleTierChange(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {subscriptionTiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} — KSh {tier.monthlyFeeKsh}/mo ({tier.memberLimitText})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Monthly Subscription Fee (KSh)
                </label>
                <input
                  type="number"
                  min="0"
                  value={monthlySubscriptionKsh}
                  onChange={(e) => setMonthlySubscriptionKsh(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  System Till Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 589214"
                  value={systemTillNumber}
                  onChange={(e) => setSystemTillNumber(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-white border border-amber-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <span className="text-[10px] text-slate-400">Target Till for SaaS bill payments</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-800 block mb-1">
                  Total Cash Received (KSh)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold bg-white border border-emerald-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-950"
                />
                <span className="text-[10px] text-slate-400">Total revenue collected from tenant</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-rose-800 block mb-1">
                  Pending Debt / Balance Due (KSh)
                </label>
                <input
                  type="number"
                  min="0"
                  value={debtPending}
                  onChange={(e) => setDebtPending(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold bg-white border border-rose-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400 text-rose-950"
                />
                <span className="text-[10px] text-slate-400">Amount owed to platform</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
                <span>Reminder Note to Tenant Officials & Chairman</span>
              </label>
              <textarea
                rows={2}
                value={reminderNote}
                onChange={(e) => setReminderNote(e.target.value)}
                placeholder="e.g. Kindly clear your monthly subscription fee of KSh 1,500 via System Till 589214 by 15th to maintain active services."
                className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="text-[10px] text-slate-500">
                This message is prominently displayed to the Chairperson and officials on their portal.
              </span>
            </div>
          </div>

          {/* SECTION 3: CHAMA LEGAL & OPERATIONAL DETAILS */}
          <div className="space-y-3">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span>3. Chama Legal Profile & Workspaces Details</span>
            </h4>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Chama Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-950"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-950 font-semibold"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Official Reg. Number</label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. SHG/NKR/2022/0481"
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">County</label>
                <input
                  type="text"
                  required
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-950"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Country</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Tenant M-Pesa Till / Paybill</label>
                <input
                  type="text"
                  value={mpesaTill}
                  onChange={(e) => setMpesaTill(e.target.value)}
                  placeholder="e.g. Till: 894120"
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-950"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Bank Account Number / Ref</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. TUMAINI-GRP-01"
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Tagline / Mission</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Chama motto or mission statement"
                className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-950"
              />
            </div>
          </div>

          {/* DANGER ZONE: REMOVE / DELETE CHAMA */}
          <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-rose-900 font-black text-xs">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Permanent Tenant Removal</span>
              </div>
              <p className="text-[11px] text-rose-700/80 leading-snug">
                Permanently purge this Chama workspace and all its members, ledger accounts, and audit logs from the database.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeleteClick}
              className={`py-2 px-4 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                confirmDelete
                  ? 'bg-rose-700 hover:bg-rose-800 text-white animate-pulse shadow-md'
                  : 'bg-white hover:bg-rose-100 text-rose-700 border border-rose-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmDelete ? 'Confirm Permanent Delete' : 'Remove Chama Workspace'}</span>
            </button>
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
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md border border-amber-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>Save Tenant Adjustments</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
