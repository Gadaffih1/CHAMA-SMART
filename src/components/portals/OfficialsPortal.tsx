/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Coins, 
  CreditCard, 
  Users, 
  FileCheck2, 
  TrendingUp, 
  Vote, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Check, 
  X, 
  Plus, 
  DollarSign, 
  Lock, 
  Send,
  Calendar
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { DualAuthModal } from '../modules/DualAuthModal';
import { TableBankingSession } from '../modules/TableBankingSession';
import { InvestmentManager } from '../modules/InvestmentManager';
import { MeetingScheduler } from '../modules/MeetingScheduler';
import { MeetingGovernance } from '../modules/MeetingGovernance';
import { AuditLogViewer } from '../modules/AuditLogViewer';
import { FundType } from '../../types';

export const OfficialsPortal: React.FC = () => {
  const { 
    activeChama, 
    currentOfficialRole, 
    setCurrentOfficialRole, 
    currentUser,
    approveLoanByRole, 
    disburseLoan, 
    transferFunds, 
    advanceMerryGoRound,
    addMember,
    assignMemberRole,
    resetMemberPassword,
  } = useChama();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'members_roles' | 'contributions' | 'loans' | 'table_banking' | 'funds' | 'investments' | 'scheduler' | 'governance' | 'audit'
  >('overview');

  // Fund Transfer State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState<FundType>('general_savings');
  const [transferTo, setTransferTo] = useState<FundType>('loan_revolving');
  const [transferAmount, setTransferAmount] = useState<number>(20000);
  const [transferReason, setTransferReason] = useState<string>('Capital rebalancing for weekly borrowing demand');

  // Add Member State (Secretary authority)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('+254');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberKin, setNewMemberKin] = useState('');
  const [newMemberKinRel, setNewMemberKinRel] = useState('Spouse');
  const [newMemberKinPhone, setNewMemberKinPhone] = useState('+254');
  const [passwordResetMember, setPasswordResetMember] = useState<{ id: string; name: string } | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  // Assign Role State (Chairperson authority)
  const [roleModalMember, setRoleModalMember] = useState<{ id: string; name: string; currentRole: string } | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string>('member');

  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Metrics
  const totalPooledCapital = activeChama.funds.reduce((sum, f) => sum + f.balance, 0);
  const totalActiveLoans = activeChama.loans.reduce((sum, l) => sum + l.balanceRemaining, 0);
  const pendingApprovalsCount = (activeChama.pendingWithdrawals || []).filter(w => w.status === 'pending').length;
  const pendingLoansCount = activeChama.loans.filter(l => l.status === 'under_review' || l.status === 'awaiting_guarantors').length;

  const handleFundTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFrom === transferTo) {
      alert('Source and destination funds must be distinct');
      return;
    }
    transferFunds(transferFrom, transferTo, Number(transferAmount), transferReason);
    setShowTransferModal(false);
    setFeedbackMsg(`Transferred KSh ${transferAmount.toLocaleString()} from ${transferFrom} to ${transferTo}`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    // Secretary or Chairperson authority
    const nextNum = `CS-${activeChama.name.substring(0, 3).toUpperCase()}-${String(activeChama.members.length + 1).padStart(3, '0')}`;
    const res = await addMember({
      name: newMemberName.trim(),
      phoneNumber: newMemberPhone,
      email: newMemberEmail.trim(),
      membershipNumber: nextNum,
      joinedDate: new Date().toISOString().split('T')[0],
      role: 'member',
      password: newMemberPassword,
      nextOfKin: {
        name: newMemberKin || 'Family Contact',
        relationship: newMemberKinRel,
        phone: newMemberKinPhone,
      },
    });

    if (res.success) {
      setShowAddMemberModal(false);
      setNewMemberName('');
      setNewMemberPhone('+254');
      setNewMemberPassword('');
      setNewMemberEmail('');
      setNewMemberKin('');
      setNewMemberKinPhone('+254');
      setFeedbackMsg(res.message);
    } else {
      alert(res.message);
    }
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  const handleResetMemberPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetMember) return;
    const res = await resetMemberPassword(passwordResetMember.id, resetPassword);
    if (res.success) {
      setPasswordResetMember(null);
      setResetPassword('');
      setFeedbackMsg(res.message);
    } else {
      alert(res.message);
    }
  };

  const handleAssignRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalMember) return;

    const res = assignMemberRole(roleModalMember.id, selectedNewRole as any);
    if (res.success) {
      setRoleModalMember(null);
      setFeedbackMsg(res.message);
    } else {
      alert(res.message);
    }
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Officials Top Banner with Role Switcher in Pink & Gold */}
      <div className="bg-white rounded-2xl border border-emerald-200/90 shadow-xs p-4 sm:p-6 w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-100" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-emerald-950">
                {activeChama.name} — Leadership Desk
              </h2>
            </div>
            <p className="text-xs text-emerald-800/80">
              Role-based management, multi-authorization financial checks, lending oversight and regulatory audit
            </p>
          </div>

          {/* Quick Role Switcher Pill in Light Green & Emerald */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-emerald-50/70 p-1.5 sm:p-2 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-950 pl-1">Acting As:</span>
            {(['chairperson', 'treasurer', 'secretary', 'loan_officer'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setCurrentOfficialRole(r)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer whitespace-nowrap ${
                  currentOfficialRole === r
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                    : 'text-emerald-950 hover:bg-emerald-100/70'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation in Light Green & Emerald - Responsive Horizontal Scroll with Zero Overlap */}
        <div className="flex gap-2 overflow-x-auto pt-4 pb-2 border-t border-emerald-100 mt-6 w-full no-scrollbar">
          {[
            { id: 'overview', label: 'Financial Overview', icon: Wallet },
            { id: 'members_roles', label: `Members & Roles (${activeChama.members.length})`, icon: Users },
            { id: 'contributions', label: 'Contributions Ledger', icon: Coins },
            { id: 'loans', label: `Loan Applications (${pendingLoansCount})`, icon: CreditCard },
            { id: 'table_banking', label: 'Table Banking Session', icon: DollarSign },
            { id: 'funds', label: `Funds & Dual-Auth (${pendingApprovalsCount})`, icon: Lock },
            { id: 'investments', label: 'Investments & Assets', icon: TrendingUp },
            { id: 'scheduler', label: `Meeting Scheduler (${activeChama.meetings?.length || 0})`, icon: Calendar },
            { id: 'governance', label: 'Democratic Elections', icon: Vote },
            { id: 'audit', label: 'Audit Trail & Balance Sheet', icon: FileCheck2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                    : 'bg-emerald-50/50 text-emerald-950 hover:bg-emerald-100/70 border border-emerald-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* TAB 1: FINANCIAL OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* High-Level Metric Tiles in Light Green & Emerald */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs hover:border-emerald-400/50 transition">
              <span className="text-xs font-semibold text-emerald-900/70">Total Liquid Reserves</span>
              <div className="text-2xl font-black text-emerald-950 font-mono-num mt-1">
                KSh {totalPooledCapital.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-700 font-bold mt-0.5 block">
                Across 6 segregated funds
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs hover:border-emerald-400/50 transition">
              <span className="text-xs font-semibold text-emerald-900/70">Active Outstanding Loans</span>
              <div className="text-2xl font-black text-emerald-950 font-mono-num mt-1">
                KSh {totalActiveLoans.toLocaleString()}
              </div>
              <span className="text-[11px] text-teal-700 font-bold mt-0.5 block">
                Revolving principal & interest
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Registered Membership</span>
              <div className="text-2xl font-black text-slate-900 font-mono-num mt-1">
                {activeChama.members.length} Members
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                100% KYC verified in {activeChama.county}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Dual-Auth Approvals Due</span>
              <div className="text-2xl font-black text-amber-600 font-mono-num mt-1">
                {pendingApprovalsCount} Requests
              </div>
              <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
                Requires Chairperson sign-off
              </span>
            </div>
          </div>

          {/* Fund Accounts Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Segregated Fund Accounts</h3>
                <p className="text-xs text-slate-500">Strict ring-fencing ensures money cannot be commingled</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTransferModal(true)}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Inter-Fund Rebalancing</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeChama.funds.map((fund) => (
                <div key={fund.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">{fund.name}</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fund.color }}></span>
                  </div>
                  <div className="text-lg font-black font-mono-num text-slate-900">
                    KSh {fund.balance.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{fund.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Merry-Go-Round Rotation Control */}
          {activeChama.merryGoRound && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Merry-Go-Round Payout Engine</h3>
                  <p className="text-xs text-slate-500">
                    Current Recipient: <strong className="text-emerald-700">{activeChama.merryGoRound.membersOrder[activeChama.merryGoRound.currentTurnIndex]?.memberName}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => advanceMerryGoRound(activeChama.merryGoRound!.id)}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Turn Payout (KSh {activeChama.merryGoRound.payoutAmount.toLocaleString()})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: MEMBERS DIRECTORY & ROLE ASSIGNMENTS */}
      {activeTab === 'members_roles' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Member Directory & Constitutional Roles</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {activeChama.members.length} Registered Accounts
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                <strong>Secretary:</strong> Adds and onboards new member accounts. <strong>Chairperson:</strong> Assigns executive roles and governance portfolios.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddMemberModal(true)}
                disabled={!['secretary', 'chairperson'].includes(currentUser?.role || '')}
                className="py-2 px-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-xs border border-amber-300/40 flex items-center gap-1.5 transition cursor-pointer"
                title="Secretary Member Account Onboarding"
              >
                <Plus className="w-3.5 h-3.5 text-amber-100" />
                <span>Secretary: Onboard Member</span>
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px] text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-3">Member Name</th>
                  <th className="py-3 px-3">Member ID</th>
                  <th className="py-3 px-3">Contact & Kin</th>
                  <th className="py-3 px-3">Assigned Role</th>
                  <th className="py-3 px-3">Total Savings</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Chairperson Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeChama.members.map((mem) => {
                  const isChair = mem.role === 'chairperson';
                  const isTreas = mem.role === 'treasurer';
                  const isSec = mem.role === 'secretary';
                  const isLoanOff = mem.role === 'loan_officer';

                  return (
                    <tr key={mem.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{mem.name}</span>
                          {isChair && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-900 border border-amber-400/40 font-bold">
                              Chama Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">Joined {mem.joinedDate}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 font-bold">
                        {mem.membershipNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-800">{mem.phoneNumber}</div>
                        <div className="text-[10px] text-slate-400">Kin: {mem.nextOfKin?.name} ({mem.nextOfKin?.relationship})</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            isChair
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isTreas
                              ? 'bg-pink-100 text-pink-900 border border-pink-300'
                              : isSec
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : isLoanOff
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {mem.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono-num font-extrabold text-slate-900">
                        KSh {mem.totalSavings.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Active KYC
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {['secretary', 'chairperson'].includes(currentUser?.role || '') && (
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordResetMember({ id: mem.id, name: mem.name });
                                setResetPassword('');
                              }}
                              className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                            >
                              Set / Reset Password
                            </button>
                          )}
                          {currentUser?.role === 'chairperson' && (
                            <button
                              type="button"
                              onClick={() => {
                                setRoleModalMember({ id: mem.id, name: mem.name, currentRole: mem.role });
                                setSelectedNewRole(mem.role);
                              }}
                              className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                              title="Chairperson assigns role"
                            >
                              Reassign Role
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONTRIBUTIONS */}
      {activeTab === 'contributions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Member Savings & Contributions Ledger</h3>
              <p className="text-xs text-slate-500">Real-time payment reconciliation via Safaricom M-Pesa</p>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[640px] text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Member Name</th>
                  <th className="py-2.5 px-3">Membership #</th>
                  <th className="py-2.5 px-3">Cycle</th>
                  <th className="py-2.5 px-3">Target Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">M-Pesa Receipt</th>
                  <th className="py-2.5 px-3">Total Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeChama.members.map((mem) => {
                  const contrib = activeChama.contributions.find(c => c.memberId === mem.id);
                  const isPaid = contrib ? contrib.status === 'paid' : true;

                  return (
                    <tr key={mem.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{mem.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{mem.membershipNumber}</td>
                      <td className="py-2.5 px-3 text-slate-600">Week 45 (Nov 2026)</td>
                      <td className="py-2.5 px-3 font-mono-num font-bold text-slate-800">KSh 1,000</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isPaid ? 'PAID & ALLOCATED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {contrib?.mpesaReceipt || 'RKZ' + Math.floor(1000000 + Math.random() * 9000000)}
                      </td>
                      <td className="py-2.5 px-3 font-mono-num font-extrabold text-slate-900">
                        KSh {mem.totalSavings.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOANS MANAGEMENT */}
      {activeTab === 'loans' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Loan Applications & Credit Committee Queue</h3>
              <p className="text-xs text-slate-500">
                Dual approval rule: Chairperson & Treasurer must both sign before M-Pesa B2C disbursement
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Active Official: <strong className="capitalize text-slate-800">{currentOfficialRole}</strong>
            </span>
          </div>

          <div className="space-y-4">
            {activeChama.loans.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No loan applications recorded.</p>
            ) : (
              activeChama.loans.map((loan) => {
                const isUnderReview = loan.status === 'under_review' || loan.status === 'awaiting_guarantors';
                const isApprovedReady = loan.status === 'approved';
                const isDisbursed = loan.status === 'disbursed';

                return (
                  <div
                    key={loan.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">{loan.borrowerName}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {loan.productName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isDisbursed
                                ? 'bg-emerald-100 text-emerald-800'
                                : isApprovedReady
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {loan.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">Purpose: {loan.purpose}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Principal Borrowed</span>
                        <span className="text-lg font-black text-slate-900 font-mono-num">
                          KSh {loan.principal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Guarantors & Approval Badges */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 font-semibold text-[11px]">Guarantors Assent:</span>
                        <div className="flex gap-2">
                          {loan.guarantors.map((g, idx) => (
                            <span
                              key={idx}
                              className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                                g.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {g.memberName}: {g.status}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Sign-offs */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                          loan.approvedByChairperson ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          Chair: {loan.approvedByChairperson ? 'SIGNED' : 'PENDING'}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                          loan.approvedByTreasurer ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          Treasurer: {loan.approvedByTreasurer ? 'SIGNED' : 'PENDING'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                      {isUnderReview && (
                        <button
                          type="button"
                          onClick={() => approveLoanByRole(loan.id, currentOfficialRole as any)}
                          className="px-4 py-1.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Sign & Approve as {currentOfficialRole.toUpperCase()}
                        </button>
                      )}

                      {isApprovedReady && (
                        <button
                          type="button"
                          onClick={() => disburseLoan(loan.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Disburse via M-Pesa B2C (KSh {loan.principal.toLocaleString()})</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: TABLE BANKING */}
      {activeTab === 'table_banking' && <TableBankingSession />}

      {/* TAB 5: FUNDS & DUAL AUTH */}
      {activeTab === 'funds' && <DualAuthModal />}

      {/* TAB 6: INVESTMENTS */}
      {activeTab === 'investments' && <InvestmentManager />}

      {/* TAB 7: MEETING SCHEDULER & ATTENDANCE */}
      {activeTab === 'scheduler' && <MeetingScheduler />}

      {/* TAB 8: GOVERNANCE & ELECTIONS */}
      {activeTab === 'governance' && <MeetingGovernance />}

      {/* TAB 9: AUDIT & FINANCIAL STATEMENTS */}
      {activeTab === 'audit' && <AuditLogViewer />}

      {/* Fund Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Inter-Fund Capital Transfer</h3>
            <p className="text-xs text-slate-500">Transfer liquidity between segregated fund accounts with documented justification</p>

            <form onSubmit={handleFundTransfer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Source Fund (Debit)</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value as FundType)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  {activeChama.funds.map((f) => (
                    <option key={f.id} value={f.type}>
                      {f.name} (Bal: KSh {f.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Destination Fund (Credit)</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value as FundType)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  {activeChama.funds.map((f) => (
                    <option key={f.id} value={f.type}>
                      {f.name} (Bal: KSh {f.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Amount (KSh)</label>
                <input
                  type="number"
                  min="500"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono-num bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Governance Reason</label>
                <textarea
                  rows={2}
                  required
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Execute Rebalancing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secretary: Add New Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-rose-200">
            <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-200" />
                <div>
                  <h3 className="font-bold text-sm">Secretary Member Onboarding</h3>
                  <span className="text-[10px] text-amber-100">Enrolling new member into {activeChama.name}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Member Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grace Wambui Kariuki"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">M-Pesa Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+2547XXXXXXXX"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="member@gmail.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <p className="text-[10px] text-slate-500 mt-1">At least 8 characters. The password is stored as a salted hash.</p>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-2">
                <span className="font-bold text-amber-950 block">Next of Kin Details</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Next of kin name"
                    value={newMemberKin}
                    onChange={(e) => setNewMemberKin(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-amber-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Spouse)"
                    value={newMemberKinRel}
                    onChange={(e) => setNewMemberKinRel(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-amber-200 rounded-lg"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Kin Phone Number"
                  value={newMemberKinPhone}
                  onChange={(e) => setNewMemberKinPhone(e.target.value)}
                  className="w-full text-xs font-mono p-2 bg-white border border-amber-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Enroll Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordResetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form onSubmit={handleResetMemberPassword} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900">Set / Reset Password</h3>
              <p className="text-xs text-slate-500 mt-1">For {passwordResetMember.name}</p>
            </div>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={resetPassword}
              onChange={event => setResetPassword(event.target.value)}
              placeholder="New password (at least 8 characters)"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPasswordResetMember(null)} className="px-4 py-2 text-xs text-slate-600 rounded-xl hover:bg-slate-100">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700">Save Password</button>
            </div>
          </form>
        </div>
      )}

      {/* Chairperson: Reassign Role Modal */}
      {roleModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border-2 border-amber-400/40">
            <div className="bg-gradient-to-r from-amber-950 via-[#270c23] to-rose-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Chairperson Role Assignment</h3>
                  <span className="text-[10px] text-amber-200">Executive portfolio appointment</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRoleModalMember(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignRoleSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs">
                <span className="text-slate-500 block">Member Nominee:</span>
                <span className="font-bold text-slate-900 text-sm">{roleModalMember.name}</span>
                <span className="text-[11px] text-amber-800 block mt-0.5 capitalize">
                  Current Role: {roleModalMember.currentRole.replace('_', ' ')}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Appoint to Executive Portfolio:
                </label>
                <select
                  value={selectedNewRole}
                  onChange={(e) => setSelectedNewRole(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 capitalize"
                >
                  <option value="member">Ordinary Member (Standard Rights)</option>
                  <option value="treasurer">Treasurer (Financial Ledger & Cashbook Custody)</option>
                  <option value="secretary">Secretary (Member Registry & Certified Minutes)</option>
                  <option value="loan_officer">Loan Committee Officer (Appraisal & Credit)</option>
                  <option value="chairperson">Chairperson (Chama Admin Executive Sign-off)</option>
                </select>
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                * Note: Appointees immediately gain access to their role-tailored governance consoles and approval signing workflows.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRoleModalMember(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
