/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Chama, 
  Member, 
  Loan, 
  Transaction, 
  PendingWithdrawal, 
  Role, 
  PortalType, 
  FundType, 
  Meeting,
  MeetingAttendance,
  InvestmentAsset,
  PaymentMethod,
  InterestMethod,
  ChamaRegistrationApplication,
  DEFAULT_CHAMA_CATEGORIES,
  SubscriptionTier,
  DEFAULT_SUBSCRIPTION_TIERS,
  SubscriptionBill
} from '../types';
import { INITIAL_CHAMAS } from '../data/initialData';

interface ChamaContextType {
  allChamas: Chama[];
  activeChama: Chama;
  activePortal: PortalType;
  currentMember: Member;
  currentUser: Member | null;
  isAuthenticated: boolean;
  isSuperAdminLoggedIn: boolean;
  isDbSyncing: boolean;
  dbSyncError: string | null;
  retryDbSync: () => void;
  userChamas: Chama[];
  currentOfficialRole: Role;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setActiveChamaId: (id: string) => void;
  setActivePortal: (portal: PortalType) => void;
  setCurrentMemberId: (id: string) => void;
  setCurrentOfficialRole: (role: Role) => void;
  
  // Auth methods
  loginMember: (identifier: string, pin?: string) => Promise<{ success: boolean; message: string }>;
  loginSuperAdmin: (securityPin: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  
  // Registration Applications & Governance
  registrationApplications: ChamaRegistrationApplication[];
  categoryOptions: string[];
  addCategory: (category: string) => Promise<{ success: boolean; message: string }>;
  renameCategory: (oldCategory: string, newCategory: string) => Promise<{ success: boolean; message: string }>;
  removeCategory: (category: string, replacementCategory?: string) => Promise<{ success: boolean; message: string }>;
  submitRegistrationApplication: (data: Omit<ChamaRegistrationApplication, 'id' | 'status' | 'submittedAt'>) => { success: boolean; applicationId: string; message: string };
  reviewRegistrationApplication: (applicationId: string, action: 'approve' | 'reject', reason?: string) => { success: boolean; newChamaId?: string; message: string };
  assignMemberRole: (memberId: string, newRole: Role) => { success: boolean; message: string };
  
  // Actions
  createChama: (chama: Partial<Chama> & {
    chairpersonName?: string;
    chairpersonPhone?: string;
    chairpersonEmail?: string;
    chairpersonPassword?: string;
  }) => void;
  processMpesaPayment: (params: {
    amount: number;
    phone: string;
    description: string;
    type: 'contribution' | 'loan_repayment';
    memberId: string;
    loanId?: string;
    allocations?: { fundType: FundType; amount: number }[];
  }) => Promise<{ success: boolean; receiptNumber: string; message: string }>;
  
  applyForLoan: (params: {
    borrowerId: string;
    productId: string;
    principal: number;
    durationWeeks: number;
    interestRate: number;
    interestMethod: InterestMethod;
    purpose: string;
    guarantorIds: string[];
  }) => void;
  
  respondGuarantor: (loanId: string, memberId: string, accept: boolean) => void;
  approveLoanByRole: (loanId: string, role: 'chairperson' | 'treasurer' | 'loan_officer') => void;
  disburseLoan: (loanId: string) => void;
  
  initiateWithdrawal: (params: {
    amount: number;
    fundType: FundType;
    purpose: string;
    recipientName: string;
    recipientPhone: string;
  }) => void;
  
  approveWithdrawal: (withdrawalId: string, approved: boolean) => void;
  
  transferFunds: (fromFund: FundType, toFund: FundType, amount: number, reason: string) => void;
  
  advanceMerryGoRound: (mgrId: string) => void;
  
  saveMeetingAttendance: (meetingId: string, attendance: MeetingAttendance[]) => void;
  saveMeetingMinutes: (meetingId: string, minutes: string, actionPoints: string[]) => void;
  scheduleMeeting: (params: {
    title: string;
    date: string;
    time: string;
    venue: string;
    isVirtual: boolean;
    virtualLink?: string;
    agendaItems: string[];
  }) => { success: boolean; meetingId: string; message: string };
  updateMeetingStatus: (meetingId: string, status: 'upcoming' | 'in_progress' | 'completed') => void;
  deleteMeeting: (meetingId: string) => { success: boolean; message: string };
  
  castVote: (electionId: string, positionId: string, candidateId: string) => void;
  
  addInvestmentAsset: (asset: Omit<InvestmentAsset, 'id' | 'chamaId'>) => void;
  
  addMember: (memberData: Omit<Member, 'id' | 'chamaId' | 'totalSavings' | 'sharesCount' | 'activeLoanBalance' | 'creditScore' | 'kycVerified' | 'attendanceRate' | 'status' | 'passwordHash'> & { password: string }, chamaId?: string) => Promise<{ success: boolean; message: string }>;
  updateMemberAccount: (memberId: string, changes: Pick<Member, 'name' | 'phoneNumber' | 'email' | 'membershipNumber' | 'role' | 'status' | 'nextOfKin'>) => { success: boolean; message: string };
  deleteMemberAccount: (memberId: string) => { success: boolean; message: string };
  resetMemberPassword: (memberId: string, password: string) => Promise<{ success: boolean; message: string }>;
  
  // Database SQL Dump & Direct Storage
  exportSqlDump: () => Promise<{ success: boolean; dumpSql?: string; filename?: string; message: string }>;
  // Super Admin Full Control Capabilities
  editChama: (chamaId: string, updates: Partial<Chama>) => { success: boolean; message: string };
  deleteChama: (chamaId: string) => { success: boolean; message: string };
  editMember: (chamaId: string, memberId: string, updates: Partial<Member>) => { success: boolean; message: string };
  removeMember: (chamaId: string, memberId: string) => { success: boolean; message: string };
  seedCleanScopedData: () => { success: boolean; message: string };
  adjustSubscriptionTier: (chamaId: string, tier: 'Starter' | 'Basic' | 'Growth' | 'Professional' | 'Enterprise' | string) => { success: boolean; message: string };

  // Tenant Status & Subscription Billing
  subscriptionTiers: SubscriptionTier[];
  updateSubscriptionTiers: (tiers: SubscriptionTier[]) => { success: boolean; message: string };
  systemTillNumber: string;
  setSystemTillNumber: (till: string) => { success: boolean; message: string };
  setChamaStatus: (chamaId: string, status: 'active' | 'suspended' | 'deactivated', reason?: string) => { success: boolean; message: string };
  pushSubscriptionBill: (chamaId: string, bill: { amount: number; billingPeriod: string; dueDate: string; systemTillNumber?: string; reminderNote?: string }) => { success: boolean; message: string; billId: string };
  updateTenantBilling: (chamaId: string, updates: { systemTillNumber?: string; cashReceived?: number; debtPending?: number; reminderNote?: string }) => { success: boolean; message: string };
  recordSubscriptionPayment: (chamaId: string, billId: string | undefined, amount: number, mpesaReceipt: string) => { success: boolean; message: string };

  resetToDefaults: () => void;
}

const ChamaContext = createContext<ChamaContextType | undefined>(undefined);

const CATEGORIES_STORAGE_KEY = 'chamasmart_categories_v1';

const INITIAL_REGISTRATION_APPLICATIONS: ChamaRegistrationApplication[] = [
  {
    id: 'app-101',
    chamaName: 'Kilimani Green Urban Farmers Syndicate',
    category: 'investment',
    tagline: 'High-tech hydroponic vertical farming and green export syndicate',
    county: 'Nairobi City County',
    country: 'Kenya',
    registrationNumber: 'SHG/NRB/2026/8819',
    applicantChairpersonName: 'Eng. Dennis Kibet Kosgei',
    applicantPhone: '+254719882233',
    applicantEmail: 'dennis.kibet@greenurban.ke',
    initialMemberCount: 18,
    planTier: 'Growth',
    status: 'pending_approval',
    submittedAt: '2026-11-08 14:30',
  },
  {
    id: 'app-102',
    chamaName: 'Eldoret Women Grains & Dairy Table Banking',
    category: 'table_banking',
    tagline: 'Empowering North Rift smallholder dairy and maize women traders',
    county: 'Uasin Gishu County',
    country: 'Kenya',
    registrationNumber: 'SHG/UG/2025/3910',
    applicantChairpersonName: 'Janet Jepkemoi Chelagat',
    applicantPhone: '+254728556677',
    applicantEmail: 'janet.chelagat@eldoretwomen.org',
    initialMemberCount: 25,
    planTier: 'Basic',
    status: 'pending_approval',
    submittedAt: '2026-11-09 08:15',
  },
];

export const ChamaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allChamas, setAllChamas] = useState<Chama[]>(INITIAL_CHAMAS);

  const [registrationApplications, setRegistrationApplications] = useState<ChamaRegistrationApplication[]>(INITIAL_REGISTRATION_APPLICATIONS);

  const [categoryOptions, setCategoryOptions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(category => typeof category === 'string')) return parsed;
      }
    } catch {
      // Fall back to the built-in categories.
    }
    return DEFAULT_CHAMA_CATEGORIES;
  });

  const [activeChamaId, setActiveChamaIdState] = useState<string>(() => {
    return allChamas[0]?.id || 'chama-tumaini';
  });

  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [isSuperAdminLoggedIn, setIsSuperAdminLoggedIn] = useState<boolean>(false);
  const [activePortal, setActivePortal] = useState<PortalType>('member');
  const [currentMemberId, setCurrentMemberId] = useState<string>('mem-5'); // Grace Wanjiku default
  const [currentOfficialRole, setCurrentOfficialRole] = useState<Role>('treasurer');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDbSyncing, setIsDbSyncing] = useState<boolean>(false);
  const [dbSyncError, setDbSyncError] = useState<string | null>(null);
  const [syncAttempt, setSyncAttempt] = useState(0);
  const [dbLoaded, setDbLoaded] = useState<boolean>(false);

  // Platform System Till Account Number & Commercial Tiers
  const [systemTillNumber, setSystemTillNumberState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('chamasmart_system_till');
      if (saved) return saved;
    } catch {}
    return '589214';
  });

  const [subscriptionTiers, setSubscriptionTiersState] = useState<SubscriptionTier[]>(() => {
    try {
      const saved = localStorage.getItem('chamasmart_subscription_tiers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SUBSCRIPTION_TIERS;
  });

  const isAuthenticated = currentUser !== null || isSuperAdminLoggedIn;

  const clearSession = () => {
    setDbSyncError(null);
    setCurrentUser(null);
    setIsSuperAdminLoggedIn(false);
    setActivePortal('member');
    setDbLoaded(false);
    setAllChamas(INITIAL_CHAMAS);
    setRegistrationApplications(INITIAL_REGISTRATION_APPLICATIONS);
  };

  // Loads the data the signed-in role is allowed to see from the server.
  const loadAuthorizedData = async (isSuper: boolean): Promise<Chama[]> => {
    const requests: Promise<Response>[] = [fetch('/api/db/chamas')];
    if (isSuper) requests.push(fetch('/api/db/applications'));
    const [chamasRes, appsRes] = await Promise.all(requests);
    let chamas: Chama[] = [];
    if (chamasRes.ok) {
      chamas = await chamasRes.json();
      if (Array.isArray(chamas)) setAllChamas(chamas);
    }
    if (appsRes?.ok) {
      const appsData = await appsRes.json();
      if (Array.isArray(appsData)) setRegistrationApplications(appsData);
    }
    setDbLoaded(true);
    return chamas;
  };

  const enterWorkspace = (member: Member) => {
    setCurrentUser(member);
    setCurrentMemberId(member.id);
    setActiveChamaIdState(member.chamaId);
    setIsSuperAdminLoggedIn(false);
    if (['chairperson', 'treasurer', 'secretary', 'loan_officer'].includes(member.role)) {
      setActivePortal('officials');
      setCurrentOfficialRole(member.role);
    } else {
      setActivePortal('member');
    }
  };

  // Public data plus restoration of an existing server session
  useEffect(() => {
    let isMounted = true;
    async function bootstrap() {
      try {
        setIsDbSyncing(true);
        const categoriesRes = await fetch('/api/db/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          if (isMounted && Array.isArray(categoriesData) && categoriesData.length > 0) {
            setCategoryOptions(categoriesData);
          }
        }

        const meRes = await fetch('/api/auth/me');
        if (meRes.ok && isMounted) {
          const me = await meRes.json();
          if (me.role === 'super_admin') {
            await loadAuthorizedData(true);
            setIsSuperAdminLoggedIn(true);
            setActivePortal('super_admin');
          } else if (me.member) {
            await loadAuthorizedData(false);
            enterWorkspace(me.member);
          }
        }
      } catch (err) {
        console.warn('Database initialization fetch failed:', err);
      } finally {
        if (isMounted) {
          setIsDbSyncing(false);
        }
      }
    }

    bootstrap();
    return () => { isMounted = false; };
  }, []);

  // Synchronize state mutations to server database (server enforces role scope)
  useEffect(() => {
    if (!dbLoaded || !isAuthenticated) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch('/api/db/chamas/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allChamas),
        signal: controller.signal,
      }).then(response => {
        if (response.status === 401) {
          clearSession();
          return;
        }
        if (!response.ok) throw new Error(`Database sync failed (${response.status})`);
        setDbSyncError(null);
      }).catch(err => {
        if (controller.signal.aborted) return;
        console.error('Error synchronizing with database:', err);
        setDbSyncError('Changes could not be saved to the server. Keep this page open and retry.');
      });
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [allChamas, dbLoaded, isAuthenticated, syncAttempt]);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categoryOptions));
    } catch {
      // Handle storage error
    }
  }, [categoryOptions]);

  const activeChama = allChamas.find(c => c.id === activeChamaId) || allChamas[0];

  const currentMember = currentUser || activeChama.members.find(m => m.id === currentMemberId) || activeChama.members[0] || {
    id: 'guest',
    chamaId: activeChama.id,
    name: 'Guest Member',
    phoneNumber: '+254700000000',
    email: 'guest@chama.ke',
    membershipNumber: 'CS-GUEST-001',
    joinedDate: '2026-01-01',
    role: 'member',
    totalSavings: 0,
    sharesCount: 0,
    activeLoanBalance: 0,
    creditScore: 700,
    nextOfKin: { name: 'None', relationship: 'N/A', phone: '' },
    kycVerified: false,
    attendanceRate: 100,
    status: 'active' as const,
  };

  // Find all Chamas that the current user is a registered member of
  const userChamas = currentUser
    ? allChamas.filter(c => 
        c.members.some(m => 
          m.phoneNumber.replace(/\s+/g, '') === currentUser.phoneNumber.replace(/\s+/g, '') ||
          m.name.toLowerCase() === currentUser.name.toLowerCase() ||
          m.membershipNumber.toLowerCase() === currentUser.membershipNumber.toLowerCase()
        )
      )
    : [activeChama];

  const loginMember = async (identifier: string, pin?: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password: pin || '' }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: body.error || 'Unable to sign in. Please try again.' };
    }
    const chamas = await loadAuthorizedData(false);
    const chamaName = chamas.find(chama => chama.id === body.member.chamaId)?.name || 'your Chama';
    enterWorkspace(body.member);
    return { success: true, message: `Karibu ${body.member.name}! Logged into ${chamaName}` };
  };

  const loginSuperAdmin = async (securityPin: string) => {
    const response = await fetch('/api/auth/super-admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: securityPin }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Invalid operator security password.' };
    }
    await loadAuthorizedData(true);
    setIsSuperAdminLoggedIn(true);
    setCurrentUser(null);
    setActivePortal('super_admin');
    return { success: true, message: 'Authenticated as ChamaSmart Platform Super Admin' };
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(err => console.error('Error signing out:', err));
    clearSession();
  };

  const setActiveChamaId = (id: string) => {
    setActiveChamaIdState(id);
    const target = allChamas.find(c => c.id === id);
    if (target && target.members.length > 0) {
      if (currentUser) {
        // If user belongs to target chama, find their record there
        const matchingMem = target.members.find(
          m => m.phoneNumber.replace(/\s+/g, '') === currentUser.phoneNumber.replace(/\s+/g, '') ||
               m.name.toLowerCase() === currentUser.name.toLowerCase()
        );
        if (matchingMem) {
          setCurrentUser(matchingMem);
          setCurrentMemberId(matchingMem.id);
          if (['chairperson', 'treasurer', 'secretary', 'loan_officer'].includes(matchingMem.role)) {
            setActivePortal('officials');
            setCurrentOfficialRole(matchingMem.role);
          } else {
            setActivePortal('member');
          }
        }
      } else {
        setCurrentMemberId(target.members[0].id);
      }
    }
  };

  const updateActiveChama = (updater: (prev: Chama) => Chama) => {
    setAllChamas(prevList => 
      prevList.map(chama => {
        if (chama.id === activeChama.id) {
          return updater(chama);
        }
        return chama;
      })
    );
  };

  // Helper: append audit log
  const addAuditLog = (chama: Chama, action: string, module: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    const newLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      chamaId: chama.id,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: isSuperAdminLoggedIn
        ? 'Super Admin'
        : activePortal === 'member'
        ? currentMember.name
        : `${currentOfficialRole.toUpperCase()} Official`,
      actorRole: isSuperAdminLoggedIn
        ? 'super_admin'
        : activePortal === 'member'
        ? 'member' as Role
        : currentOfficialRole,
      action,
      module,
      details,
      severity,
    };
    return [newLog, ...chama.auditLogs];
  };

  // Helper: generate realistic Safaricom M-Pesa receipt (e.g. RKZ8192A01)
  const generateMpesaReceipt = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = 'RKZ';
    for (let i = 0; i < 7; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  // Process M-Pesa Payment
  const processMpesaPayment = async (params: {
    amount: number;
    phone: string;
    description: string;
    type: 'contribution' | 'loan_repayment';
    memberId: string;
    loanId?: string;
    allocations?: { fundType: FundType; amount: number }[];
  }) => {
    const receiptNumber = generateMpesaReceipt();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const member = activeChama.members.find(m => m.id === params.memberId);
    const memberName = member ? member.name : 'Chama Member';

    // Simulated short delay
    await new Promise(resolve => setTimeout(resolve, 800));

    updateActiveChama(chama => {
      let updatedFunds = [...chama.funds];
      let updatedMembers = [...chama.members];
      let updatedLoans = [...chama.loans];
      let updatedContributions = [...chama.contributions];
      let updatedTransactions = [...chama.transactions];

      if (params.type === 'contribution') {
        // Allocate amount to funds
        const allocations = params.allocations || [
          { fundType: 'general_savings' as FundType, amount: Math.round(params.amount * 0.6) },
          { fundType: 'welfare' as FundType, amount: Math.round(params.amount * 0.2) },
          { fundType: 'investment' as FundType, amount: params.amount - Math.round(params.amount * 0.6) - Math.round(params.amount * 0.2) },
        ];

        updatedFunds = updatedFunds.map(f => {
          const alloc = allocations.find(a => a.fundType === f.type);
          if (alloc) {
            return { ...f, balance: f.balance + alloc.amount };
          }
          return f;
        });

        // Update member savings & shares count
        updatedMembers = updatedMembers.map(m => {
          if (m.id === params.memberId) {
            const newSavings = m.totalSavings + params.amount;
            return {
              ...m,
              totalSavings: newSavings,
              sharesCount: Math.floor(newSavings / 1000),
            };
          }
          return m;
        });

        // Update contribution status if exists
        const todayDate = new Date().toISOString().split('T')[0];
        const existingContribIndex = updatedContributions.findIndex(
          c => c.memberId === params.memberId && c.status === 'pending'
        );

        if (existingContribIndex >= 0) {
          updatedContributions[existingContribIndex] = {
            ...updatedContributions[existingContribIndex],
            status: 'paid',
            paidAmount: updatedContributions[existingContribIndex].targetAmount,
            paidDate: todayDate,
            mpesaReceipt: receiptNumber,
          };
        } else {
          updatedContributions.unshift({
            id: `ct-${Date.now()}`,
            chamaId: chama.id,
            memberId: params.memberId,
            memberName,
            cycleName: 'Special / On-Demand Contribution',
            targetAmount: params.amount,
            paidAmount: params.amount,
            penaltyAmount: 0,
            dueDate: todayDate,
            paidDate: todayDate,
            status: 'paid',
            mpesaReceipt: receiptNumber,
            fundAllocations: allocations,
          });
        }

        // Add confirmed transaction
        updatedTransactions.unshift({
          id: `tx-${Date.now()}`,
          chamaId: chama.id,
          reference: `TX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          mpesaReceipt: receiptNumber,
          date: timestamp,
          type: 'contribution',
          amount: params.amount,
          description: params.description || `M-Pesa Contribution - ${memberName}`,
          fundType: 'general_savings',
          memberId: params.memberId,
          memberName,
          initiatedBy: `${memberName} (M-Pesa STK)`,
          status: 'confirmed',
          paymentMethod: 'mpesa_stk',
        });
      } else if (params.type === 'loan_repayment' && params.loanId) {
        // Loan repayment
        updatedLoans = updatedLoans.map(loan => {
          if (loan.id === params.loanId) {
            const newBalance = Math.max(0, loan.balanceRemaining - params.amount);
            const isCompleted = newBalance <= 0;
            const newRepayment = {
              id: `rep-${Date.now()}`,
              amount: params.amount,
              date: timestamp,
              mpesaReceipt: receiptNumber,
              recordedBy: 'M-Pesa STK Push Automated',
              balanceAfter: newBalance,
            };
            return {
              ...loan,
              balanceRemaining: newBalance,
              status: isCompleted ? ('completed' as const) : loan.status,
              repayments: [newRepayment, ...loan.repayments],
            };
          }
          return loan;
        });

        // Replenish loan revolving fund
        updatedFunds = updatedFunds.map(f => {
          if (f.type === 'loan_revolving') {
            return { ...f, balance: f.balance + params.amount };
          }
          return f;
        });

        // Update member activeLoanBalance
        updatedMembers = updatedMembers.map(m => {
          if (m.id === params.memberId) {
            return {
              ...m,
              activeLoanBalance: Math.max(0, m.activeLoanBalance - params.amount),
            };
          }
          return m;
        });

        // Transaction
        updatedTransactions.unshift({
          id: `tx-${Date.now()}`,
          chamaId: chama.id,
          reference: `TX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          mpesaReceipt: receiptNumber,
          date: timestamp,
          type: 'loan_repayment',
          amount: params.amount,
          description: `Loan Repayment (${params.loanId}) - ${memberName}`,
          fundType: 'loan_revolving',
          memberId: params.memberId,
          memberName,
          initiatedBy: `${memberName} (M-Pesa STK)`,
          status: 'confirmed',
          paymentMethod: 'mpesa_stk',
        });
      }

      const newAuditLogs = addAuditLog(
        chama,
        params.type === 'contribution' ? 'MPESA_CONTRIBUTION' : 'MPESA_LOAN_REPAYMENT',
        'M-Pesa Gateway',
        `M-Pesa STK Push confirmed: KSh ${params.amount.toLocaleString()} from ${params.phone}. Receipt: ${receiptNumber}.`
      );

      return {
        ...chama,
        funds: updatedFunds,
        members: updatedMembers,
        loans: updatedLoans,
        contributions: updatedContributions,
        transactions: updatedTransactions,
        auditLogs: newAuditLogs,
      };
    });

    return {
      success: true,
      receiptNumber,
      message: `Payment of KSh ${params.amount.toLocaleString()} confirmed successfully. Receipt: ${receiptNumber}`,
    };
  };

  // Apply for Loan
  const applyForLoan = (params: {
    borrowerId: string;
    productId: string;
    principal: number;
    durationWeeks: number;
    interestRate: number;
    interestMethod: InterestMethod;
    purpose: string;
    guarantorIds: string[];
  }) => {
    const borrower = activeChama.members.find(m => m.id === params.borrowerId);
    const product = activeChama.loanProducts.find(p => p.id === params.productId);
    if (!borrower || !product) return;

    // Calculate interest amount
    let interestAmount = 0;
    if (params.interestMethod === 'flat') {
      interestAmount = Math.round(params.principal * (params.interestRate / 100));
    } else if (params.interestMethod === 'simple_weekly') {
      interestAmount = Math.round(params.principal * (params.interestRate / 100) * params.durationWeeks);
    } else {
      // Reducing balance approx
      interestAmount = Math.round(params.principal * (params.interestRate / 100) * (params.durationWeeks / 2));
    }

    const totalPayable = params.principal + interestAmount;
    const weeklyInstalment = Math.round(totalPayable / params.durationWeeks);

    const today = new Date();
    const appliedDate = today.toISOString().split('T')[0];
    const dueDateObj = new Date(today.getTime() + params.durationWeeks * 7 * 24 * 60 * 60 * 1000);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const guarantors = params.guarantorIds.map(gId => {
      const gMem = activeChama.members.find(m => m.id === gId);
      const splitAmount = Math.round(params.principal / (params.guarantorIds.length || 1));
      return {
        memberId: gId,
        memberName: gMem ? gMem.name : 'Guarantor',
        amountGuaranteed: splitAmount,
        status: 'pending' as const,
      };
    });

    const newLoan: Loan = {
      id: `ln-${Date.now()}`,
      chamaId: activeChama.id,
      borrowerId: borrower.id,
      borrowerName: borrower.name,
      productId: product.id,
      productName: product.name,
      principal: params.principal,
      interestRate: params.interestRate,
      interestMethod: params.interestMethod,
      interestAmount,
      totalPayable,
      balanceRemaining: totalPayable,
      durationWeeks: params.durationWeeks,
      weeklyInstalment,
      appliedDate,
      dueDate,
      purpose: params.purpose,
      status: guarantors.length > 0 ? 'awaiting_guarantors' : 'under_review',
      guarantors,
      repayments: [],
    };

    updateActiveChama(chama => {
      const newAuditLogs = addAuditLog(
        chama,
        'LOAN_APPLIED',
        'Loan Engine',
        `${borrower.name} submitted loan application for KSh ${params.principal.toLocaleString()} (${product.name}). Purpose: ${params.purpose}`
      );
      return {
        ...chama,
        loans: [newLoan, ...chama.loans],
        auditLogs: newAuditLogs,
      };
    });
  };

  // Respond to Guarantor Request
  const respondGuarantor = (loanId: string, memberId: string, accept: boolean) => {
    updateActiveChama(chama => {
      let allAccepted = true;
      const updatedLoans = chama.loans.map(loan => {
        if (loan.id === loanId) {
          const updatedGuarantors = loan.guarantors.map(g => {
            if (g.memberId === memberId) {
              return {
                ...g,
                status: accept ? ('accepted' as const) : ('declined' as const),
                respondedAt: new Date().toISOString().split('T')[0],
              };
            }
            if (g.status !== 'accepted') allAccepted = false;
            return g;
          });

          const newStatus = accept && allAccepted ? ('under_review' as const) : loan.status;

          return {
            ...loan,
            guarantors: updatedGuarantors,
            status: !accept ? ('rejected' as const) : newStatus,
          };
        }
        return loan;
      });

      const member = chama.members.find(m => m.id === memberId);
      const newAuditLogs = addAuditLog(
        chama,
        'GUARANTOR_RESPONSE',
        'Loan Engine',
        `${member?.name || 'Member'} ${accept ? 'ACCEPTED' : 'DECLINED'} guarantor obligation for loan ${loanId}.`
      );

      return {
        ...chama,
        loans: updatedLoans,
        auditLogs: newAuditLogs,
      };
    });
  };

  // Approve Loan by Role
  const approveLoanByRole = (loanId: string, role: 'chairperson' | 'treasurer' | 'loan_officer') => {
    updateActiveChama(chama => {
      const updatedLoans = chama.loans.map(loan => {
        if (loan.id === loanId) {
          const chairApproved = role === 'chairperson' ? true : loan.approvedByChairperson;
          const treasApproved = role === 'treasurer' ? true : loan.approvedByTreasurer;
          const isFullyApproved = chairApproved && treasApproved;

          return {
            ...loan,
            approvedByChairperson: chairApproved,
            approvedByTreasurer: treasApproved,
            status: isFullyApproved ? ('approved' as const) : loan.status,
            approvedDate: isFullyApproved ? new Date().toISOString().split('T')[0] : loan.approvedDate,
          };
        }
        return loan;
      });

      const newAuditLogs = addAuditLog(
        chama,
        'LOAN_SIGN_OFF',
        'Loan Committee',
        `${role.toUpperCase()} approved loan ${loanId}. Multi-level dual authorization updated.`
      );

      return {
        ...chama,
        loans: updatedLoans,
        auditLogs: newAuditLogs,
      };
    });
  };

  // Disburse Loan
  const disburseLoan = (loanId: string) => {
    updateActiveChama(chama => {
      const loan = chama.loans.find(l => l.id === loanId);
      if (!loan) return chama;

      // Deduct principal from loan revolving fund
      const updatedFunds = chama.funds.map(f => {
        if (f.type === 'loan_revolving') {
          return { ...f, balance: Math.max(0, f.balance - loan.principal) };
        }
        return f;
      });

      // Update borrower active loan balance
      const updatedMembers = chama.members.map(m => {
        if (m.id === loan.borrowerId) {
          return {
            ...m,
            activeLoanBalance: m.activeLoanBalance + loan.totalPayable,
          };
        }
        return m;
      });

      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const mpesaRef = generateMpesaReceipt();

      const updatedLoans = chama.loans.map(l => {
        if (l.id === loanId) {
          return {
            ...l,
            status: 'disbursed' as const,
            disbursedDate: today,
          };
        }
        return l;
      });

      // Transaction log
      const updatedTransactions = [
        {
          id: `tx-${Date.now()}`,
          chamaId: chama.id,
          reference: `TX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          mpesaReceipt: mpesaRef,
          date: timestamp,
          type: 'loan_disbursement' as const,
          amount: loan.principal,
          description: `Disbursement of ${loan.productName} to ${loan.borrowerName} via M-Pesa B2C`,
          fundType: 'loan_revolving' as FundType,
          memberId: loan.borrowerId,
          memberName: loan.borrowerName,
          initiatedBy: 'Treasurer & Chairperson Dual Sign-off',
          status: 'confirmed' as const,
          paymentMethod: 'mpesa_c2b' as PaymentMethod,
        },
        ...chama.transactions,
      ];

      const newAuditLogs = addAuditLog(
        chama,
        'LOAN_DISBURSED',
        'Loan Engine',
        `Disbursed KSh ${loan.principal.toLocaleString()} to ${loan.borrowerName} for loan ${loan.id}. M-Pesa Ref: ${mpesaRef}.`
      );

      return {
        ...chama,
        funds: updatedFunds,
        members: updatedMembers,
        loans: updatedLoans,
        transactions: updatedTransactions,
        auditLogs: newAuditLogs,
      };
    });
  };

  // Initiate Withdrawal (Treasurer)
  const initiateWithdrawal = (params: {
    amount: number;
    fundType: FundType;
    purpose: string;
    recipientName: string;
    recipientPhone: string;
  }) => {
    const newPending: PendingWithdrawal = {
      id: `pwd-${Date.now()}`,
      chamaId: activeChama.id,
      amount: params.amount,
      fundType: params.fundType,
      purpose: params.purpose,
      recipientName: params.recipientName,
      recipientPhone: params.recipientPhone,
      initiatedBy: `${currentOfficialRole.toUpperCase()} Official`,
      initiatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending',
    };

    updateActiveChama(chama => {
      const newAuditLogs = addAuditLog(
        chama,
        'WITHDRAWAL_INITIATED',
        'Dual Authorization',
        `Withdrawal of KSh ${params.amount.toLocaleString()} from ${params.fundType} initiated for ${params.recipientName}. Awaiting Chairperson sign-off.`
      );
      return {
        ...chama,
        pendingWithdrawals: [newPending, ...chama.pendingWithdrawals],
        auditLogs: newAuditLogs,
      };
    });
  };

  // Approve Withdrawal (Chairperson)
  const approveWithdrawal = (withdrawalId: string, approved: boolean) => {
    updateActiveChama(chama => {
      const withdrawal = chama.pendingWithdrawals.find(w => w.id === withdrawalId);
      if (!withdrawal) return chama;

      let updatedFunds = [...chama.funds];
      let updatedTransactions = [...chama.transactions];
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

      if (approved) {
        // Deduct from fund
        updatedFunds = updatedFunds.map(f => {
          if (f.type === withdrawal.fundType) {
            return { ...f, balance: Math.max(0, f.balance - withdrawal.amount) };
          }
          return f;
        });

        // Add confirmed transaction
        updatedTransactions.unshift({
          id: `tx-${Date.now()}`,
          chamaId: chama.id,
          reference: `TX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          mpesaReceipt: generateMpesaReceipt(),
          date: timestamp,
          type: 'withdrawal',
          amount: withdrawal.amount,
          description: `Authorized withdrawal: ${withdrawal.purpose} (Paid to ${withdrawal.recipientName})`,
          fundType: withdrawal.fundType,
          initiatedBy: withdrawal.initiatedBy,
          approvedBy: `${currentOfficialRole.toUpperCase()} Official`,
          status: 'confirmed',
          paymentMethod: 'bank_transfer',
        });
      }

      const updatedPending = chama.pendingWithdrawals.map(w => {
        if (w.id === withdrawalId) {
          return {
            ...w,
            status: approved ? ('approved' as const) : ('rejected' as const),
            approvedBy: `${currentOfficialRole.toUpperCase()} Official`,
            approvedAt: timestamp,
          };
        }
        return w;
      });

      const newAuditLogs = addAuditLog(
        chama,
        approved ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
        'Dual Authorization',
        `Dual-authorization withdrawal ${withdrawalId} of KSh ${withdrawal.amount.toLocaleString()} was ${approved ? 'APPROVED & EXECUTED' : 'REJECTED'}.`
      );

      return {
        ...chama,
        funds: updatedFunds,
        transactions: updatedTransactions,
        pendingWithdrawals: updatedPending,
        auditLogs: newAuditLogs,
      };
    });
  };

  // Transfer Funds
  const transferFunds = (fromFund: FundType, toFund: FundType, amount: number, reason: string) => {
    updateActiveChama(chama => {
      const updatedFunds = chama.funds.map(f => {
        if (f.type === fromFund) return { ...f, balance: Math.max(0, f.balance - amount) };
        if (f.type === toFund) return { ...f, balance: f.balance + amount };
        return f;
      });

      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const updatedTransactions = [
        {
          id: `tx-${Date.now()}`,
          chamaId: chama.id,
          reference: `TX-TRF-${Math.floor(1000 + Math.random() * 9000)}`,
          date: timestamp,
          type: 'fund_transfer' as const,
          amount,
          description: `Internal Transfer: ${fromFund} -> ${toFund}. Reason: ${reason}`,
          fundType: fromFund,
          initiatedBy: `${currentOfficialRole.toUpperCase()} Official`,
          status: 'confirmed' as const,
          paymentMethod: 'cash' as PaymentMethod,
        },
        ...chama.transactions,
      ];

      const newAuditLogs = addAuditLog(
        chama,
        'FUND_TRANSFER',
        'Fund Management',
        `Transferred KSh ${amount.toLocaleString()} from ${fromFund} to ${toFund}. Reason: ${reason}`
      );

      return {
        ...chama,
        funds: updatedFunds,
        transactions: updatedTransactions,
        auditLogs: newAuditLogs,
      };
    });
  };

  // Advance Merry Go Round
  const advanceMerryGoRound = (mgrId: string) => {
    updateActiveChama(chama => {
      if (!chama.merryGoRound || chama.merryGoRound.id !== mgrId) return chama;
      const mgr = chama.merryGoRound;
      const currentIndex = mgr.currentTurnIndex;
      const currentOrder = mgr.membersOrder[currentIndex];
      if (!currentOrder) return chama;

      const receipt = generateMpesaReceipt();
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

      const updatedMembersOrder = mgr.membersOrder.map((item, idx) => {
        if (idx === currentIndex) {
          return {
            ...item,
            isPaid: true,
            paidDate: today,
            mpesaReceipt: receipt,
          };
        }
        return item;
      });

      const nextTurnIndex = (currentIndex + 1) % mgr.membersOrder.length;

      const updatedTransactions = [
        {
          id: `tx-${Date.now()}`,
          chamaId: chama.id,
          reference: `TX-MGR-${Math.floor(1000 + Math.random() * 9000)}`,
          mpesaReceipt: receipt,
          date: timestamp,
          type: 'merry_go_round_payout' as const,
          amount: mgr.payoutAmount,
          description: `Merry-Go-Round Payout Round ${mgr.cycleNumber} to ${currentOrder.memberName}`,
          fundType: 'general_savings' as FundType,
          memberId: currentOrder.memberId,
          memberName: currentOrder.memberName,
          initiatedBy: 'Automated Payout Engine',
          status: 'confirmed' as const,
          paymentMethod: 'mpesa_c2b' as PaymentMethod,
        },
        ...chama.transactions,
      ];

      const newAuditLogs = addAuditLog(
        chama,
        'MERRY_GO_ROUND_PAYOUT',
        'Merry-Go-Round',
        `Disbursed rotation pot of KSh ${mgr.payoutAmount.toLocaleString()} to ${currentOrder.memberName}. Next turn: ${mgr.membersOrder[nextTurnIndex].memberName}.`
      );

      return {
        ...chama,
        merryGoRound: {
          ...mgr,
          membersOrder: updatedMembersOrder,
          currentTurnIndex: nextTurnIndex,
        },
        transactions: updatedTransactions,
        auditLogs: newAuditLogs,
      };
    });
  };

  // Save Meeting Attendance
  const saveMeetingAttendance = (meetingId: string, attendance: MeetingAttendance[]) => {
    updateActiveChama(chama => {
      const updatedMeetings = chama.meetings.map(m => {
        if (m.id === meetingId) {
          return { ...m, attendance };
        }
        return m;
      });

      const newAuditLogs = addAuditLog(
        chama,
        'MEETING_ATTENDANCE_SAVED',
        'Governance',
        `Updated digital attendance register for meeting ${meetingId}.`
      );

      return {
        ...chama,
        meetings: updatedMeetings,
        auditLogs: newAuditLogs,
      };
    });
  };

  // Save Meeting Minutes
  const saveMeetingMinutes = (meetingId: string, minutes: string, actionPoints: string[]) => {
    updateActiveChama(chama => {
      const updatedMeetings = chama.meetings.map(m => {
        if (m.id === meetingId) {
          return { ...m, minutes, actionPoints, status: 'completed' as const };
        }
        return m;
      });

      const newAuditLogs = addAuditLog(
        chama,
        'MINUTES_RECORDED',
        'Governance',
        `Secretary recorded and certified official minutes for meeting ${meetingId}.`
      );

      return {
        ...chama,
        meetings: updatedMeetings,
        auditLogs: newAuditLogs,
      };
    });
  };

  // Schedule a new Meeting with Agenda & initialize Attendance Register
  const scheduleMeeting = (params: {
    title: string;
    date: string;
    time: string;
    venue: string;
    isVirtual: boolean;
    virtualLink?: string;
    agendaItems: string[];
  }) => {
    const meetingId = `mtg-${Date.now()}`;
    updateActiveChama(chama => {
      const initialAttendance: MeetingAttendance[] = (chama.members || []).map(m => ({
        memberId: m.id,
        memberName: m.name,
        status: 'present',
        fineAmount: 0,
        finePaid: true,
      }));

      const newMeeting: Meeting = {
        id: meetingId,
        chamaId: chama.id,
        title: params.title.trim(),
        date: params.date,
        time: params.time,
        venue: params.venue.trim(),
        isVirtual: params.isVirtual,
        virtualLink: params.virtualLink?.trim() || undefined,
        status: 'upcoming',
        agendaItems: params.agendaItems.filter(item => item.trim().length > 0),
        attendance: initialAttendance,
        actionPoints: [],
      };

      const newAuditLogs = addAuditLog(
        chama,
        'MEETING_SCHEDULED',
        'Meeting Governance',
        `Scheduled upcoming meeting "${newMeeting.title}" for ${newMeeting.date} at ${newMeeting.time}.`
      );

      return {
        ...chama,
        meetings: [newMeeting, ...(chama.meetings || [])],
        auditLogs: newAuditLogs,
      };
    });

    return {
      success: true,
      meetingId,
      message: `Meeting "${params.title}" added for ${params.date}; saving changes to the server.`,
    };
  };

  // Update Meeting Status
  const updateMeetingStatus = (meetingId: string, status: 'upcoming' | 'in_progress' | 'completed') => {
    updateActiveChama(chama => {
      const updatedMeetings = (chama.meetings || []).map(m => {
        if (m.id === meetingId) {
          return { ...m, status };
        }
        return m;
      });

      const newAuditLogs = addAuditLog(
        chama,
        'MEETING_STATUS_UPDATED',
        'Meeting Governance',
        `Meeting ${meetingId} status changed to ${status}.`
      );

      return {
        ...chama,
        meetings: updatedMeetings,
        auditLogs: newAuditLogs,
      };
    });
  };

  // Delete / Cancel Meeting
  const deleteMeeting = (meetingId: string) => {
    let meetingTitle = '';
    updateActiveChama(chama => {
      const target = (chama.meetings || []).find(m => m.id === meetingId);
      meetingTitle = target ? target.title : meetingId;
      const updatedMeetings = (chama.meetings || []).filter(m => m.id !== meetingId);

      const newAuditLogs = addAuditLog(
        chama,
        'MEETING_CANCELLED',
        'Meeting Governance',
        `Meeting "${meetingTitle}" was cancelled/removed.`
      );

      return {
        ...chama,
        meetings: updatedMeetings,
        auditLogs: newAuditLogs,
      };
    });

    return {
      success: true,
      message: `Meeting "${meetingTitle}" was successfully cancelled.`,
    };
  };

  // Cast Vote in Democratic Election
  const castVote = (electionId: string, positionId: string, candidateId: string) => {
    updateActiveChama(chama => {
      const updatedElections = chama.elections.map(elec => {
        if (elec.id === electionId) {
          if (elec.votedMemberIds.includes(currentMember.id)) return elec;

          const updatedPositions = elec.positions.map(pos => {
            if (pos.id === positionId) {
              const updatedCandidates = pos.candidates.map(cand => {
                if (cand.candidateId === candidateId) {
                  return { ...cand, votesCount: cand.votesCount + 1 };
                }
                return cand;
              });
              return { ...pos, candidates: updatedCandidates };
            }
            return pos;
          });

          return {
            ...elec,
            positions: updatedPositions,
            votedMemberIds: [...elec.votedMemberIds, currentMember.id],
          };
        }
        return elec;
      });

      const newAuditLogs = addAuditLog(
        chama,
        'VOTE_CAST',
        'Elections & Governance',
        `Anonymous secret ballot registered by member ${currentMember.membershipNumber} in election ${electionId}.`
      );

      return {
        ...chama,
        elections: updatedElections,
        auditLogs: newAuditLogs,
      };
    });
  };

  // Add Investment Asset
  const addInvestmentAsset = (asset: Omit<InvestmentAsset, 'id' | 'chamaId'>) => {
    const newAsset: InvestmentAsset = {
      ...asset,
      id: `inv-${Date.now()}`,
      chamaId: activeChama.id,
    };

    updateActiveChama(chama => {
      const newAuditLogs = addAuditLog(
        chama,
        'INVESTMENT_RECORDED',
        'Investment Portfolio',
        `Acquired asset: ${asset.title} valued at KSh ${asset.acquisitionCost.toLocaleString()}. Category: ${asset.category}.`
      );
      return {
        ...chama,
        investments: [newAsset, ...chama.investments],
        auditLogs: newAuditLogs,
      };
    });
  };

  // Submit Registration Application by Public
  const submitRegistrationApplication = (data: Omit<ChamaRegistrationApplication, 'id' | 'status' | 'submittedAt'>) => {
    const applicationId = `app-${Date.now()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const newApp: ChamaRegistrationApplication = {
      ...data,
      id: applicationId,
      status: 'pending_approval',
      submittedAt: timestamp,
    };

    setRegistrationApplications(prev => [newApp, ...prev]);

    // Authoritative database storage
    fetch('/api/db/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApp),
    }).catch(err => console.error('Error persisting application to DB:', err));

    return {
      success: true,
      applicationId,
      message: `Registration application for "${data.chamaName}" received! It is now pending Super Admin review and authorization.`,
    };
  };

  // Review Registration Application (Approve or Reject by Super Admin)
  const reviewRegistrationApplication = (applicationId: string, action: 'approve' | 'reject', reason?: string) => {
    const app = registrationApplications.find(a => a.id === applicationId);
    if (!app) {
      return { success: false, message: 'Application not found.' };
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (action === 'reject') {
      setRegistrationApplications(prev =>
        prev.map(a =>
          a.id === applicationId
            ? { ...a, status: 'rejected' as const, reviewedAt: timestamp, rejectionReason: reason || 'Application criteria incomplete.' }
            : a
        )
      );

      fetch(`/api/db/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          reviewedAt: timestamp,
          rejectionReason: reason || 'Application criteria incomplete.',
        }),
      }).catch(err => console.error('Error updating application rejection in DB:', err));

      return { success: true, message: `Application for "${app.chamaName}" was marked as rejected.` };
    }

    // When Super Admin approves: Provision Chama Tenant and assign Chairperson as Chama Admin
    const newChamaId = `chama-${Date.now()}`;
    const newChairpersonId = `mem-chair-${Date.now()}`;
    const initialFunds = [
      { id: `f1-${Date.now()}`, type: 'general_savings' as FundType, name: 'General Savings Fund', balance: 0, description: 'Core contributions reserve', color: '#2563eb' },
      { id: `f2-${Date.now()}`, type: 'loan_revolving' as FundType, name: 'Loan Revolving Fund', balance: 0, description: 'Member lending pool', color: '#10b981' },
      { id: `f3-${Date.now()}`, type: 'welfare' as FundType, name: 'Benevolent Welfare Fund', balance: 0, description: 'Hospital & emergency support', color: '#8b5cf6' },
      { id: `f4-${Date.now()}`, type: 'investment' as FundType, name: 'Syndicate Investment Fund', balance: 0, description: 'Assets, land and property holdings', color: '#f59e0b' },
    ];

    const foundingChairperson: Member = {
      id: newChairpersonId,
      chamaId: newChamaId,
      name: app.applicantChairpersonName,
      phoneNumber: app.applicantPhone,
      email: app.applicantEmail,
      membershipNumber: 'CS-001',
      joinedDate: new Date().toISOString().split('T')[0],
      role: 'chairperson', // Chairperson becomes Chama Admin with full rights on the specific tenant
      totalSavings: 0,
      sharesCount: 0,
      activeLoanBalance: 0,
      creditScore: 800,
      nextOfKin: { name: 'Family Contact', relationship: 'Spouse', phone: '+254700000000' },
      kycVerified: true,
      attendanceRate: 100,
      status: 'active',
    };

    const newChama: Chama = {
      id: newChamaId,
      name: app.chamaName,
      category: app.category,
      tagline: app.tagline || 'Together we grow',
      county: app.county,
      country: app.country || 'Kenya',
      registrationNumber: app.registrationNumber || `SHG/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      formedDate: new Date().toISOString().split('T')[0],
      currency: 'KSh',
      planTier: app.planTier,
      monthlySubscriptionKsh: 
        app.planTier === 'Starter' ? 0 : 
        app.planTier === 'Basic' ? 500 : 
        app.planTier === 'Growth' ? 1500 : 
        app.planTier === 'Professional' ? 2500 : 5000,
      mpesaPaybillOrTill: 'Till: ' + Math.floor(100000 + Math.random() * 900000),
      accountNumber: `CS-${Math.floor(100 + Math.random() * 900)}`,
      funds: initialFunds,
      loanProducts: [
        {
          id: `lp-std-${Date.now()}`,
          name: 'Standard Table Banking Loan',
          type: 'weekly_revolving',
          description: 'Short term borrowing for active group members',
          interestRate: 5,
          interestMethod: 'flat',
          minAmount: 1000,
          maxAmount: 50000,
          maxWeeks: 8,
          guarantorsRequired: 1,
        },
      ],
      members: [foundingChairperson],
      loans: [],
      contributions: [],
      transactions: [],
      pendingWithdrawals: [],
      investments: [],
      meetings: [],
      elections: [],
      auditLogs: [
        {
          id: `aud-sup-${Date.now()}`,
          chamaId: newChamaId,
          timestamp: timestamp,
          actorName: 'Platform Super Admin',
          actorRole: 'super_admin',
          action: 'CHAMA_PROVISIONED_BY_SUPERADMIN',
          module: 'SaaS Master Tenant Provisioning',
          details: `Application ${applicationId} approved. Chama workspace created. Founding Chairperson ${app.applicantChairpersonName} assigned Chama Admin tenant rights.`,
          severity: 'info',
        },
      ],
    };

    // Update state
    setRegistrationApplications(prev =>
      prev.map(a =>
        a.id === applicationId
          ? { ...a, status: 'approved' as const, reviewedAt: timestamp, superAdminNotes: 'Authorized by Platform Super Admin' }
          : a
      )
    );

    setAllChamas(prev => [newChama, ...prev]);

    // Persist new tenant and application update to database
    fetch(`/api/db/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'approved',
        reviewedAt: timestamp,
        superAdminNotes: 'Authorized by Platform Super Admin',
        chairpersonMemberId: newChairpersonId,
      }),
    }).catch(err => console.error('Error approving application in DB:', err));

    fetch('/api/db/chamas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChama),
    }).catch(err => console.error('Error inserting new chama to DB:', err));

    return {
      success: true,
      newChamaId,
      message: `Chama "${app.chamaName}" successfully provisioned! Founding Chairperson ${app.applicantChairpersonName} is configured as Chama Admin with full rights.`,
    };
  };

  // Add Member (Secretary, Chama Admin, or Super Admin capability)
  const addMember = async (
    memberData: Omit<Member, 'id' | 'chamaId' | 'totalSavings' | 'sharesCount' | 'activeLoanBalance' | 'creditScore' | 'kycVerified' | 'attendanceRate' | 'status' | 'passwordHash'> & { password: string },
    chamaId = activeChama.id,
  ) => {
    if (!isSuperAdminLoggedIn && (!currentUser || !['secretary', 'chairperson'].includes(currentUser.role))) {
      return {
        success: false,
        message: 'Only the Super Admin, Secretary, or Chama Admin can onboard member accounts.',
      };
    }

    if (memberData.password.trim().length < 8) {
      return { success: false, message: 'Passwords must be at least 8 characters long.' };
    }

    const targetChama = allChamas.find(chama => chama.id === chamaId);
    if (!targetChama) return { success: false, message: 'Chama workspace not found.' };
    if (!isSuperAdminLoggedIn && currentUser?.chamaId !== chamaId) {
      return { success: false, message: 'You can only onboard users within your own Chama.' };
    }

    const duplicate = allChamas.flatMap(chama => chama.members).find(member =>
      member.phoneNumber.replace(/\s+/g, '') === memberData.phoneNumber.replace(/\s+/g, '') ||
      member.membershipNumber.toLowerCase() === memberData.membershipNumber.toLowerCase() ||
      (memberData.email && member.email.toLowerCase() === memberData.email.toLowerCase())
    );
    if (duplicate) return { success: false, message: 'A user account already exists with that phone, email, or membership number.' };

    const response = await fetch(`/api/db/chamas/${encodeURIComponent(chamaId)}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return { success: false, message: body.error || 'Unable to create the account.' };
    const newMember: Member = body;

    const actor = isSuperAdminLoggedIn ? 'Super Admin' : currentUser?.name || 'Chama Official';
    setAllChamas(prev => prev.map(chama => {
      if (chama.id !== chamaId) return chama;
      const newAuditLogs = addAuditLog(
        chama,
        'MEMBER_ONBOARDED',
        'User Accounts',
        `${actor} created an account for ${memberData.name} (${memberData.membershipNumber}, ${memberData.phoneNumber}).`
      );
      return { ...chama, members: [...chama.members, newMember], auditLogs: newAuditLogs };
    }));

    return {
      success: true,
      message: `Member ${memberData.name} (${memberData.membershipNumber}) registered successfully.`,
    };
  };

  const updateMemberAccount = (
    memberId: string,
    changes: Pick<Member, 'name' | 'phoneNumber' | 'email' | 'membershipNumber' | 'role' | 'status' | 'nextOfKin'>,
  ) => {
    if (!isSuperAdminLoggedIn) return { success: false, message: 'Only the Super Admin can edit user accounts.' };
    const chama = allChamas.find(item => item.members.some(member => member.id === memberId));
    const target = chama?.members.find(member => member.id === memberId);
    if (!chama || !target) return { success: false, message: 'User account not found.' };
    const duplicate = allChamas.flatMap(item => item.members).find(member =>
      member.id !== memberId &&
      (member.phoneNumber.replace(/\s+/g, '') === changes.phoneNumber.replace(/\s+/g, '') ||
        member.membershipNumber.toLowerCase() === changes.membershipNumber.toLowerCase() ||
        (changes.email && member.email.toLowerCase() === changes.email.toLowerCase()))
    );
    if (duplicate) return { success: false, message: 'Another user already has that phone, email, or membership number.' };

    setAllChamas(prev => prev.map(item => {
      if (item.id !== chama.id) return item;
      const auditLogs = addAuditLog(item, 'MEMBER_ACCOUNT_EDITED', 'User Accounts', `Super Admin edited the account for ${target.name}.`);
      return {
        ...item,
        members: item.members.map(member => member.id === memberId ? { ...member, ...changes } : member),
        auditLogs,
      };
    }));
    return { success: true, message: `Account for ${target.name} updated.` };
  };

  const deleteMemberAccount = (memberId: string) => {
    if (!isSuperAdminLoggedIn) return { success: false, message: 'Only the Super Admin can remove user accounts.' };
    const chama = allChamas.find(item => item.members.some(member => member.id === memberId));
    const target = chama?.members.find(member => member.id === memberId);
    if (!chama || !target) return { success: false, message: 'User account not found.' };

    setAllChamas(prev => prev.map(item => {
      if (item.id !== chama.id) return item;
      const auditLogs = addAuditLog(item, 'MEMBER_ACCOUNT_REMOVED', 'User Accounts', `Super Admin removed the account for ${target.name}.`, 'warning');
      return { ...item, members: item.members.filter(member => member.id !== memberId), auditLogs };
    }));
    return { success: true, message: `Account for ${target.name} removed.` };
  };

  const resetMemberPassword = async (memberId: string, password: string) => {
    if (!isSuperAdminLoggedIn && (!currentUser || !['secretary', 'chairperson'].includes(currentUser.role))) {
      return { success: false, message: 'Only the Super Admin, Secretary, or Chama Admin can set or reset passwords.' };
    }
    if (password.trim().length < 8) return { success: false, message: 'Passwords must be at least 8 characters long.' };
    const chama = allChamas.find(item => item.members.some(member => member.id === memberId));
    const target = chama?.members.find(member => member.id === memberId);
    if (!chama || !target) return { success: false, message: 'User account not found.' };
    if (!isSuperAdminLoggedIn && target.chamaId !== currentUser?.chamaId) {
      return { success: false, message: 'You can only set passwords for users in your own Chama.' };
    }

    const response = await fetch(`/api/auth/members/${encodeURIComponent(memberId)}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Unable to update the password.' };
    }
    const actor = isSuperAdminLoggedIn ? 'Super Admin' : currentUser?.name || 'Chama Official';
    setAllChamas(prev => prev.map(item => {
      if (item.id !== chama.id) return item;
      const auditLogs = addAuditLog(item, 'MEMBER_PASSWORD_RESET', 'User Accounts', `${actor} set or reset the password for ${target.name}.`, 'warning');
      return { ...item, auditLogs };
    }));
    return { success: true, message: `Password updated for ${target.name}.` };
  };

  const saveCategoryOptions = async (categories: string[]) => {
    const response = await fetch('/api/db/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories),
    });
    if (!response.ok) throw new Error(`Unable to save categories (${response.status}).`);
    setCategoryOptions(categories);
  };

  const addCategory = async (category: string) => {
    if (!isSuperAdminLoggedIn) return { success: false, message: 'Only the Super Admin can manage categories.' };
    if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(category)) return { success: false, message: 'Use letters, numbers, and spaces for a category name.' };
    if (categoryOptions.includes(category)) return { success: false, message: 'That category already exists.' };
    try {
      await saveCategoryOptions([...categoryOptions, category]);
      return { success: true, message: `Category "${category.replace(/_/g, ' ')}" added.` };
    } catch (error) {
      console.error('Unable to add chama category:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unable to save category.' };
    }
  };

  const renameCategory = async (oldCategory: string, newCategory: string) => {
    if (!isSuperAdminLoggedIn) return { success: false, message: 'Only the Super Admin can manage categories.' };
    if (!categoryOptions.includes(oldCategory)) return { success: false, message: 'Category not found.' };
    if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(newCategory)) return { success: false, message: 'Use letters, numbers, and spaces for a category name.' };
    if (oldCategory !== newCategory && categoryOptions.includes(newCategory)) return { success: false, message: 'That category already exists.' };
    if (oldCategory === newCategory) return { success: true, message: 'Category unchanged.' };

    const updatedCategories = categoryOptions.map(category => category === oldCategory ? newCategory : category);
    try {
      await saveCategoryOptions(updatedCategories);
      setAllChamas(prev => prev.map(chama => chama.category === oldCategory ? { ...chama, category: newCategory } : chama));
      setRegistrationApplications(prev => prev.map(application => application.category === oldCategory ? { ...application, category: newCategory } : application));
      return { success: true, message: `Category renamed to "${newCategory.replace(/_/g, ' ')}".` };
    } catch (error) {
      console.error('Unable to rename chama category:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unable to rename category.' };
    }
  };

  const removeCategory = async (category: string, replacementCategory?: string) => {
    if (!isSuperAdminLoggedIn) return { success: false, message: 'Only the Super Admin can manage categories.' };
    if (categoryOptions.length <= 1) return { success: false, message: 'At least one category must remain.' };
    const isInUse = allChamas.some(chama => chama.category === category) ||
      registrationApplications.some(application => application.category === category);
    if (isInUse && (!replacementCategory || replacementCategory === category || !categoryOptions.includes(replacementCategory))) {
      return { success: false, message: 'Choose a different category to reassign existing chamas and applications before removing this one.' };
    }

    try {
      await saveCategoryOptions(categoryOptions.filter(item => item !== category));
      if (isInUse && replacementCategory) {
        setAllChamas(prev => prev.map(chama => chama.category === category ? { ...chama, category: replacementCategory } : chama));
        setRegistrationApplications(prev => prev.map(application => application.category === category ? { ...application, category: replacementCategory } : application));
      }
      return { success: true, message: `Category "${category.replace(/_/g, ' ')}" removed.` };
    } catch (error) {
      console.error('Unable to remove chama category:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unable to remove category.' };
    }
  };

  // Assign Roles (Chairperson governance authority)
  const assignMemberRole = (memberId: string, newRole: Role) => {
    // Only Chairperson (or Super Admin) can assign governance roles
    const callerRole = currentUser ? currentUser.role : currentOfficialRole;
    if (currentUser && !['chairperson', 'super_admin'].includes(callerRole)) {
      return {
        success: false,
        message: 'Permission Denied: Only the Chairperson has constitutional authority to assign or reassign executive roles in this Chama.',
      };
    }

    const targetMember = activeChama.members.find(m => m.id === memberId);
    if (!targetMember) {
      return { success: false, message: 'Member not found in this chama workspace.' };
    }

    updateActiveChama(chama => {
      const updatedMembers = chama.members.map(m => {
        if (m.id === memberId) {
          return { ...m, role: newRole };
        }
        return m;
      });

      const newAuditLogs = addAuditLog(
        chama,
        'OFFICIAL_ROLE_ASSIGNED',
        'Chairperson Executive Governance',
        `Chairperson appointed ${targetMember.name} to the executive post of ${newRole.toUpperCase()}.`
      );

      return {
        ...chama,
        members: updatedMembers,
        auditLogs: newAuditLogs,
      };
    });

    // If target member is the logged-in user, update current state too
    if (currentUser && currentUser.id === memberId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
      if (['chairperson', 'treasurer', 'secretary', 'loan_officer'].includes(newRole)) {
        setCurrentOfficialRole(newRole);
      }
    }

    return {
      success: true,
      message: `Role of ${newRole.toUpperCase().replace('_', ' ')} assigned to ${targetMember.name} by the Chairperson.`,
    };
  };

  // Create new Chama (Direct provision fallback)
  const createChama = (chamaData: Partial<Chama> & {
    chairpersonName?: string;
    chairpersonPhone?: string;
    chairpersonEmail?: string;
    chairpersonPassword?: string;
  }) => {
    const newChamaId = `chama-${Date.now()}`;
    const founderMemberId = `mem-founder-${Date.now()}`;
    const chairName = chamaData.chairpersonName || 'Founding Chairperson';
    const chairPhone = chamaData.chairpersonPhone || '+254700000001';
    const chairEmail = chamaData.chairpersonEmail || `${chairName.toLowerCase().replace(/\s+/g, '.')}@newchama.or.ke`;

    const newChama: Chama = {
      id: newChamaId,
      name: chamaData.name || 'New Community Chama',
      category: chamaData.category || 'weekly_savings',
      tagline: chamaData.tagline || 'Together we prosper',
      county: chamaData.county || 'Nairobi County',
      country: 'Kenya',
      registrationNumber: chamaData.registrationNumber || `SHG/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      formedDate: new Date().toISOString().split('T')[0],
      currency: 'KSh',
      planTier: chamaData.planTier || 'Basic',
      monthlySubscriptionKsh: chamaData.monthlySubscriptionKsh || 500,
      mpesaPaybillOrTill: chamaData.mpesaPaybillOrTill || 'Till: 549100',
      accountNumber: `CS-${Math.floor(100 + Math.random() * 900)}`,
      funds: [
        { id: `f1-${Date.now()}`, type: 'general_savings', name: 'General Savings Fund', balance: 0, description: 'Core contributions', color: '#2563eb' },
        { id: `f2-${Date.now()}`, type: 'loan_revolving', name: 'Loan Revolving Fund', balance: 0, description: 'Lending pool', color: '#10b981' },
        { id: `f3-${Date.now()}`, type: 'welfare', name: 'Benevolent Welfare Fund', balance: 0, description: 'Member assistance', color: '#8b5cf6' },
      ],
      loanProducts: [
        {
          id: `lp-${Date.now()}`,
          name: 'Standard Weekly Table Loan',
          type: 'weekly_revolving',
          description: 'Short term borrowing for members',
          interestRate: 5,
          interestMethod: 'flat',
          minAmount: 1000,
          maxAmount: 50000,
          maxWeeks: 8,
          guarantorsRequired: 1,
        },
      ],
      members: [
        {
          id: founderMemberId,
          chamaId: newChamaId,
          name: chairName,
          phoneNumber: chairPhone,
          email: chairEmail,
          membershipNumber: 'CS-001',
          joinedDate: new Date().toISOString().split('T')[0],
          role: 'chairperson',
          totalSavings: 5000,
          sharesCount: 5,
          activeLoanBalance: 0,
          creditScore: 800,
          nextOfKin: { name: 'Family Contact', relationship: 'Spouse', phone: '+254700000002' },
          kycVerified: true,
          attendanceRate: 100,
          status: 'active',
        },
      ],
      loans: [],
      contributions: [],
      transactions: [],
      pendingWithdrawals: [],
      investments: [],
      meetings: [],
      elections: [],
      auditLogs: [
        {
          id: `aud-init-${Date.now()}`,
          chamaId: newChamaId,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actorName: 'System Administrator',
          actorRole: 'super_admin',
          action: 'CHAMA_PROVISIONED',
          module: 'Tenant Setup',
          details: 'New Chama workspace provisioned with independent tenant isolation.',
          severity: 'info',
        },
      ],
    };

    setAllChamas(prev => [newChama, ...prev]);
    setActiveChamaIdState(newChama.id);

    // Persist to server database including chairperson initial password
    fetch('/api/db/chamas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newChama,
        chairpersonPassword: chamaData.chairpersonPassword,
      }),
    }).catch(err => console.error('Error provisioning chama in DB:', err));
  };

  const resetToDefaults = () => {
    localStorage.removeItem(CATEGORIES_STORAGE_KEY);
    setAllChamas(INITIAL_CHAMAS);
    setRegistrationApplications(INITIAL_REGISTRATION_APPLICATIONS);
    setCategoryOptions(DEFAULT_CHAMA_CATEGORIES);
    setActiveChamaIdState(INITIAL_CHAMAS[0].id);
    setCurrentMemberId('mem-5');
    fetch('/api/db/reset', { method: 'POST' }).catch(err => console.error('Error resetting DB:', err));
  };

  // Export full SQL Dump and trigger client file download
  const exportSqlDump = async () => {
    try {
      setIsDbSyncing(true);
      const res = await fetch('/api/db/export-sql-dump');
      if (!res.ok) {
        throw new Error(`Failed to generate database SQL export (${res.status})`);
      }
      
      const dumpSql = await res.text();
      const disposition = res.headers.get('Content-Disposition');
      let filename = 'chamasmart_dump_latest.sql';
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      // Trigger standard browser download
      const blob = new Blob([dumpSql], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setIsDbSyncing(false);
      return {
        success: true,
        dumpSql,
        filename,
        message: `Database exported successfully! Saved to export_sql_dump/${filename} and downloaded to your device.`,
      };
    } catch (err: any) {
      setIsDbSyncing(false);
      return {
        success: false,
        message: err.message || 'Error exporting database SQL dump',
      };
    }
  };

  // Super Admin CRUD and Configuration Capabilities
  const editChama = (chamaId: string, updates: Partial<Chama>) => {
    setAllChamas(prev =>
      prev.map(c => {
        if (c.id === chamaId) {
          const updated = { ...c, ...updates };
          fetch('/api/db/chamas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(err => console.error('Error updating chama:', err));
          return updated;
        }
        return c;
      })
    );
    return { success: true, message: `Chama updated successfully.` };
  };

  const deleteChama = (chamaId: string) => {
    setAllChamas(prev => {
      const remaining = prev.filter(c => c.id !== chamaId);
      if (activeChamaId === chamaId && remaining.length > 0) {
        setActiveChamaIdState(remaining[0].id);
      }
      return remaining;
    });

    fetch(`/api/db/chamas/${chamaId}`, {
      method: 'DELETE',
    }).catch(err => console.error('Error deleting chama:', err));

    return { success: true, message: `Chama workspace removed from database.` };
  };

  const adjustSubscriptionTier = (chamaId: string, tier: 'Starter' | 'Basic' | 'Growth' | 'Professional' | 'Enterprise' | string) => {
    const matchedTier = subscriptionTiers.find(t => t.id === tier || t.name === tier);
    const feeMap: Record<string, number> = {
      Starter: 0,
      Basic: 500,
      Growth: 1500,
      Professional: 2500,
      Enterprise: 5000,
    };
    const fee = matchedTier ? matchedTier.monthlyFeeKsh : (feeMap[tier] ?? 1000);
    return editChama(chamaId, {
      planTier: tier as any,
      monthlySubscriptionKsh: fee,
    });
  };

  const setChamaStatus = (chamaId: string, status: 'active' | 'suspended' | 'deactivated', reason?: string) => {
    const target = allChamas.find(c => c.id === chamaId);
    if (!target) return { success: false, message: 'Chama workspace not found.' };

    const statusAuditLog = {
      id: `audit-status-${Date.now()}`,
      chamaId,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actorName: 'Platform Super Admin',
      actorRole: 'super_admin' as Role,
      action: `CHAMA_${status.toUpperCase()}`,
      module: 'Tenant Lifecycle',
      details: `Workspace status changed to ${status.toUpperCase()}${reason ? `. Reason: ${reason}` : ''}`,
      severity: status === 'active' ? ('info' as const) : ('critical' as const),
    };

    const updated: Chama = {
      ...target,
      status,
      statusReason: reason || (status === 'suspended' ? 'Administrative / Subscription Hold' : status === 'deactivated' ? 'Workspace Deactivated' : ''),
      auditLogs: [statusAuditLog, ...(target.auditLogs || [])],
    };

    setAllChamas(prev => prev.map(c => c.id === chamaId ? updated : c));

    fetch('/api/db/chamas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(err => console.error('Error updating chama status:', err));

    return { 
      success: true, 
      message: `Chama "${target.name}" has been ${status.toUpperCase()}.${reason ? ` Reason: ${reason}` : ''}` 
    };
  };

  const updateSubscriptionTiers = (tiers: SubscriptionTier[]) => {
    setSubscriptionTiersState(tiers);
    try {
      localStorage.setItem('chamasmart_subscription_tiers', JSON.stringify(tiers));
    } catch {}

    fetch('/api/db/settings/subscription_tiers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tiers),
    }).catch(err => console.error('Error saving subscription tiers:', err));

    return { success: true, message: 'Commercial subscription tiers updated successfully.' };
  };

  const setSystemTillNumber = (till: string) => {
    const cleanTill = till.trim();
    setSystemTillNumberState(cleanTill);
    try {
      localStorage.setItem('chamasmart_system_till', cleanTill);
    } catch {}

    fetch('/api/db/settings/system_till_number', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanTill),
    }).catch(err => console.error('Error saving system till number:', err));

    return { success: true, message: `System Till Account Number updated to ${cleanTill}.` };
  };

  const pushSubscriptionBill = (
    chamaId: string, 
    bill: { amount: number; billingPeriod: string; dueDate: string; systemTillNumber?: string; reminderNote?: string }
  ) => {
    const target = allChamas.find(c => c.id === chamaId);
    if (!target) return { success: false, message: 'Chama workspace not found.', billId: '' };

    const chairPerson = target.members.find(m => m.role === 'chairperson');
    const billId = `bill-${Date.now()}`;
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const billNumber = `BILL-${dateStamp}-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectiveTill = bill.systemTillNumber?.trim() || target.systemTillNumber || systemTillNumber;
    const effectiveNote = bill.reminderNote?.trim() || `Kindly settle your monthly platform subscription fee of KSh ${bill.amount.toLocaleString()} for ${bill.billingPeriod} via System Till ${effectiveTill} on or before ${bill.dueDate}.`;

    const newBill: SubscriptionBill = {
      id: billId,
      billNumber,
      chamaId,
      chamaName: target.name,
      chairmanName: chairPerson?.name || 'Chama Chairperson',
      chairmanPhone: chairPerson?.phoneNumber || '+254700000000',
      amount: bill.amount,
      billingPeriod: bill.billingPeriod,
      dueDate: bill.dueDate,
      systemTillNumber: effectiveTill,
      reminderNote: effectiveNote,
      pushedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      pushedBy: 'Platform Super Admin',
      status: 'unpaid',
    };

    const billAuditLog = {
      id: `audit-bill-${Date.now()}`,
      chamaId,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actorName: 'Platform Super Admin',
      actorRole: 'super_admin' as Role,
      action: 'SUBSCRIPTION_BILL_PUSHED',
      module: 'Commercial SaaS Billing',
      details: `Generated bill ${billNumber} of KSh ${bill.amount.toLocaleString()} for ${bill.billingPeriod} sent to Chairman ${newBill.chairmanName} (${newBill.chairmanPhone}) via System Till ${effectiveTill}.`,
      severity: 'info' as const,
    };

    const updatedBills = [newBill, ...(target.subscriptionBills || [])];
    const newDebtPending = (target.debtPending || 0) + bill.amount;

    const updatedChama: Chama = {
      ...target,
      systemTillNumber: effectiveTill,
      debtPending: newDebtPending,
      reminderNote: effectiveNote,
      subscriptionBills: updatedBills,
      auditLogs: [billAuditLog, ...(target.auditLogs || [])],
    };

    setAllChamas(prev => prev.map(c => c.id === chamaId ? updatedChama : c));

    fetch('/api/db/chamas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedChama),
    }).catch(err => console.error('Error saving pushed bill:', err));

    return {
      success: true,
      message: `Subscription Bill ${billNumber} for KSh ${bill.amount.toLocaleString()} pushed to Chairman ${newBill.chairmanName}.`,
      billId,
    };
  };

  const updateTenantBilling = (
    chamaId: string, 
    updates: { systemTillNumber?: string; cashReceived?: number; debtPending?: number; reminderNote?: string }
  ) => {
    const target = allChamas.find(c => c.id === chamaId);
    if (!target) return { success: false, message: 'Chama workspace not found.' };

    const updatedChama: Chama = {
      ...target,
      ...(updates.systemTillNumber !== undefined ? { systemTillNumber: updates.systemTillNumber.trim() } : {}),
      ...(updates.cashReceived !== undefined ? { cashReceived: Number(updates.cashReceived) } : {}),
      ...(updates.debtPending !== undefined ? { debtPending: Number(updates.debtPending) } : {}),
      ...(updates.reminderNote !== undefined ? { reminderNote: updates.reminderNote.trim() } : {}),
    };

    setAllChamas(prev => prev.map(c => c.id === chamaId ? updatedChama : c));

    fetch('/api/db/chamas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedChama),
    }).catch(err => console.error('Error updating tenant billing:', err));

    return { success: true, message: `Billing settings updated for ${target.name}.` };
  };

  const recordSubscriptionPayment = (
    chamaId: string, 
    billId: string | undefined, 
    amount: number, 
    mpesaReceipt: string
  ) => {
    const target = allChamas.find(c => c.id === chamaId);
    if (!target) return { success: false, message: 'Chama workspace not found.' };

    const currentDebt = target.debtPending || 0;
    const newDebt = Math.max(0, currentDebt - amount);
    const newCash = (target.cashReceived || 0) + amount;

    const updatedBills = (target.subscriptionBills || []).map(b => {
      if (b.id === billId || (!billId && b.status === 'unpaid')) {
        return {
          ...b,
          status: 'paid' as const,
          paidAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          mpesaReceipt: mpesaReceipt.trim().toUpperCase(),
        };
      }
      return b;
    });

    const paymentAuditLog = {
      id: `audit-pay-${Date.now()}`,
      chamaId,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actorName: 'Platform Super Admin',
      actorRole: 'super_admin' as Role,
      action: 'SUBSCRIPTION_PAYMENT_RECORDED',
      module: 'Commercial SaaS Billing',
      details: `Recorded subscription payment of KSh ${amount.toLocaleString()} (M-Pesa Ref: ${mpesaReceipt.toUpperCase()}). Remaining debt: KSh ${newDebt.toLocaleString()}.`,
      severity: 'info' as const,
    };

    const newNote = newDebt === 0 
      ? 'Subscription dues are fully paid. Thank you!' 
      : `Partial payment of KSh ${amount.toLocaleString()} received. Remaining balance: KSh ${newDebt.toLocaleString()}.`;

    const updatedChama: Chama = {
      ...target,
      cashReceived: newCash,
      debtPending: newDebt,
      reminderNote: newNote,
      subscriptionBills: updatedBills,
      auditLogs: [paymentAuditLog, ...(target.auditLogs || [])],
    };

    setAllChamas(prev => prev.map(c => c.id === chamaId ? updatedChama : c));

    fetch('/api/db/chamas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedChama),
    }).catch(err => console.error('Error recording payment:', err));

    return {
      success: true,
      message: `Subscription payment of KSh ${amount.toLocaleString()} recorded for ${target.name}.`,
    };
  };

  const editMember = (chamaId: string, memberId: string, updates: Partial<Member>) => {
    setAllChamas(prev =>
      prev.map(c => {
        if (c.id === chamaId) {
          const updatedMembers = c.members.map(m => m.id === memberId ? { ...m, ...updates } : m);
          const updatedChama = { ...c, members: updatedMembers };
          fetch('/api/db/chamas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedChama),
          }).catch(err => console.error('Error updating member:', err));
          return updatedChama;
        }
        return c;
      })
    );
    return { success: true, message: `Member details updated successfully.` };
  };

  const removeMember = (chamaId: string, memberId: string) => {
    setAllChamas(prev =>
      prev.map(c => {
        if (c.id === chamaId) {
          const updatedMembers = c.members.filter(m => m.id !== memberId);
          const updatedChama = { ...c, members: updatedMembers };
          fetch('/api/db/chamas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedChama),
          }).catch(err => console.error('Error removing member:', err));
          return updatedChama;
        }
        return c;
      })
    );
    return { success: true, message: `Member removed from workspace.` };
  };

  const seedCleanScopedData = () => {
    resetToDefaults();
    return { success: true, message: 'Scoped tenant records re-seeded clean.' };
  };

  return (
    <ChamaContext.Provider
      value={{
        allChamas,
        activeChama,
        activePortal,
        currentMember,
        currentUser,
        isAuthenticated,
        isSuperAdminLoggedIn,
        userChamas,
        currentOfficialRole,
        searchQuery,
        setSearchQuery,
        setActiveChamaId,
        setActivePortal,
        setCurrentMemberId,
        setCurrentOfficialRole,
        loginMember,
        loginSuperAdmin,
        logout,
        registrationApplications,
        categoryOptions,
        addCategory,
        renameCategory,
        removeCategory,
        submitRegistrationApplication,
        reviewRegistrationApplication,
        assignMemberRole,
        createChama,
        editChama,
        deleteChama,
        editMember,
        removeMember,
        seedCleanScopedData,
        adjustSubscriptionTier,
        processMpesaPayment,
        applyForLoan,
        respondGuarantor,
        approveLoanByRole,
        disburseLoan,
        initiateWithdrawal,
        approveWithdrawal,
        transferFunds,
        advanceMerryGoRound,
        saveMeetingAttendance,
        saveMeetingMinutes,
        scheduleMeeting,
        updateMeetingStatus,
        deleteMeeting,
        castVote,
        addInvestmentAsset,
        addMember,
        updateMemberAccount,
        deleteMemberAccount,
        resetMemberPassword,
        exportSqlDump,
        isDbSyncing,
        dbSyncError,
        retryDbSync: () => setSyncAttempt(attempt => attempt + 1),
        resetToDefaults,
        subscriptionTiers,
        updateSubscriptionTiers,
        systemTillNumber,
        setSystemTillNumber,
        setChamaStatus,
        pushSubscriptionBill,
        updateTenantBilling,
        recordSubscriptionPayment,
      }}
    >
      {children}
    </ChamaContext.Provider>
  );
};

export const useChama = () => {
  const context = useContext(ChamaContext);
  if (!context) {
    throw new Error('useChama must be used within a ChamaProvider');
  }
  return context;
};
