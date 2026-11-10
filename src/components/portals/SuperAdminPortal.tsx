/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Building2, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowRight, 
  Server, 
  Lock, 
  DollarSign, 
  Layers,
  Sparkles,
  Check,
  X,
  FileText,
  Clock,
  UserCheck,
  Database,
  Download,
  FolderDown,
  RefreshCw,
  HardDrive,
  Edit,
  Send,
  Receipt,
  Power,
  Trash2,
  BellRing,
  CreditCard,
  Save
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { NewChamaModal } from '../modules/NewChamaModal';
import { UserAccountManager } from '../modules/UserAccountManager';
import { SuperAdminEditChamaModal } from '../modules/SuperAdminEditChamaModal';
import { PushSubscriptionBillModal } from '../modules/PushSubscriptionBillModal';
import { SuperAdminRecordPaymentModal } from '../modules/SuperAdminRecordPaymentModal';
import { Chama, SubscriptionTier } from '../../types';

interface DumpFileInfo {
  filename: string;
  sizeBytes: number;
  created: string;
  modified: string;
}

export const SuperAdminPortal: React.FC = () => {
  const { 
    allChamas, 
    setActiveChamaId, 
    activeChama, 
    registrationApplications, 
    reviewRegistrationApplication,
    exportSqlDump,
    isDbSyncing,
    editChama,
    deleteChama,
    setChamaStatus,
    subscriptionTiers,
    updateSubscriptionTiers,
    systemTillNumber,
    setSystemTillNumber,
    updateTenantBilling,
  } = useChama();

  const [isNewChamaOpen, setIsNewChamaOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'applications' | 'tenants' | 'accounts' | 'tiers' | 'database'>('applications');
  const [adminFeedback, setAdminFeedback] = useState<string>('');
  const [dumpFiles, setDumpFiles] = useState<DumpFileInfo[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Modals for tenant editing, billing & push
  const [editingChama, setEditingChama] = useState<Chama | null>(null);
  const [pushBillChama, setPushBillChama] = useState<Chama | null>(null);
  const [recordPayChama, setRecordPayChama] = useState<Chama | null>(null);

  // Platform System Till quick edit
  const [editTillInput, setEditTillInput] = useState<string>(systemTillNumber);
  const [isSavingTill, setIsSavingTill] = useState<boolean>(false);

  // Subscription Tiers editor
  const [tiersList, setTiersList] = useState<SubscriptionTier[]>(subscriptionTiers);
  const [isEditingTiers, setIsEditingTiers] = useState<boolean>(false);

  useEffect(() => {
    setEditTillInput(systemTillNumber);
  }, [systemTillNumber]);

  useEffect(() => {
    setTiersList(subscriptionTiers);
  }, [subscriptionTiers]);

  const fetchDumpFiles = async () => {
    try {
      const res = await fetch('/api/db/dumps');
      if (res.ok) {
        const data = await res.json();
        setDumpFiles(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (adminTab === 'database') {
      fetchDumpFiles();
    }
  }, [adminTab]);

  const handleExportDump = async () => {
    setIsExporting(true);
    const res = await exportSqlDump();
    setIsExporting(false);
    if (res.success) {
      setAdminFeedback(res.message);
      fetchDumpFiles();
      setTimeout(() => setAdminFeedback(''), 8000);
    } else {
      setAdminFeedback(`Export failed: ${res.message}`);
      setTimeout(() => setAdminFeedback(''), 8000);
    }
  };

  const handleSaveSystemTill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTillInput.trim()) return;
    setIsSavingTill(true);
    const res = setSystemTillNumber(editTillInput.trim());
    setIsSavingTill(false);
    if (res.success) {
      setAdminFeedback(res.message);
      setTimeout(() => setAdminFeedback(''), 5000);
    }
  };

  const handleSaveTiers = () => {
    const res = updateSubscriptionTiers(tiersList);
    setIsEditingTiers(false);
    if (res.success) {
      setAdminFeedback(res.message);
      setTimeout(() => setAdminFeedback(''), 5000);
    }
  };

  const handleTierFieldChange = (index: number, field: keyof SubscriptionTier, value: any) => {
    const updated = [...tiersList];
    updated[index] = { ...updated[index], [field]: value };
    setTiersList(updated);
  };

  const handleAddCustomTier = () => {
    const newTier: SubscriptionTier = {
      id: `Tier-${Date.now()}`,
      name: 'Custom Syndicate Tier',
      monthlyFeeKsh: 3500,
      memberLimitText: 'Up to 100 members',
      maxMembers: 100,
      description: 'Dedicated cloud container and priority support for investment syndicates',
    };
    setTiersList([...tiersList, newTier]);
  };

  const handleRemoveTier = (index: number) => {
    if (tiersList.length <= 1) {
      alert('Must retain at least one subscription tier.');
      return;
    }
    const updated = tiersList.filter((_, i) => i !== index);
    setTiersList(updated);
  };

  const pendingApps = registrationApplications.filter(a => a.status === 'pending_approval');
  const reviewedApps = registrationApplications.filter(a => a.status !== 'pending_approval');

  const handleApproveApp = (appId: string) => {
    const res = reviewRegistrationApplication(appId, 'approve');
    if (res.success) {
      setAdminFeedback(res.message);
      setTimeout(() => setAdminFeedback(''), 5000);
    }
  };

  const handleRejectApp = (appId: string) => {
    const reason = prompt('Please enter rejection reason for applicant records:');
    if (reason !== null) {
      const res = reviewRegistrationApplication(appId, 'reject', reason);
      if (res.success) {
        setAdminFeedback(res.message);
        setTimeout(() => setAdminFeedback(''), 5000);
      }
    }
  };

  // Quick Status Toggles
  const handleQuickSuspend = (chama: Chama) => {
    const reason = prompt(`Enter suspension note for "${chama.name}" (shown to members on login):`, 'Pending subscription fee settlement via System Till');
    if (reason !== null) {
      const res = setChamaStatus(chama.id, 'suspended', reason.trim());
      setAdminFeedback(res.message);
      setTimeout(() => setAdminFeedback(''), 5000);
    }
  };

  const handleQuickReactivate = (chama: Chama) => {
    const res = setChamaStatus(chama.id, 'active');
    setAdminFeedback(res.message);
    setTimeout(() => setAdminFeedback(''), 5000);
  };

  const handleQuickDelete = (chama: Chama) => {
    if (confirm(`Permanently remove and purge Chama "${chama.name}" and all its records from the database? This action is irreversible.`)) {
      const res = deleteChama(chama.id);
      setAdminFeedback(res.message);
      setTimeout(() => setAdminFeedback(''), 5000);
    }
  };

  // Platform Metrics
  const totalChamasCount = allChamas.length;
  const activeTenantsCount = allChamas.filter(c => (c.status || 'active') === 'active').length;
  const suspendedTenantsCount = allChamas.filter(c => c.status === 'suspended').length;
  const totalCapitalUnderManagement = allChamas.reduce(
    (sum, c) => sum + c.funds.reduce((s, f) => s + f.balance, 0),
    0
  );
  const monthlySaaSRecurringRevenue = allChamas.reduce(
    (sum, c) => sum + (c.monthlySubscriptionKsh || 0),
    0
  );
  const totalDebtPending = allChamas.reduce(
    (sum, c) => sum + (c.debtPending || 0),
    0
  );
  const totalCashReceived = allChamas.reduce(
    (sum, c) => sum + (c.cashReceived || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* SaaS Admin Banner in Pink & Gold */}
      <div className="bg-gradient-to-r from-[#170614] via-[#240c21] to-[#2b1208] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PLATFORM SUPER ADMIN
              </span>
              <span className="text-xs text-rose-200/70">ChamaSmart Multi-Tenant Cloud</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Enterprise Chama SaaS Operations
            </h1>
            <p className="text-xs text-rose-100/80 max-w-xl leading-relaxed">
              Full administrative rights to configure workspaces, manage tenant lifecycles (active, suspended, deactivated), adjust commercial subscription tiers, and push billing invoices to tenant chairmen via System Till.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsNewChamaOpen(true)}
              className="py-3 px-5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/60 border border-amber-300/40 flex items-center gap-2 transition cursor-pointer self-start md:self-auto shrink-0"
            >
              <Plus className="w-4 h-4 text-amber-200" />
              <span>Direct Onboard Chama</span>
            </button>
          </div>
        </div>

        {/* Global Key Metrics in Pink & Gold - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t border-amber-500/20">
          <div className="p-2 sm:p-0">
            <span className="text-[11px] text-rose-200/70 block">Active Workspaces</span>
            <span className="text-lg sm:text-2xl font-black font-mono-num text-white">
              {activeTenantsCount} <span className="text-xs font-normal text-rose-300/70">/ {totalChamasCount}</span>
            </span>
            <span className="text-[10px] text-emerald-300 block font-medium">
              {suspendedTenantsCount > 0 ? `${suspendedTenantsCount} Suspended` : 'All Active'}
            </span>
          </div>

          <div className="p-2 sm:p-0">
            <span className="text-[11px] text-rose-200/70 block">Pending Approvals</span>
            <span className="text-lg sm:text-2xl font-black font-mono-num text-amber-300">
              {pendingApps.length} <span className="text-xs font-normal text-amber-200/70">Queue</span>
            </span>
            <span className="text-[10px] text-rose-300 block font-medium">Public Submissions</span>
          </div>

          <div className="p-2 sm:p-0">
            <span className="text-[11px] text-rose-200/70 block">Capital Under Mgmt</span>
            <span className="text-lg sm:text-2xl font-black font-mono-num text-amber-300">
              KSh {totalCapitalUnderManagement.toLocaleString()}
            </span>
            <span className="text-[10px] text-rose-200/70 block font-medium">Pooled liquid reserves</span>
          </div>

          <div className="p-2 sm:p-0">
            <span className="text-[11px] text-rose-200/70 block">Monthly SaaS MRR</span>
            <span className="text-lg sm:text-2xl font-black font-mono-num text-amber-400">
              KSh {monthlySaaSRecurringRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-200/70 block font-medium">Projected monthly fee</span>
          </div>

          <div className="p-2 sm:p-0">
            <span className="text-[11px] text-rose-200/70 block">Total Cash Collected</span>
            <span className="text-lg sm:text-2xl font-black font-mono-num text-emerald-300">
              KSh {totalCashReceived.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-200/70 block font-medium">Cash received to date</span>
          </div>

          <div className="p-2 sm:p-0">
            <span className="text-[11px] text-rose-200/70 block">Debt Pending (Due)</span>
            <span className="text-lg sm:text-2xl font-black font-mono-num text-rose-400">
              KSh {totalDebtPending.toLocaleString()}
            </span>
            <span className="text-[10px] text-rose-200/70 block font-medium">Outstanding platform fees</span>
          </div>
        </div>

        {/* Super Admin Desk Tabs - Responsive & Non-Overlapping */}
        <div className="flex gap-2 overflow-x-auto pt-4 border-t border-amber-500/20 mt-6 no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setAdminTab('applications')}
            className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition cursor-pointer ${
              adminTab === 'applications'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'bg-rose-950/40 text-rose-200 hover:bg-rose-900/60 border border-amber-500/20'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="shrink-0">Registration Queue ({pendingApps.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('tenants')}
            className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition cursor-pointer ${
              adminTab === 'tenants'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'bg-rose-950/40 text-rose-200 hover:bg-rose-900/60 border border-amber-500/20'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="shrink-0">Tenants & Billing ({allChamas.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('tiers')}
            className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition cursor-pointer ${
              adminTab === 'tiers'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'bg-rose-950/40 text-rose-200 hover:bg-rose-900/60 border border-amber-500/20'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 shrink-0" />
            <span className="shrink-0">System Till & SaaS Tiers</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('accounts')}
            className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition cursor-pointer ${
              adminTab === 'accounts'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'bg-rose-950/40 text-rose-200 hover:bg-rose-900/60 border border-amber-500/20'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="shrink-0">Users & Categories</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('database')}
            className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition cursor-pointer ${
              adminTab === 'database'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'bg-rose-950/40 text-rose-200 hover:bg-rose-900/60 border border-amber-500/20'
            }`}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span className="shrink-0">Database & SQL Dumps</span>
          </button>
        </div>
      </div>

      {adminFeedback && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{adminFeedback}</span>
        </div>
      )}

      {adminTab === 'accounts' && <UserAccountManager />}

      {/* TAB: PUBLIC REGISTRATION APPLICATIONS */}
      {adminTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Public Chama Registration Queue</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {pendingApps.length} Awaiting Authorization
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                On Super Admin approval: the system provisions a dedicated tenant, assigns the founding Chairperson as Chama Admin, and unlocks member onboarding.
              </p>
            </div>
          </div>

          {/* Pending Applications List */}
          {pendingApps.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">All Registration Applications Cleared</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No groups are currently waiting in the approval queue. Public submissions from the homepage will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApps.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/20 hover:border-amber-400 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-base">{app.chamaName}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          {app.category.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                          Plan: {app.planTier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{app.tagline}"</p>
                      <p className="text-xs text-slate-500">
                        Location: <strong className="text-slate-800">{app.county}, {app.country}</strong> • Submitted: <span className="font-mono">{app.submittedAt}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRejectApp(app.id)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveApp(app.id)}
                        className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md border border-emerald-400/40 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-emerald-100" />
                        <span>Approve & Provision Tenant</span>
                      </button>
                    </div>
                  </div>

                  {/* Applicant Chairperson profile box */}
                  <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-400/30 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                        {app.applicantChairpersonName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{app.applicantChairpersonName}</span>
                          <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-1.5 py-0.2 rounded">
                            Designated Chairperson & Chama Admin
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Phone: <span className="font-mono font-bold text-slate-700">{app.applicantPhone}</span> • Email: {app.applicantEmail}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 font-mono">
                      Target Roster: <strong>{app.initialMemberCount} Initial Members</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Historical Reviewed Applications */}
          {reviewedApps.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
                Processed Applications Archive
              </h4>
              <div className="space-y-2">
                {reviewedApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{app.chamaName}</span>
                      <span className="text-slate-500 ml-2">({app.applicantChairpersonName} • {app.county})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          app.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {app.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{app.reviewedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: ACTIVE TENANTS & BILLING WORKSPACES */}
      {adminTab === 'tenants' && (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-base">Provisioned Chama Workspaces & Billing Controls</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                {allChamas.length} Tenants Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin has full rights to edit workspace details, suspend or deactivate accounts, adjust subscription fees, push bills to chairmen, and reconcile cash received.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNewChamaOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Onboard New Tenant</span>
            </button>
          </div>
        </div>

        {/* Tenant Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allChamas.map((c) => {
            const isCurrent = c.id === activeChama.id;
            const chamaCapital = c.funds.reduce((s, f) => s + f.balance, 0);
            const chairPerson = c.members.find(m => m.role === 'chairperson') || c.members[0];
            const tenantStatus = c.status || 'active';
            const hasPendingDebt = (c.debtPending || 0) > 0;

            return (
              <div
                key={c.id}
                className={`p-5 rounded-2xl border-2 transition flex flex-col justify-between shadow-xs ${
                  tenantStatus === 'suspended'
                    ? 'border-amber-300 bg-amber-50/30'
                    : tenantStatus === 'deactivated'
                    ? 'border-rose-300 bg-rose-50/30'
                    : isCurrent
                    ? 'border-amber-400 ring-2 ring-amber-400/20 bg-rose-50/20'
                    : 'border-slate-200 bg-white hover:border-amber-300'
                }`}
              >
                <div>
                  {/* Top Header Badges */}
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {c.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                        {c.planTier} (KSh {c.monthlySubscriptionKsh}/mo)
                      </span>
                    </div>

                    {/* Status Pill */}
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      tenantStatus === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : tenantStatus === 'suspended'
                        ? 'bg-amber-100 text-amber-900 border border-amber-400 animate-pulse'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {tenantStatus}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-base leading-snug">{c.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{c.county}, {c.country || 'Kenya'}</p>
                  <p className="text-[11px] text-slate-400 italic font-mono">Reg: {c.registrationNumber || 'Unregistered'}</p>

                  {/* Suspension Note if suspended */}
                  {tenantStatus !== 'active' && c.statusReason && (
                    <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block">{tenantStatus.toUpperCase()} Hold:</strong>
                        <span>{c.statusReason}</span>
                      </div>
                    </div>
                  )}

                  {/* Governance Snapshot */}
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Chair (Admin):</span>
                      <strong className="text-slate-800">{chairPerson?.name || 'Unassigned'}</strong>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>Chair Phone:</span>
                      <span>{chairPerson?.phoneNumber || 'No phone'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Pooled Capital:</span>
                      <strong className="text-amber-700 font-mono">KSh {chamaCapital.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Tenant Billing Box */}
                  <div className="mt-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-bold flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-amber-700" />
                        <span>System Till:</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {c.systemTillNumber || systemTillNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/60 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Debt Pending:</span>
                        <strong className={`font-mono font-bold text-xs ${hasPendingDebt ? 'text-rose-700' : 'text-emerald-700'}`}>
                          KSh {(c.debtPending || 0).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Cash Received:</span>
                        <strong className="font-mono font-bold text-xs text-emerald-800">
                          KSh {(c.cashReceived || 0).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    {c.reminderNote && (
                      <div className="pt-1.5 border-t border-amber-200/60 text-[10px] text-amber-900 leading-snug">
                        <span className="font-bold flex items-center gap-1">
                          <BellRing className="w-2.5 h-2.5 text-amber-700" />
                          <span>Tenant Note:</span>
                        </span>
                        <span className="italic line-clamp-2">"{c.reminderNote}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Super Admin Control Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingChama(c)}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Edit all chama parameters, plan, details and notes"
                    >
                      <Edit className="w-3 h-3 text-slate-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPushBillChama(c)}
                      className="py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Push subscription bill to Chairman"
                    >
                      <Send className="w-3 h-3 text-amber-700" />
                      <span>Bill</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecordPayChama(c)}
                      className="py-1.5 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Record subscription cash received & reconcile debt"
                    >
                      <Receipt className="w-3 h-3 text-emerald-700" />
                      <span>Cash</span>
                    </button>
                  </div>

                  {/* Lifecycle Buttons: Suspend / Reactivate / Delete */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                    {tenantStatus === 'active' ? (
                      <button
                        type="button"
                        onClick={() => handleQuickSuspend(c)}
                        className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer text-[10px]"
                      >
                        <Power className="w-3 h-3 text-amber-600" />
                        <span>Suspend</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleQuickReactivate(c)}
                        className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer text-[10px]"
                      >
                        <Power className="w-3 h-3 text-emerald-600" />
                        <span>Reactivate</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleQuickDelete(c)}
                      className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer text-[10px]"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>Remove</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveChamaId(c.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{isCurrent ? 'Current' : 'Switch'}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* TAB: COMMERCIAL SAAS TIERS & SYSTEM TILL CONTROL */}
      {adminTab === 'tiers' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          
          {/* SYSTEM TILL ACCOUNT CONFIGURATION CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-700" />
                  <h3 className="font-black text-slate-900 text-base">Platform System Till Account Number</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                    Safaricom Daraja / M-Pesa Till
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  This account is embedded into all subscription invoices pushed to tenant chamas. Chairman and treasurers pay monthly SaaS platform fees to this destination.
                </p>
              </div>

              {/* Form to update system till */}
              <form onSubmit={handleSaveSystemTill} className="flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  required
                  placeholder="e.g. 589214 or Till: 498201"
                  value={editTillInput}
                  onChange={(e) => setEditTillInput(e.target.value)}
                  className="px-3 py-2 bg-white border-2 border-amber-400 rounded-xl text-xs font-mono font-bold text-slate-900 w-44 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isSavingTill}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-sm border border-amber-300 transition cursor-pointer"
                >
                  {isSavingTill ? 'Saving...' : 'Update Till'}
                </button>
              </form>
            </div>

            {/* Global Billing Aggregates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-amber-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-amber-200/80">
                <span className="text-[11px] text-slate-500 block">Total SaaS Cash Collected</span>
                <span className="text-lg font-black font-mono-num text-emerald-700">
                  KSh {totalCashReceived.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block">From all active tenants</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200/80">
                <span className="text-[11px] text-slate-500 block">Total Outstanding Debt Pending</span>
                <span className="text-lg font-black font-mono-num text-rose-700">
                  KSh {totalDebtPending.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block">Awaiting payment via System Till</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200/80">
                <span className="text-[11px] text-slate-500 block">Current Active System Till</span>
                <span className="text-lg font-black font-mono font-bold text-slate-900">
                  {systemTillNumber}
                </span>
                <span className="text-[10px] text-slate-400 block">System-wide default</span>
              </div>
            </div>
          </div>

          {/* SUBSCRIPTION TIERS ADJUSTER & EDITOR */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">Commercial Subscription Tiers Editor</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Super Admin has full rights to edit and adjust tier pricing, member limits, descriptions, or add new commercial tiers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isEditingTiers ? (
                  <>
                    <button
                      type="button"
                      onClick={handleAddCustomTier}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      + Add Custom Tier
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTiersList(subscriptionTiers);
                        setIsEditingTiers(false);
                      }}
                      className="px-3 py-1.5 text-slate-500 hover:text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveTiers}
                      className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Tiers Adjustments</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingTiers(true)}
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Subscription Tiers</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tiers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {tiersList.map((tier, index) => (
                <div
                  key={tier.id}
                  className={`p-4 rounded-2xl border-2 transition flex flex-col justify-between ${
                    isEditingTiers
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-3">
                    {isEditingTiers ? (
                      <>
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(e) => handleTierFieldChange(index, 'name', e.target.value)}
                            className="text-xs font-black p-1.5 bg-white border border-slate-300 rounded-lg w-full text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(index)}
                            className="text-rose-500 hover:text-rose-700 ml-1 text-xs"
                            title="Remove tier"
                          >
                            ✕
                          </button>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Monthly Fee (KSh)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={tier.monthlyFeeKsh}
                            onChange={(e) => handleTierFieldChange(index, 'monthlyFeeKsh', Number(e.target.value))}
                            className="text-xs font-mono font-bold p-1.5 bg-white border border-slate-300 rounded-lg w-full text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Member Limit Label
                          </label>
                          <input
                            type="text"
                            value={tier.memberLimitText}
                            onChange={(e) => handleTierFieldChange(index, 'memberLimitText', e.target.value)}
                            className="text-[11px] p-1.5 bg-white border border-slate-300 rounded-lg w-full text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={tier.description}
                            onChange={(e) => handleTierFieldChange(index, 'description', e.target.value)}
                            className="text-[10px] p-1.5 bg-white border border-slate-300 rounded-lg w-full text-slate-900"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-black text-slate-900 text-sm block">{tier.name}</span>
                          <span className="text-[11px] text-slate-500 block font-medium">{tier.memberLimitText}</span>
                          <div className="text-base font-black text-amber-700 font-mono-num mt-2">
                            {tier.monthlyFeeKsh === 0 ? 'Free' : `KSh ${tier.monthlyFeeKsh.toLocaleString()}/- mo`}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-200 leading-snug">
                          {tier.description}
                        </p>
                      </>
                    )}
                  </div>

                  {!isEditingTiers && (
                    <div className="pt-3 border-t border-slate-200 mt-3 text-[10px] text-slate-400">
                      <span>Assigned to {allChamas.filter(c => c.planTier === tier.id || c.planTier === tier.name).length} Chamas</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: DATABASE STORAGE & SQL DUMPS */}
      {adminTab === 'database' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Relational Database Engine & SQL Dumps</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Active & Synchronized
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every data storage and access operation is strictly routed through the relational SQL database. Automatic ANSI SQL dumps are generated and stored in <span className="font-mono font-bold text-slate-800">export_sql_dump/</span>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchDumpFiles}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                <span>Refresh Files</span>
              </button>

              <button
                type="button"
                onClick={handleExportDump}
                disabled={isExporting}
                className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md border border-amber-300 flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
              >
                <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                <span>{isExporting ? 'Generating Dump...' : 'Export SQL Dump Now'}</span>
              </button>
            </div>
          </div>

          {/* Database Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Database Storage File</span>
              <span className="font-mono text-xs font-bold text-slate-900 block mt-1">database/chamasmart.db</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Relational SQLite (WAL Mode & Foreign Keys ON)</span>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">Export Dump Folder</span>
              <span className="font-mono text-xs font-bold text-slate-900 block mt-1">export_sql_dump/</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Full ANSI SQL schemas & table insert statements</span>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">Relational Tables</span>
              <span className="font-mono text-lg font-black text-slate-900 block mt-0.5">6 Tables</span>
              <span className="text-[11px] text-slate-500 mt-1 block">chamas, members, apps, txs, audit_logs, system_settings</span>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Sync Status</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-xs text-emerald-900">Authoritative Server DB</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Immediate live database writes</span>
            </div>
          </div>

          {/* Export SQL Dump Files in export_sql_dump/ Folder */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FolderDown className="w-3.5 h-3.5 text-amber-600" />
                <span>Available SQL Dumps in export_sql_dump/ Folder ({dumpFiles.length})</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Stored in workspace folder <span className="font-mono font-bold text-slate-700">/export_sql_dump/</span>
              </span>
            </div>

            {dumpFiles.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                Click "Export SQL Dump Now" above to generate the first dump into <span className="font-mono text-slate-800">export_sql_dump/</span>.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {dumpFiles.map((file) => (
                    <div key={file.filename} className="p-3.5 bg-white hover:bg-slate-50/80 transition flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-mono font-bold text-slate-900">{file.filename}</span>
                          {file.filename.includes('latest') && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              LATEST
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Size: <span className="font-mono font-semibold">{(file.sizeBytes / 1024).toFixed(1)} KB</span> • Modified: <span className="font-mono">{new Date(file.modified).toLocaleString()}</span>
                        </div>
                      </div>

                      <a
                        href="/api/db/export-sql-dump"
                        download={file.filename}
                        className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-lg flex items-center gap-1 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Regulatory & Tenant Isolation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-3">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-slate-900 text-sm">Tenant Isolation Guarantee</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Rule #1 of ChamaSmart:</strong> Chama A must never access Chama B's financial data. 
            Row-Level Security (RLS) and schema partition enforce complete boundary protection. 
            Super admins maintain technical health and subscription billing but cannot access individual member balances without court or governance warrant.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-3">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">Kenya CBK & Legal Compliance</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The platform distinguishes between ordinary community table-banking chamas, registered self-help groups, and regulated Digital Credit Providers (CBK Regulations 2022). 
            ChamaSmart provides recording and reconciliation software — groups retain full custody of their own cooperative bank accounts and Safaricom Till numbers.
          </p>
        </div>
      </div>

      {/* MODALS */}
      <NewChamaModal
        isOpen={isNewChamaOpen}
        onClose={() => setIsNewChamaOpen(false)}
      />

      <SuperAdminEditChamaModal
        chama={editingChama}
        isOpen={!!editingChama}
        onClose={() => setEditingChama(null)}
        onSave={(chamaId, updates) => {
          const res = editChama(chamaId, updates);
          setAdminFeedback(res.message);
          setTimeout(() => setAdminFeedback(''), 5000);
        }}
        onDelete={(chamaId) => {
          const res = deleteChama(chamaId);
          setAdminFeedback(res.message);
          setTimeout(() => setAdminFeedback(''), 5000);
        }}
      />

      <PushSubscriptionBillModal
        chama={pushBillChama}
        isOpen={!!pushBillChama}
        onClose={() => setPushBillChama(null)}
        onSuccess={(msg) => {
          setAdminFeedback(msg);
          setTimeout(() => setAdminFeedback(''), 6000);
        }}
      />

      <SuperAdminRecordPaymentModal
        chama={recordPayChama}
        isOpen={!!recordPayChama}
        onClose={() => setRecordPayChama(null)}
        onSuccess={(msg) => {
          setAdminFeedback(msg);
          setTimeout(() => setAdminFeedback(''), 6000);
        }}
      />
    </div>
  );
};
