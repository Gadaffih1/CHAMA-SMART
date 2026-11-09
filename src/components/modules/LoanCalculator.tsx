/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calculator, 
  Percent, 
  Calendar, 
  Coins, 
  ArrowRight, 
  ShieldAlert, 
  Info,
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { InterestMethod } from '../../types';
import { useChama } from '../../context/ChamaContext';

interface LoanCalculatorProps {
  onApply?: (params: { principal: number; interestRate: number; interestMethod: InterestMethod; durationWeeks: number }) => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({ onApply }) => {
  const { activeChama } = useChama();

  const [principal, setPrincipal] = useState<number>(10000);
  const [rate, setRate] = useState<number>(5);
  const [weeks, setWeeks] = useState<number>(6);
  const [method, setMethod] = useState<InterestMethod>('flat');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Calculations
  let interestAmount = 0;
  if (method === 'flat') {
    interestAmount = Math.round(principal * (rate / 100));
  } else if (method === 'simple_weekly') {
    interestAmount = Math.round(principal * (rate / 100) * weeks);
  } else {
    // Reducing balance
    interestAmount = Math.round(principal * (rate / 100) * (weeks / 2));
  }

  const totalRepayment = principal + interestAmount;
  const weeklyInstalment = Math.round(totalRepayment / weeks);

  // Schedule breakdown
  const scheduleRows = Array.from({ length: weeks }, (_, idx) => {
    const weekNum = idx + 1;
    const balanceRemaining = Math.max(0, totalRepayment - weeklyInstalment * weekNum);
    return {
      week: weekNum,
      instalment: weeklyInstalment,
      principalPortion: Math.round(principal / weeks),
      interestPortion: Math.round(interestAmount / weeks),
      balanceRemaining,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-rose-200/80 shadow-xs p-4 sm:p-6 overflow-hidden hover:border-amber-300 transition w-full">
      <div className="flex items-center justify-between pb-4 border-b border-rose-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/10 to-amber-500/10 border border-amber-300 text-rose-600 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-rose-950 text-lg flex items-center gap-2">
              <span>Chama Loan Calculator</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-amber-800/70">Calculate repayments, interest rates and weekly instalments</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-amber-100/80 text-amber-900 border border-amber-300 rounded-full font-mono-num">
          Currency: {activeChama.currency}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Principal Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-rose-950 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                Borrowing Amount
              </label>
              <div className="flex items-center gap-1 font-mono-num font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg text-sm">
                <span className="text-xs text-amber-600/70">KSh</span>
                <span>{principal.toLocaleString()}</span>
              </div>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-amber-800/60 mt-1 font-mono-num">
              <span>KSh 1,000</span>
              <span>KSh 50,000</span>
              <span>KSh 100,000</span>
            </div>
          </div>

          {/* Interest Method */}
          <div>
            <label className="text-sm font-semibold text-rose-950 block mb-2">
              Interest Calculation Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('flat')}
                className={`py-2 px-3 text-xs rounded-xl font-medium border text-center transition cursor-pointer ${
                  method === 'flat'
                    ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white border-amber-400 shadow-xs'
                    : 'bg-rose-50/40 text-rose-900 border-rose-200 hover:bg-rose-100/60'
                }`}
              >
                Flat Interest
                <span className="block text-[10px] opacity-80">(Once on principal)</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('simple_weekly')}
                className={`py-2 px-3 text-xs rounded-xl font-medium border text-center transition cursor-pointer ${
                  method === 'simple_weekly'
                    ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white border-amber-400 shadow-xs'
                    : 'bg-rose-50/40 text-rose-900 border-rose-200 hover:bg-rose-100/60'
                }`}
              >
                Simple Weekly
                <span className="block text-[10px] opacity-80">(Per week rate)</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('reducing_balance')}
                className={`py-2 px-3 text-xs rounded-xl font-medium border text-center transition cursor-pointer ${
                  method === 'reducing_balance'
                    ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white border-amber-400 shadow-xs'
                    : 'bg-rose-50/40 text-rose-900 border-rose-200 hover:bg-rose-100/60'
                }`}
              >
                Reducing Balance
                <span className="block text-[10px] opacity-80">(On remaining)</span>
              </button>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-rose-950 flex items-center gap-2">
                <Percent className="w-4 h-4 text-rose-600" />
                Interest Rate
              </label>
              <div className="font-mono-num font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg text-sm">
                {rate}%
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-amber-800/60 mt-1 font-mono-num">
              <span>1%</span>
              <span>10%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Repayment Weeks */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-rose-950 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-600" />
                Repayment Period
              </label>
              <div className="font-mono-num font-bold text-rose-950 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg text-sm">
                {weeks} weeks ({Math.round(weeks / 4.3)} months)
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="1"
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-amber-800/60 mt-1 font-mono-num">
              <span>1 week</span>
              <span>12 weeks</span>
              <span>24 weeks</span>
            </div>
          </div>
        </div>

        {/* Summary Card Column in Pink & Gold */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-rose-50/70 to-amber-50/70 border border-amber-200 rounded-2xl p-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Calculated Repayment Terms</span>
            </div>

            <div className="space-y-3 pb-4 border-b border-rose-200/70">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Principal Amount:</span>
                <span className="font-mono-num font-semibold text-slate-800">
                  KSh {principal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Total Interest ({rate}%):</span>
                <span className="font-mono-num font-bold text-amber-700">
                  + KSh {interestAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Repayment Duration:</span>
                <span className="font-semibold text-slate-800">{weeks} Weeks</span>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs">
                <span className="text-xs text-amber-800/80 block">Total Repayment Amount</span>
                <span className="text-2xl font-black text-rose-950 font-mono-num">
                  KSh {totalRepayment.toLocaleString()}
                </span>
              </div>

              <div className="bg-gradient-to-r from-rose-100/80 to-amber-100/80 p-3.5 rounded-xl border border-amber-300">
                <span className="text-xs text-amber-900 font-semibold block">Equal Weekly Instalment</span>
                <span className="text-xl font-bold text-amber-950 font-mono-num">
                  KSh {weeklyInstalment.toLocaleString()} <span className="text-xs font-normal text-amber-800">/ week</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-amber-900/70 mt-4 leading-relaxed flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
              <span>
                Figures for planning purposes. Group regulations require approval from 2 guarantors and credit committee before disbursement.
              </span>
            </p>
          </div>

          <div className="pt-5 space-y-2">
            {onApply && (
              <button
                type="button"
                onClick={() => onApply({ principal, interestRate: rate, interestMethod: method, durationWeeks: weeks })}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Apply for this Loan</span>
                <ArrowRight className="w-4 h-4 text-amber-100" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full py-2 bg-white hover:bg-rose-50/60 text-rose-950 border border-amber-200 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              {showSchedule ? 'Hide Weekly Schedule' : 'View Weekly Schedule Breakdown'}
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      {showSchedule && (
        <div className="mt-6 pt-5 border-t border-rose-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3">
            Weekly Instalment Schedule ({weeks} Weeks)
          </h4>
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[500px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-amber-50/70 text-amber-950 font-semibold border-b border-amber-200">
                  <th className="py-2 px-3">Week #</th>
                  <th className="py-2 px-3">Instalment Due</th>
                  <th className="py-2 px-3">Principal Portion</th>
                  <th className="py-2 px-3">Interest Portion</th>
                  <th className="py-2 px-3">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100 font-mono-num">
                {scheduleRows.map((row) => (
                  <tr key={row.week} className="hover:bg-rose-50/40">
                    <td className="py-2 px-3 font-semibold text-rose-950">Week {row.week}</td>
                    <td className="py-2 px-3 font-bold text-rose-600">KSh {row.instalment.toLocaleString()}</td>
                    <td className="py-2 px-3 text-slate-600">KSh {row.principalPortion.toLocaleString()}</td>
                    <td className="py-2 px-3 text-amber-700 font-medium">KSh {row.interestPortion.toLocaleString()}</td>
                    <td className="py-2 px-3 text-slate-700 font-medium">KSh {row.balanceRemaining.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
