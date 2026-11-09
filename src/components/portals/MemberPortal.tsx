/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wallet, 
  PiggyBank, 
  Coins, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  ArrowRight, 
  RefreshCw, 
  Plus, 
  Check, 
  X, 
  FileText 
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { LoanCalculator } from '../modules/LoanCalculator';
import { MpesaModal } from '../common/MpesaModal';
import { InterestMethod } from '../../types';

export const MemberPortal: React.FC = () => {
  const { 
    activeChama, 
    currentMember, 
    applyForLoan, 
    respondGuarantor 
  } = useChama();

  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [mpesaPaymentType, setMpesaPaymentType] = useState<'contribution' | 'loan_repayment'>('contribution');
  const [mpesaTargetLoanId, setMpesaTargetLoanId] = useState<string | undefined>(undefined);
  const [mpesaDefaultAmount, setMpesaDefaultAmount] = useState<number>(1000);

  // Loan Application State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(activeChama.loanProducts[0]?.id || '');
  const [applyPrincipal, setApplyPrincipal] = useState<number>(10000);
  const [applyWeeks, setApplyWeeks] = useState<number>(6);
  const [applyPurpose, setApplyPurpose] = useState<string>('');
  const [selectedGuarantors, setSelectedGuarantors] = useState<string[]>([]);
  const [applySuccessMsg, setApplySuccessMsg] = useState('');

  // Active Loans for Current Member
  const myLoans = activeChama.loans.filter(l => l.borrowerId === currentMember.id);
  const activeLoan = myLoans.find(l => l.status === 'disbursed' || l.status === 'under_review' || l.status === 'awaiting_guarantors');

  // Guarantor Requests where current member is listed as guarantor
  const guarantorRequests = activeChama.loans.flatMap(l => 
    l.guarantors
      .filter(g => g.memberId === currentMember.id && g.status === 'pending')
      .map(g => ({ loan: l, guarantor: g }))
  );

  // Current Member Pending Contribution
  const pendingContribution = activeChama.contributions.find(
    c => c.memberId === currentMember.id && c.status === 'pending'
  );

  // Merry-Go-Round turn
  const mgr = activeChama.merryGoRound;
  const myTurn = mgr?.membersOrder.find(m => m.memberId === currentMember.id);

  const handleOpenMpesaContribution = () => {
    setMpesaPaymentType('contribution');
    setMpesaDefaultAmount(pendingContribution?.targetAmount || 1000);
    setIsMpesaModalOpen(true);
  };

  const handleOpenMpesaRepayment = (loanId: string, instalment: number) => {
    setMpesaPaymentType('loan_repayment');
    setMpesaTargetLoanId(loanId);
    setMpesaDefaultAmount(instalment);
    setIsMpesaModalOpen(true);
  };

  const handlePreFillLoan = (params: { principal: number; interestRate: number; interestMethod: InterestMethod; durationWeeks: number }) => {
    setApplyPrincipal(params.principal);
    setApplyWeeks(params.durationWeeks);
    setShowApplyModal(true);
  };

  const handleSubmitLoanApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const product = activeChama.loanProducts.find(p => p.id === selectedProductId) || activeChama.loanProducts[0];
    if (!product) return;

    applyForLoan({
      borrowerId: currentMember.id,
      productId: product.id,
      principal: applyPrincipal,
      durationWeeks: applyWeeks,
      interestRate: product.interestRate,
      interestMethod: product.interestMethod,
      purpose: applyPurpose || 'Personal / Business growth',
      guarantorIds: selectedGuarantors,
    });

    setShowApplyModal(false);
    setApplyPurpose('');
    setSelectedGuarantors([]);
    setApplySuccessMsg('Loan application successfully submitted! Guarantors will be notified.');
    setTimeout(() => setApplySuccessMsg(''), 5000);
  };

  const toggleGuarantorSelection = (memberId: string) => {
    if (selectedGuarantors.includes(memberId)) {
      setSelectedGuarantors(selectedGuarantors.filter(id => id !== memberId));
    } else {
      setSelectedGuarantors([...selectedGuarantors, memberId]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Member Welcome Hero in Pink & Gold */}
      <div className="bg-gradient-to-r from-rose-950 via-[#270c23] to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/2 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 border border-amber-300/40 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-rose-950/60 shrink-0">
              {currentMember.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight">{currentMember.name}</h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {currentMember.membershipNumber}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  KYC Gold Verified
                </span>
              </div>
              <p className="text-xs text-amber-100/80">
                {activeChama.name} • Member Since {currentMember.joinedDate}
              </p>
              <div className="text-[11px] text-rose-200/70 flex flex-wrap gap-x-4 pt-1">
                <span>Phone: <strong className="text-white font-mono">{currentMember.phoneNumber}</strong></span>
                <span>Next of Kin: <strong className="text-white">{currentMember.nextOfKin?.name} ({currentMember.nextOfKin?.relationship})</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOpenMpesaContribution}
              className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-300/30 flex items-center gap-2 transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-100" />
              <span>Pay Weekly Contribution</span>
            </button>
            <button
              type="button"
              onClick={() => setShowApplyModal(true)}
              className="py-2.5 px-4 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl border border-amber-300/40 shadow-lg shadow-rose-950/40 flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-200" />
              <span>Request Loan</span>
            </button>
          </div>
        </div>

        {/* Member Financial Metric Strip in Pink & Gold - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 sm:mt-8 pt-6 border-t border-amber-500/20">
          <div className="p-2 sm:p-0">
            <span className="text-xs text-amber-200/80 block">Total Accumulated Savings</span>
            <span className="text-xl sm:text-2xl font-black font-mono-num text-amber-300">
              KSh {currentMember.totalSavings.toLocaleString()}
            </span>
            <span className="text-[11px] text-rose-200/60 block">Core personal equity</span>
          </div>

          <div className="p-2 sm:p-0">
            <span className="text-xs text-amber-200/80 block">Chama Shares Held</span>
            <span className="text-xl sm:text-2xl font-black font-mono-num text-pink-200">
              {currentMember.sharesCount} <span className="text-xs font-normal text-rose-300/70">Shares</span>
            </span>
            <span className="text-[11px] text-rose-200/60 block">KSh 1,000 per share</span>
          </div>

          <div className="p-2 sm:p-0">
            <span className="text-xs text-amber-200/80 block">Active Loan Balance</span>
            <span className="text-xl sm:text-2xl font-black font-mono-num text-rose-300">
              KSh {currentMember.activeLoanBalance.toLocaleString()}
            </span>
            <span className="text-[11px] text-rose-200/60 block">
              {currentMember.activeLoanBalance > 0 ? 'Repayments ongoing' : 'No active debts'}
            </span>
          </div>

          <div className="p-2 sm:p-0">
            <span className="text-xs text-amber-200/80 block">Chama Credit Rating</span>
            <span className="text-xl sm:text-2xl font-black font-mono-num text-amber-400">
              {currentMember.creditScore} <span className="text-xs font-normal text-amber-200/70">/ 850</span>
            </span>
            <span className="text-[11px] text-rose-200/60 block">
              {currentMember.attendanceRate}% Attendance record
            </span>
          </div>
        </div>
      </div>

      {applySuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{applySuccessMsg}</span>
        </div>
      )}

      {/* Guarantor Obligations Alert (if any pending) */}
      {guarantorRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Action Required: You have been nominated as a Loan Guarantor</span>
          </div>
          <div className="space-y-2">
            {guarantorRequests.map(({ loan, guarantor }) => (
              <div key={loan.id} className="bg-white p-3.5 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{loan.borrowerName}</span> applied for a{' '}
                  <strong className="text-blue-700">{loan.productName}</strong> of{' '}
                  <span className="font-mono-num font-bold">KSh {loan.principal.toLocaleString()}</span>.
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Guaranteed amount requested: <strong className="text-amber-800">KSh {guarantor.amountGuaranteed.toLocaleString()}</strong> • Purpose: {loan.purpose}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => respondGuarantor(loan.id, currentMember.id, false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => respondGuarantor(loan.id, currentMember.id, true)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Guarantee</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Loan Status & Merry-Go-Round */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Loan Details */}
        <div className="bg-white rounded-2xl border border-rose-200/80 shadow-xs p-6 flex flex-col justify-between hover:border-amber-400/50 transition">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-rose-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/10 to-amber-500/10 border border-amber-300 text-rose-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-rose-950 text-base">My Active Loan Status</h3>
                  <span className="text-xs text-amber-800/70">Weekly repayment schedule</span>
                </div>
              </div>

              {activeLoan && (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {activeLoan.status}
                </span>
              )}
            </div>

            {activeLoan ? (
              <div className="space-y-4">
                <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-semibold text-rose-900">{activeLoan.productName}</span>
                    <span className="text-xs font-mono font-bold text-amber-800">{activeLoan.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                    <div>
                      <span className="text-slate-400 block">Total Payable:</span>
                      <span className="font-mono-num font-bold text-slate-800 text-sm">
                        KSh {activeLoan.totalPayable.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Remaining Balance:</span>
                      <span className="font-mono-num font-extrabold text-rose-600 text-base">
                        KSh {activeLoan.balanceRemaining.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Weekly Instalment:</span>
                      <span className="font-mono-num font-bold text-amber-700">
                        KSh {activeLoan.weeklyInstalment.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Final Due Date:</span>
                      <span className="font-semibold text-slate-800">{activeLoan.dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Repayments History */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-amber-900/80 mb-2">Recent Instalments Paid</h4>
                  {activeLoan.repayments.length === 0 ? (
                    <p className="text-xs text-rose-300 italic">No repayments recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {activeLoan.repayments.map((rep) => (
                        <div key={rep.id} className="flex justify-between items-center text-xs p-2 bg-amber-50/50 rounded-lg border border-amber-100 font-mono-num">
                          <div>
                            <span className="font-bold text-emerald-700">+ KSh {rep.amount.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 block">{rep.date} • {rep.mpesaReceipt}</span>
                          </div>
                          <span className="text-slate-500 text-[11px]">Bal: KSh {rep.balanceAfter.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                You have no active or outstanding loan. Need funds? Check the calculator below to apply!
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-rose-100 mt-4">
            {activeLoan && activeLoan.status === 'disbursed' && activeLoan.balanceRemaining > 0 ? (
              <button
                type="button"
                onClick={() => handleOpenMpesaRepayment(activeLoan.id, activeLoan.weeklyInstalment)}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay Weekly Instalment (KSh {activeLoan.weeklyInstalment.toLocaleString()})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowApplyModal(true)}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Apply for a New Loan
              </button>
            )}
          </div>
        </div>

        {/* Merry-Go-Round Rotation Card in Pink & Gold */}
        {mgr ? (
          <div className="bg-white rounded-2xl border border-amber-200/80 shadow-xs p-6 flex flex-col justify-between hover:border-amber-400/50 transition">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-amber-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/10 to-rose-500/10 border border-amber-300 text-amber-600 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-rose-950 text-base">Merry-Go-Round Payout Wheel</h3>
                    <span className="text-xs text-amber-800/70">{mgr.roundName}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-900 bg-amber-100/80 border border-amber-300 px-2.5 py-1 rounded-full font-mono-num">
                  Pot: KSh {mgr.payoutAmount.toLocaleString()}
                </span>
              </div>

              {myTurn && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 mb-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-950">My Designated Turn:</span>
                    <span className="font-extrabold text-amber-800">Position #{myTurn.order}</span>
                  </div>
                  <div className="mt-1 text-slate-600">
                    Payout Date: <strong className="text-rose-950">{myTurn.payoutDate}</strong>
                  </div>
                  <div className="mt-1">
                    Status:{' '}
                    {myTurn.isPaid ? (
                      <span className="text-emerald-700 font-bold">DISBURSED ({myTurn.mpesaReceipt})</span>
                    ) : (
                      <span className="text-amber-700 font-bold">SCHEDULED</span>
                    )}
                  </div>
                </div>
              )}

              {/* Roster Sequence */}
              <div>
                <h4 className="text-xs font-bold uppercase text-amber-900/80 mb-2">Rotation Sequence</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {mgr.membersOrder.map((item, idx) => {
                    const isCurrent = idx === mgr.currentTurnIndex;
                    return (
                      <div
                        key={item.memberId}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs transition ${
                          isCurrent
                            ? 'bg-gradient-to-r from-rose-100 to-amber-100 text-rose-950 font-bold border border-amber-300'
                            : 'bg-rose-50/30 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] font-mono">
                            {item.order}
                          </span>
                          <span>{item.memberName}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono-num text-[11px]">
                          <span>{item.payoutDate}</span>
                          {item.isPaid ? (
                            <span className="text-emerald-600 font-bold text-[10px]">PAID</span>
                          ) : isCurrent ? (
                            <span className="text-rose-700 font-bold animate-pulse text-[10px]">CURRENT</span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">WAITING</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-100 mt-4 text-xs text-amber-800/70 text-center">
              Each member contributes KSh {mgr.contributionPerMember.toLocaleString()} weekly to form the lump-sum payout.
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-rose-200/80 shadow-xs p-6 flex items-center justify-center text-xs text-slate-400">
            No Merry-Go-Round currently configured for this group.
          </div>
        )}
      </div>

      {/* Interactive Loan Calculator Section */}
      <LoanCalculator onApply={handlePreFillLoan} />

      {/* Loan Application Modal in Pink & Gold */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-amber-300 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-amber-200" />
                <h3 className="font-bold text-base">Submit Chama Loan Application</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitLoanApplication} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-semibold text-rose-950 block mb-1">Select Loan Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full text-xs font-medium bg-rose-50/40 border border-amber-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {activeChama.loanProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.interestRate}% interest • Max KSh {p.maxAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-rose-950 block mb-1">Borrowing Principal (KSh)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={applyPrincipal}
                    onChange={(e) => setApplyPrincipal(Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono-num bg-rose-50/40 border border-amber-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-rose-950 block mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={applyWeeks}
                    onChange={(e) => setApplyWeeks(Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono-num bg-rose-50/40 border border-amber-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-rose-950 block mb-1">Loan Purpose / Reason</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Stock for kiosk shop, medical emergency, school fees balance..."
                  value={applyPurpose}
                  onChange={(e) => setApplyPurpose(e.target.value)}
                  className="w-full text-xs bg-rose-50/40 border border-amber-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Select Fellow Members as Guarantors */}
              <div>
                <label className="text-xs font-semibold text-rose-950 block mb-1">
                  Select Guarantors from Chama Members ({selectedGuarantors.length} selected)
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1 border border-amber-200 rounded-xl p-2 bg-rose-50/20">
                  {activeChama.members
                    .filter(m => m.id !== currentMember.id)
                    .map((m) => {
                      const isSelected = selectedGuarantors.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleGuarantorSelection(m.id)}
                          className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'bg-amber-100 text-amber-950 font-bold border border-amber-400'
                              : 'bg-white hover:bg-rose-50/60 text-slate-700 border border-rose-100'
                          }`}
                        >
                          <span>{m.name} ({m.membershipNumber})</span>
                          <span className="font-mono-num text-[11px] text-amber-800">
                            Savings: KSh {m.totalSavings.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* M-Pesa Modal */}
      <MpesaModal
        isOpen={isMpesaModalOpen}
        onClose={() => setIsMpesaModalOpen(false)}
        type={mpesaPaymentType}
        loanId={mpesaTargetLoanId}
        defaultAmount={mpesaDefaultAmount}
      />
    </div>
  );
};
