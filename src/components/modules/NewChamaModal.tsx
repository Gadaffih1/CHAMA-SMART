/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  CheckCircle, 
  Coins, 
  Smartphone, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { ChamaCategory } from '../../types';

interface NewChamaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChamaModal: React.FC<NewChamaModalProps> = ({ isOpen, onClose }) => {
  const { createChama } = useChama();

  const [name, setName] = useState<string>('');
  const [tagline, setTagline] = useState<string>('Together we save, together we prosper');
  const [category, setCategory] = useState<ChamaCategory>('table_banking');
  const [county, setCounty] = useState<string>('Nairobi County');
  const [planTier, setPlanTier] = useState<'Starter' | 'Basic' | 'Growth' | 'Professional' | 'Enterprise'>('Basic');
  const [mpesaPaybill, setMpesaPaybill] = useState<string>('Till: 789123');
  const [loanModel, setLoanModel] = useState<string>('both'); // weekly & monthly

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createChama({
      name: name.trim(),
      tagline,
      category,
      county,
      planTier,
      monthlySubscriptionKsh: 
        planTier === 'Starter' ? 0 : 
        planTier === 'Basic' ? 500 : 
        planTier === 'Growth' ? 1500 : 
        planTier === 'Professional' ? 2500 : 5000,
      mpesaPaybillOrTill: mpesaPaybill,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950 via-[#270c23] to-amber-950 text-white p-5 flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-rose-950 flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight text-white">Register New Chama Workspace</h3>
              <p className="text-xs text-amber-200/80">Independent multi-tenant digital office</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Chama / Group Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amani Traders Table Banking Group"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Group Motto / Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Operating Model</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ChamaCategory)}
                className="w-full text-xs bg-slate-50 border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
              >
                <option value="table_banking">Table Banking</option>
                <option value="weekly_savings">Weekly Savings Chama</option>
                <option value="investment">Investment Club</option>
                <option value="merry_go_round">Merry-Go-Round</option>
                <option value="welfare_group">Welfare / Benevolent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">County / Region</label>
              <input
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Safaricom M-Pesa Paybill / Till
              </label>
              <input
                type="text"
                placeholder="Till: 894120"
                value={mpesaPaybill}
                onChange={(e) => setMpesaPaybill(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">SaaS Plan Tier</label>
              <select
                value={planTier}
                onChange={(e) => setPlanTier(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
              >
                <option value="Starter">Starter (Free, Individual / Family)</option>
                <option value="Basic">Basic (500/- per month, Up to 10 members)</option>
                <option value="Growth">Growth (1,500/- per month, Up to 30 members)</option>
                <option value="Professional">Professional (2,500/- per month, Up to 50 members)</option>
                <option value="Enterprise">Enterprise (Custom Quote, Over 50 members)</option>
              </select>
            </div>
          </div>

          <div className="bg-gradient-to-r from-rose-50/50 to-amber-50/40 p-3 rounded-xl border border-rose-100 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">Included Default Architecture:</div>
            <div className="text-[11px] text-slate-600">• 6 Independent Fund Buckets (General, Loans, Welfare, Investment, Emergency, Admin)</div>
            <div className="text-[11px] text-slate-600">• Append-only immutable transaction ledger with dual-authorization</div>
            <div className="text-[11px] text-slate-600">• M-Pesa Daraja STK Push reconciliation</div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Provision Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
