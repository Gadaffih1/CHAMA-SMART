/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  MapPin, 
  FileCheck, 
  Plus, 
  DollarSign, 
  PieChart, 
  Building2, 
  Check, 
  HelpCircle 
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { InvestmentAsset } from '../../types';

export const InvestmentManager: React.FC = () => {
  const { activeChama, currentMember, addInvestmentAsset } = useChama();

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<InvestmentAsset['category']>('land');
  const [acquisitionCost, setAcquisitionCost] = useState<number>(500000);
  const [currentValuation, setCurrentValuation] = useState<number>(650000);
  const [location, setLocation] = useState<string>('');
  const [titleDeedOrReg, setTitleDeedOrReg] = useState<string>('');
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(25000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(5000);
  const [notes, setNotes] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const investments = activeChama.investments || [];

  const totalPortfolioCost = investments.reduce((sum, inv) => sum + inv.acquisitionCost, 0);
  const totalValuation = investments.reduce((sum, inv) => sum + inv.currentValuation, 0);
  const totalMonthlyNetRevenue = investments.reduce(
    (sum, inv) => sum + (inv.monthlyRevenue - inv.monthlyExpenses),
    0
  );
  const capitalGains = totalValuation - totalPortfolioCost;
  const portfolioROI = totalPortfolioCost > 0 ? ((capitalGains / totalPortfolioCost) * 100).toFixed(1) : '0.0';

  // Total Chama Shares
  const totalChamaSavings = activeChama.members.reduce((sum, m) => sum + m.totalSavings, 0);
  const memberOwnershipSharePct = totalChamaSavings > 0 
    ? ((currentMember.totalSavings / totalChamaSavings) * 100).toFixed(2)
    : '0.00';
  const memberPortfolioValue = totalValuation * (Number(memberOwnershipSharePct) / 100);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addInvestmentAsset({
      title,
      category,
      acquisitionCost: Number(acquisitionCost),
      currentValuation: Number(currentValuation),
      acquisitionDate: new Date().toISOString().split('T')[0],
      location,
      titleDeedOrReg,
      monthlyRevenue: Number(monthlyRevenue),
      monthlyExpenses: Number(monthlyExpenses),
      status: 'active',
      notes,
    });

    setShowAddForm(false);
    setTitle('');
    setLocation('');
    setTitleDeedOrReg('');
    setNotes('');
    setSuccessMsg('Investment asset successfully recorded to group portfolio!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 sm:p-6 overflow-hidden w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rose-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 text-amber-800 flex items-center justify-center border border-amber-200/60 shadow-xs">
            <TrendingUp className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Chama Investment Portfolio</h3>
            <p className="text-xs text-slate-500">
              Collective wealth building in Land, Rental Property, Poultry and Commercial Assets
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-2 px-3 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Asset / Property</span>
        </button>
      </div>

      {successMsg && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-gradient-to-br from-[#fffdf9] to-[#fff7fa] border border-rose-100/90 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-600">Total Portfolio Valuation</span>
          <div className="text-xl font-extrabold text-amber-950 font-mono-num mt-1">
            KSh {totalValuation.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
            +{portfolioROI}% Capital Appreciation
          </span>
        </div>

        <div className="bg-gradient-to-br from-[#fffdf9] to-[#fff7fa] border border-rose-100/90 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-600">Net Monthly Cashflow</span>
          <div className="text-xl font-extrabold text-slate-900 font-mono-num mt-1">
            KSh {totalMonthlyNetRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ mo</span>
          </div>
          <span className="text-[11px] text-slate-500">From rentals & enterprise sales</span>
        </div>

        <div className="bg-gradient-to-br from-rose-50/70 to-rose-100/30 border border-rose-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-rose-900">My Equity Ownership Share</span>
          <div className="text-xl font-extrabold text-rose-950 font-mono-num mt-1">
            {memberOwnershipSharePct}%
          </div>
          <span className="text-[11px] text-rose-700">Based on my total savings</span>
        </div>

        <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/40 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-amber-900">My Portfolio Entitlement</span>
          <div className="text-xl font-extrabold text-amber-950 font-mono-num mt-1">
            KSh {Math.round(memberPortfolioValue).toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">My asset equity value</span>
        </div>
      </div>

      {/* Add Asset Form */}
      {showAddForm && (
        <form onSubmit={handleAddAsset} className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            Register New Investment Asset
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Asset Title / Name</label>
              <input
                type="text"
                required
                placeholder="e.g. 50x100 Plot in Lanet Nakuru or Commercial Bakery Equipment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Asset Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="land">Land / Plot</option>
                <option value="real_estate">Real Estate / Rentals</option>
                <option value="business">Business Enterprise</option>
                <option value="shares">Shares & Money Market</option>
                <option value="equipment">Commercial Machinery</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Acquisition Cost (KSh)</label>
              <input
                type="number"
                required
                value={acquisitionCost}
                onChange={(e) => setAcquisitionCost(Number(e.target.value))}
                className="w-full text-xs font-mono-num bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Current Valuation (KSh)</label>
              <input
                type="number"
                required
                value={currentValuation}
                onChange={(e) => setCurrentValuation(Number(e.target.value))}
                className="w-full text-xs font-mono-num bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Location / County</label>
              <input
                type="text"
                placeholder="e.g. Nakuru, Lanet Phase 2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Title Deed / Registration No.</label>
              <input
                type="text"
                placeholder="e.g. NKR/LANET/BLOCK 14/892"
                value={titleDeedOrReg}
                onChange={(e) => setTitleDeedOrReg(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Monthly Gross Income (KSh)</label>
              <input
                type="number"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                className="w-full text-xs font-mono-num bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Monthly Maintenance Costs (KSh)</label>
              <input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                className="w-full text-xs font-mono-num bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Operating Details & Notes</label>
            <textarea
              rows={2}
              placeholder="Provide custody details, tenants, or operational highlights..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Save to Portfolio
            </button>
          </div>
        </form>
      )}

      {/* Asset Cards */}
      <div className="mt-6 space-y-4">
        {investments.map((inv) => {
          const netMonthly = inv.monthlyRevenue - inv.monthlyExpenses;
          const appreciation = inv.currentValuation - inv.acquisitionCost;
          const apprecPct = ((appreciation / inv.acquisitionCost) * 100).toFixed(1);

          return (
            <div
              key={inv.id}
              className="p-5 rounded-2xl border border-rose-100 hover:border-amber-300 transition bg-gradient-to-r from-white via-white to-[#fffaf8] shadow-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-rose-100 text-amber-900 border border-amber-300/60">
                      {inv.category.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{inv.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                      {inv.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{inv.notes}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    {inv.location && (
                      <span className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {inv.location}
                      </span>
                    )}
                    {inv.titleDeedOrReg && (
                      <span className="flex items-center gap-1 font-mono text-slate-700">
                        <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                        Title: {inv.titleDeedOrReg}
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gradient-to-br from-[#fffdfa] to-[#fff7f9] p-3.5 rounded-xl border border-rose-100/90 shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Acquired Cost</span>
                    <span className="text-xs font-bold text-slate-700 font-mono-num">
                      KSh {inv.acquisitionCost.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Current Valuation</span>
                    <span className="text-xs font-extrabold text-amber-950 font-mono-num">
                      KSh {inv.currentValuation.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold block">+{apprecPct}%</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Net Monthly</span>
                    <span className="text-xs font-bold text-rose-800 font-mono-num">
                      KSh {netMonthly.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">rev - exp</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
