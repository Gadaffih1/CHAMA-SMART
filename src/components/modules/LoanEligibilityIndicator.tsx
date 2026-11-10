/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  CalendarCheck, 
  CreditCard, 
  ArrowRight,
  Info,
  Sparkles,
  Lock
} from 'lucide-react';
import { Member, Contribution } from '../../types';

interface LoanEligibilityIndicatorProps {
  member: Member;
  contributions: Contribution[];
  onApplyClick: () => void;
  onTopUpClick: () => void;
}

export const LoanEligibilityIndicator: React.FC<LoanEligibilityIndicatorProps> = ({
  member,
  contributions,
  onApplyClick,
  onTopUpClick,
}) => {
  // Member's contribution records
  const memberContributions = contributions.filter(c => c.memberId === member.id);
  const paidCount = memberContributions.filter(c => c.status === 'paid').length;
  const totalCount = memberContributions.length || 1;
  const onTimePaymentRate = Math.round((paidCount / totalCount) * 100);

  // Overall frequency score combines payment track record and meeting attendance
  const frequencyScore = Math.round(
    onTimePaymentRate * 0.6 + (member.attendanceRate || 85) * 0.4
  );

  // Financial Eligibility Rules
  const MIN_SAVINGS_REQUIRED = 3000;
  const SAVINGS_MULTIPLIER = 3; // 3x Savings Multiple standard in East Africa Chamas
  const grossBorrowingCap = member.totalSavings * SAVINGS_MULTIPLIER;
  const netEligibleAmount = Math.max(0, grossBorrowingCap - member.activeLoanBalance);

  // Eligibility Status Determination
  const hasMinSavings = member.totalSavings >= MIN_SAVINGS_REQUIRED;
  const hasGoodFrequency = frequencyScore >= 75;
  const hasActiveLoan = member.activeLoanBalance > 0;

  let eligibilityStatus: 'qualified' | 'conditional' | 'not_eligible' = 'qualified';
  let statusTitle = 'Fully Qualified for Chama Credit';
  let statusDescription = `You qualify for up to KSh ${netEligibleAmount.toLocaleString()} based on your consistent contribution record and 3x savings multiplier.`;

  if (!hasMinSavings || frequencyScore < 60) {
    eligibilityStatus = 'not_eligible';
    statusTitle = 'Savings / Contribution Threshold Required';
    statusDescription = !hasMinSavings 
      ? `Minimum savings balance of KSh ${MIN_SAVINGS_REQUIRED.toLocaleString()} is required. Current balance: KSh ${member.totalSavings.toLocaleString()}.`
      : `Contribution frequency is ${frequencyScore}%. A minimum of 60% on-time consistency is needed to unlock borrowing.`;
  } else if (hasActiveLoan || frequencyScore < 75) {
    eligibilityStatus = 'conditional';
    statusTitle = hasActiveLoan ? 'Eligible with Active Loan Deductions' : 'Conditionally Eligible';
    statusDescription = hasActiveLoan
      ? `You have an active loan balance of KSh ${member.activeLoanBalance.toLocaleString()}. Your remaining borrowing capacity is KSh ${netEligibleAmount.toLocaleString()}.`
      : `You qualify for credit, but maintaining 75%+ contribution frequency unlocks the lowest interest rates.`;
  }

  return (
    <div className="bg-white rounded-2xl border border-emerald-200/90 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Indicator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              eligibilityStatus === 'qualified' 
                ? 'bg-emerald-100 text-emerald-800' 
                : eligibilityStatus === 'conditional'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-emerald-950 text-base sm:text-lg">
                  Chama Loan Eligibility Indicator
                </h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  eligibilityStatus === 'qualified'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : eligibilityStatus === 'conditional'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {eligibilityStatus === 'qualified' ? 'Qualified' : eligibilityStatus === 'conditional' ? 'Conditional' : 'Review Required'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-emerald-800/70">
            Real-time appraisal calculated from your contribution frequency, meeting attendance, and cumulative savings
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          {netEligibleAmount > 0 && eligibilityStatus !== 'not_eligible' ? (
            <button
              type="button"
              onClick={onApplyClick}
              className="py-2 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>Apply for Up to KSh {netEligibleAmount.toLocaleString()}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onTopUpClick}
              className="py-2 px-3.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs rounded-xl border border-emerald-300 transition flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Top Up Savings via M-Pesa</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Status Banner */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        eligibilityStatus === 'qualified'
          ? 'bg-emerald-50/70 border-emerald-200'
          : eligibilityStatus === 'conditional'
          ? 'bg-amber-50/70 border-amber-200'
          : 'bg-rose-50/70 border-rose-200'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {eligibilityStatus === 'qualified' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {eligibilityStatus === 'conditional' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
            {eligibilityStatus === 'not_eligible' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span className="font-bold text-xs sm:text-sm text-slate-900">{statusTitle}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            {statusDescription}
          </p>
        </div>

        {/* Max Capacity Highlight */}
        <div className="text-left md:text-right shrink-0 bg-white/80 p-3 rounded-lg border border-slate-200/60">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Available Borrowing Limit</span>
          <span className="text-xl sm:text-2xl font-black font-mono-num text-emerald-700">
            KSh {netEligibleAmount.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block">3x Multiple of Personal Savings</span>
        </div>
      </div>

      {/* 4 Quantitative Factor Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        {/* Factor 1: Total Savings Balance */}
        <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-emerald-950">Savings Balance</span>
            {hasMinSavings ? (
              <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pass
              </span>
            ) : (
              <span className="text-rose-600 text-[11px] font-bold flex items-center gap-0.5">
                <AlertCircle className="w-3.5 h-3.5" /> Below Min
              </span>
            )}
          </div>
          <div className="text-lg font-black font-mono-num text-emerald-950">
            KSh {member.totalSavings.toLocaleString()}
          </div>
          <div className="space-y-1">
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, (member.totalSavings / MIN_SAVINGS_REQUIRED) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-emerald-800/70">
              <span>Target: KSh {MIN_SAVINGS_REQUIRED.toLocaleString()}</span>
              <span>{Math.round((member.totalSavings / MIN_SAVINGS_REQUIRED) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Factor 2: Contribution Frequency */}
        <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-emerald-950">Contribution Frequency</span>
            {onTimePaymentRate >= 75 ? (
              <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> High
              </span>
            ) : (
              <span className="text-amber-700 text-[11px] font-bold flex items-center gap-0.5">
                <AlertCircle className="w-3.5 h-3.5" /> Moderate
              </span>
            )}
          </div>
          <div className="text-lg font-black font-mono-num text-emerald-950">
            {onTimePaymentRate}% <span className="text-xs font-medium text-emerald-800">on-time</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-1.5 rounded-full" 
                style={{ width: `${onTimePaymentRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-emerald-800/70">
              <span>{paidCount} of {totalCount} cycles paid</span>
              <span>Min 60%</span>
            </div>
          </div>
        </div>

        {/* Factor 3: Meeting Attendance Rate */}
        <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-emerald-950">Meeting Attendance</span>
            {member.attendanceRate >= 80 ? (
              <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Consistent
              </span>
            ) : (
              <span className="text-amber-700 text-[11px] font-bold flex items-center gap-0.5">
                <AlertCircle className="w-3.5 h-3.5" /> Fair
              </span>
            )}
          </div>
          <div className="text-lg font-black font-mono-num text-emerald-950">
            {member.attendanceRate}% <span className="text-xs font-medium text-emerald-800">rate</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-1.5 rounded-full" 
                style={{ width: `${member.attendanceRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-emerald-800/70">
              <span>AGM & Weekly Sessions</span>
              <span>Min 70%</span>
            </div>
          </div>
        </div>

        {/* Factor 4: Active Loan Deductions */}
        <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-emerald-950">Existing Debt Exposure</span>
            {member.activeLoanBalance === 0 ? (
              <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Clear
              </span>
            ) : (
              <span className="text-amber-700 text-[11px] font-bold flex items-center gap-0.5">
                <CreditCard className="w-3.5 h-3.5" /> Active
              </span>
            )}
          </div>
          <div className="text-lg font-black font-mono-num text-emerald-950">
            KSh {member.activeLoanBalance.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-800/70">
            {member.activeLoanBalance > 0 
              ? 'Deducted directly from your 3x borrowing limit' 
              : 'Zero active debt balances against your savings'}
          </p>
        </div>
      </div>
    </div>
  );
};
