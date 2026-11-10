/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Building2, Save, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Chama } from '../../types';

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
  if (!isOpen || !chama) return null;

  const [name, setName] = useState(chama.name);
  const [category, setCategory] = useState(chama.category);
  const [county, setCounty] = useState(chama.county);
  const [tagline, setTagline] = useState(chama.tagline || '');
  const [registrationNumber, setRegistrationNumber] = useState(chama.registrationNumber || '');
  const [planTier, setPlanTier] = useState(chama.planTier);
  const [monthlySubscriptionKsh, setMonthlySubscriptionKsh] = useState(chama.monthlySubscriptionKsh || 0);
  const [mpesaTill, setMpesaTill] = useState(chama.mpesaPaybillOrTill || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleTierChange = (newTier: any) => {
    setPlanTier(newTier);
    const rates: Record<string, number> = {
      Starter: 0,
      Basic: 500,
      Growth: 1500,
      Professional: 2500,
      Enterprise: 5000,
    };
    setMonthlySubscriptionKsh(rates[newTier] || 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(chama.id, {
      name: name.trim(),
      category,
      county,
      tagline: tagline.trim(),
      registrationNumber: registrationNumber.trim(),
      planTier,
      monthlySubscriptionKsh: Number(monthlySubscriptionKsh),
      mpesaPaybillOrTill: mpesaTill.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-emerald-400 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-base">Super Admin: Edit Chama Workspace</h3>
              <span className="text-[11px] text-emerald-200 font-mono">ID: {chama.id}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-semibold text-emerald-950 block mb-1">Chama Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs font-bold bg-emerald-50/40 border border-emerald-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-emerald-950 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs bg-emerald-50/40 border border-emerald-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-950"
              >
                <option value="table_banking">Table Banking</option>
                <option value="investment">Investment Syndicate</option>
                <option value="merry_go_round">Merry-Go-Round</option>
                <option value="welfare">Welfare / Community</option>
                <option value="mixed">Mixed Multipurpose</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-emerald-950 block mb-1">County</label>
              <input
                type="text"
                required
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full text-xs bg-emerald-50/40 border border-emerald-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-emerald-950 block mb-1">Subscription Tier</label>
              <select
                value={planTier}
                onChange={(e) => handleTierChange(e.target.value as any)}
                className="w-full text-xs font-bold bg-emerald-50/40 border border-emerald-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-950"
              >
                <option value="Starter">Starter (Free upto members)</option>
                <option value="Basic">Basic (500/- mo, upto 10 members)</option>
                <option value="Growth">Growth (1500/- mo, upto 30 members)</option>
                <option value="Professional">Professional (2500/- mo, upto 50 members)</option>
                <option value="Enterprise">Enterprise (Custom Quote)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-emerald-950 block mb-1">Monthly Fee (KSh)</label>
              <input
                type="number"
                min="0"
                value={monthlySubscriptionKsh}
                onChange={(e) => setMonthlySubscriptionKsh(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold bg-emerald-50/40 border border-emerald-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-emerald-950 block mb-1">Registration Number</label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full text-xs font-mono bg-emerald-50/40 border border-emerald-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-950"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-emerald-950 block mb-1">M-Pesa Till / Paybill</label>
              <input
                type="text"
                value={mpesaTill}
                onChange={(e) => setMpesaTill(e.target.value)}
                className="w-full text-xs font-mono bg-emerald-50/40 border border-emerald-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-950"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-950 block mb-1">Tagline / Mission</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full text-xs bg-emerald-50/40 border border-emerald-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-950"
            />
          </div>

          {/* Delete Danger Zone */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2 mt-2">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-rose-900 block">Delete Chama Workspace</span>
              <span className="text-[10px] text-rose-700/80 block">Removes this tenant and all its scoped records</span>
            </div>
            <button
              type="button"
              onClick={handleDeleteClick}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                confirmDelete
                  ? 'bg-rose-700 text-white animate-pulse'
                  : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmDelete ? 'Confirm Permanent Delete' : 'Delete'}</span>
            </button>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-emerald-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Workspace Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
