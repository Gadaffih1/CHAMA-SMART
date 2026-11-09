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
  HardDrive
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { NewChamaModal } from '../modules/NewChamaModal';
import { SqlDumpModal } from '../common/SqlDumpModal';

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
    isDbSyncing
  } = useChama();

  const [isNewChamaOpen, setIsNewChamaOpen] = useState(false);
  const [isSqlDumpModalOpen, setIsSqlDumpModalOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'applications' | 'tenants' | 'tiers' | 'database'>('applications');
  const [adminFeedback, setAdminFeedback] = useState<string>('');
  const [dumpFiles, setDumpFiles] = useState<DumpFileInfo[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

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

  // Platform Metrics
  const totalChamasCount = allChamas.length;
  const totalMembersEnrolled = allChamas.reduce((sum, c) => sum + c.members.length, 0);
  const totalCapitalUnderManagement = allChamas.reduce(
    (sum, c) => sum + c.funds.reduce((s, f) => s + f.balance, 0),
    0
  );
  const monthlySaaSRecurringRevenue = allChamas.reduce(
    (sum, c) => sum + (c.monthlySubscriptionKsh || 0),
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
              Managing independent chama digital offices across Kenya and East Africa. 
              Reviewing public group registrations, provisioning tenant environments, and enforcing cryptographic data isolation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSqlDumpModalOpen(true)}
              className="py-3 px-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950/40 border border-amber-300 flex items-center gap-2 transition cursor-pointer self-start md:self-auto shrink-0"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download SQL Dump</span>
            </button>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 sm:mt-8 pt-6 border-t border-amber-500/20">
          <div className="p-2 sm:p-0">
            <span className="text-xs text-rose-200/70 block">Active Chama Tenants</span>
            <span className="text-xl sm:text-2xl font-black font-mono-num text-white">
              {totalChamasCount} <span className="text-xs font-normal text-rose-300/70">Chamas</span>
            </span>
            <span className="text-[11px] text-amber-300 block font-medium">100% System Uptime</span>
          </div>

          <div className="p-2 sm:p-0">
            <span className="text-xs text-rose-200/70 block">Pending Approvals</span>
            <span className="text-xl sm:text-2xl font-black font-mono-num text-amber-300">
              {pendingApps.length} <span className="text-xs font-normal text-amber-200/70">Queue</span>
            </span>
            <span className="text-[11px] text-rose-300 block font-medium">Public Registrations</span>
          </div>

          <div className="p-2 sm:p-0">
            <span className="text-xs text-rose-200/70 block">Capital Under Management</span>
            <span className="text-xl sm:text-2xl font-black font-mono-num text-amber-300">
              KSh {totalCapitalUnderManagement.toLocaleString()}
            </span>
            <span className="text-[11px] text-rose-200/70 block font-medium">Pooled liquid reserves</span>
          </div>

          <div className="p-2 sm:p-0">
            <span className="text-xs text-rose-200/70 block">Monthly SaaS MRR</span>
            <span className="text-xl sm:text-2xl font-black font-mono-num text-amber-400">
              KSh {monthlySaaSRecurringRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] text-amber-200/70 block font-medium">Recurring subscription fees</span>
          </div>
        </div>

        {/* Super Admin Desk Tabs */}
        <div className="flex gap-2 overflow-x-auto pt-4 border-t border-amber-500/20 mt-6 no-scrollbar">
          <button
            type="button"
            onClick={() => setAdminTab('applications')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              adminTab === 'applications'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'bg-rose-950/40 text-rose-200 hover:bg-rose-900/60 border border-amber-500/20'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Public Registration Approvals ({pendingApps.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('tenants')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              adminTab === 'tenants'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'bg-rose-950/40 text-rose-200 hover:bg-rose-900/60 border border-amber-500/20'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Active Workspaces ({allChamas.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('tiers')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              adminTab === 'tiers'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'bg-rose-950/40 text-rose-200 hover:bg-rose-900/60 border border-amber-500/20'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Commercial SaaS Tiers</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('database')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              adminTab === 'database'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'bg-rose-950/40 text-rose-200 hover:bg-rose-900/60 border border-amber-500/20'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database & SQL Dumps</span>
          </button>
        </div>
      </div>

      {adminFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{adminFeedback}</span>
        </div>
      )}

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

      {/* TAB: ACTIVE TENANTS */}
      {adminTab === 'tenants' && (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Provisioned Chama Workspaces</h3>
            <p className="text-xs text-slate-500">
              Each organization operates in strict isolation with separate databases, ledgers, and encryption keys
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allChamas.map((c) => {
            const isCurrent = c.id === activeChama.id;
            const chamaCapital = c.funds.reduce((s, f) => s + f.balance, 0);
            const chairPerson = c.members.find(m => m.role === 'chairperson');
            const secretary = c.members.find(m => m.role === 'secretary');
            const treasurer = c.members.find(m => m.role === 'treasurer');

            return (
              <div
                key={c.id}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                  isCurrent
                    ? 'border-amber-400 ring-2 ring-amber-400/20 bg-rose-50/20'
                    : 'border-rose-100 bg-white hover:border-amber-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {c.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                      Tier: {c.planTier}
                    </span>
                  </div>

                  <h4 className="font-bold text-rose-950 text-base leading-snug">{c.name}</h4>
                  <p className="text-xs text-amber-800/70 mt-1">{c.county}, {c.country}</p>
                  <p className="text-[11px] text-rose-400 italic mt-1 font-mono">Reg: {c.registrationNumber}</p>

                  {/* Governance Snapshot */}
                  <div className="mt-3 p-2 bg-rose-50/40 rounded-xl border border-rose-100 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Chair (Admin):</span>
                      <strong className="text-slate-800">{chairPerson?.name || 'Unassigned'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Secretary:</span>
                      <strong className="text-slate-800">{secretary?.name || 'Not yet appointed'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Treasurer:</span>
                      <strong className="text-slate-800">{treasurer?.name || 'Not yet appointed'}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-rose-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Members</span>
                      <span className="font-bold text-slate-800 font-mono-num">{c.members.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Pooled Capital</span>
                      <span className="font-extrabold text-amber-700 font-mono-num text-[11px]">
                        KSh {chamaCapital.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-rose-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-rose-950">
                    KSh {c.monthlySubscriptionKsh}/mo
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveChamaId(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-xs'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200'
                    }`}
                  >
                    <span>{isCurrent ? 'Active Workspace' : 'Switch Workspace'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* TAB: COMMERCIAL SAAS TIERS */}
      {adminTab === 'tiers' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <h3 className="font-bold text-slate-900 text-base mb-1">Commercial SaaS Subscription Tiers</h3>
          <p className="text-xs text-slate-500 mb-6">
            Predictable flat-fee pricing model for Kenyan self-help groups, SACCOs, and investment syndicates
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: 'Starter', limit: 'Free (Individual / Family)', price: 'Free', color: 'slate', desc: 'Free tier for small community circles' },
              { name: 'Basic', limit: 'Up to 10 Members', price: 'KSh 500 / mo', color: 'blue', desc: '500/- per month for small groups & table banking' },
              { name: 'Growth', limit: 'Up to 30 Members', price: 'KSh 1,500 / mo', color: 'emerald', desc: '1,500/- per month for active revolving lending' },
              { name: 'Professional', limit: 'Up to 50 Members', price: 'KSh 2,500 / mo', color: 'violet', desc: '2,500/- per month for syndicates & asset clubs' },
              { name: 'Enterprise', limit: 'Over 50 Members', price: 'Custom Quote', color: 'amber', desc: 'Custom quote for full SACCO compliance & multi-branch' },
            ].map((tier) => (
              <div key={tier.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{tier.name}</span>
                  <span className="text-[11px] text-slate-500 block">{tier.limit}</span>
                  <div className="text-base font-black text-slate-900 font-mono-num mt-2">
                    {tier.price}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200">
                  {tier.desc}
                </p>
              </div>
            ))}
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
              <span className="font-mono text-lg font-black text-slate-900 block mt-0.5">5 Tables</span>
              <span className="text-[11px] text-slate-500 mt-1 block">chamas, members, apps, txs, audit_logs</span>
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

          {/* Database Tables & Record Statistics */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Relational Tables Live Record Counters
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">TABLE chamas</span>
                <span className="text-lg font-black text-slate-900 font-mono-num">{allChamas.length}</span>
                <span className="text-[10px] text-slate-400 block">Tenants & workspaces</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">TABLE members</span>
                <span className="text-lg font-black text-slate-900 font-mono-num">
                  {allChamas.reduce((sum, c) => sum + c.members.length, 0)}
                </span>
                <span className="text-[10px] text-slate-400 block">Enrolled member accounts</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">TABLE registration_applications</span>
                <span className="text-lg font-black text-slate-900 font-mono-num">
                  {registrationApplications.length}
                </span>
                <span className="text-[10px] text-slate-400 block">Public group submissions</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">TABLE transactions</span>
                <span className="text-lg font-black text-slate-900 font-mono-num">
                  {allChamas.reduce((sum, c) => sum + c.transactions.length, 0)}
                </span>
                <span className="text-[10px] text-slate-400 block">M-Pesa & ledger events</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">TABLE audit_logs</span>
                <span className="text-lg font-black text-slate-900 font-mono-num">
                  {allChamas.reduce((sum, c) => sum + c.auditLogs.length, 0)}
                </span>
                <span className="text-[10px] text-slate-400 block">Governance immutable audit</span>
              </div>
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

          {/* Sample ANSI SQL Script Preview */}
          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              SQL Dump Schema & Structure Preview
            </h4>
            <div className="p-4 bg-slate-900 text-amber-300 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
              <pre>{`-- ChamaSmart Enterprise SQL Database Dump Sample
-- Engine: Relational SQLite / PostgreSQL / MySQL Compatible DDL
CREATE TABLE IF NOT EXISTS chamas (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  plan_tier VARCHAR(64) NOT NULL,
  monthly_subscription_ksh NUMERIC(12,2) NOT NULL DEFAULT 500,
  raw_data TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
  id VARCHAR(64) PRIMARY KEY,
  chama_id VARCHAR(64) NOT NULL REFERENCES chamas(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(32) NOT NULL,
  membership_number VARCHAR(64) NOT NULL,
  role VARCHAR(64) NOT NULL DEFAULT 'member',
  total_savings NUMERIC(14,2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS registration_applications (
  id VARCHAR(64) PRIMARY KEY,
  chama_name VARCHAR(255) NOT NULL,
  applicant_chairperson_name VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending_approval'
);`}</pre>
            </div>
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

      {/* New Chama Modal */}
      <NewChamaModal
        isOpen={isNewChamaOpen}
        onClose={() => setIsNewChamaOpen(false)}
      />

      {/* SQL Dump Modal */}
      <SqlDumpModal
        isOpen={isSqlDumpModalOpen}
        onClose={() => setIsSqlDumpModalOpen(false)}
      />
    </div>
  );
};
