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
  MeetingAttendance,
  InvestmentAsset,
  PaymentMethod,
  InterestMethod,
  ChamaRegistrationApplication
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
  userChamas: Chama[];
  currentOfficialRole: Role;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setActiveChamaId: (id: string) => void;
  setActivePortal: (portal: PortalType) => void;
  setCurrentMemberId: (id: string) => void;
  setCurrentOfficialRole: (role: Role) => void;
  
  // Auth methods
  loginMember: (identifier: string, pin?: string) => { success: boolean; message: string };
  loginSuperAdmin: (securityPin: string) => { success: boolean; message: string };
  logout: () => void;
  
  // Registration Applications & Governance
  registrationApplications: ChamaRegistrationApplication[];
  submitRegistrationApplication: (data: Omit<ChamaRegistrationApplication, 'id' | 'status' | 'submittedAt'>) => { success: boolean; applicationId: string; message: string };
  reviewRegistrationApplication: (applicationId: string, action: 'approve' | 'reject', reason?: string) => { success: boolean; newChamaId?: string; message: string };
  assignMemberRole: (memberId: string, newRole: Role) => { success: boolean; message: string };
  
  // Actions
  createChama: (chama: Partial<Chama>) => void;
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
  
  castVote: (electionId: string, positionId: string, candidateId: string) => void;
  
  addInvestmentAsset: (asset: Omit<InvestmentAsset, 'id' | 'chamaId'>) => void;
  
  addMember: (memberData: Omit<Member, 'id' | 'chamaId' | 'totalSavings' | 'sharesCount' | 'activeLoanBalance' | 'creditScore' | 'kycVerified' | 'attendanceRate' | 'status'>) => { success: boolean; message: string };
  
  // Database SQL Dump & Direct Storage
  exportSqlDump: () => Promise<{ success: boolean; dumpSql?: string; filename?: string; message: string }>;
  isDbSyncing: boolean;

  resetToDefaults: () => void;
}

const ChamaContext = createContext<ChamaContextType | undefined>(undefined);

const STORAGE_KEY = 'chamasmart_data_v1';
const APPLICATIONS_STORAGE_KEY = 'chamasmart_reg_apps_v1';

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
  const [allChamas, setAllChamas] = useState<Chama[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial
    }
    return INITIAL_CHAMAS;
  });

  const [registrationApplications, setRegistrationApplications] = useState<ChamaRegistrationApplication[]>(() => {
    try {
      const saved = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_REGISTRATION_APPLICATIONS;
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
  const [dbLoaded, setDbLoaded] = useState<boolean>(false);

  // Load authoritative data strictly from server-side database
  useEffect(() => {
    let isMounted = true;
    async function fetchDatabaseState() {
      try {
        setIsDbSyncing(true);
        const [chamasRes, appsRes] = await Promise.all([
          fetch('/api/db/chamas'),
          fetch('/api/db/applications'),
        ]);

        if (chamasRes.ok) {
          const chamasData = await chamasRes.json();
          if (isMounted && Array.isArray(chamasData) && chamasData.length > 0) {
            setAllChamas(chamasData);
          }
        }

        if (appsRes.ok) {
          const appsData = await appsRes.json();
          if (isMounted && Array.isArray(appsData)) {
            setRegistrationApplications(appsData);
          }
        }
      } catch (err) {
        console.warn('Database initialization fetch fallback active:', err);
      } finally {
        if (isMounted) {
          setIsDbSyncing(false);
          setDbLoaded(true);
        }
      }
    }

    fetchDatabaseState();
    return () => { isMounted = false; };
  }, []);

  // Synchronize state mutations to server database
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allChamas));
    } catch {
      // Handle storage quota error
    }

    if (!dbLoaded) return;

    const timer = setTimeout(() => {
      fetch('/api/db/chamas/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allChamas),
      }).catch(err => console.error('Error synchronizing with database:', err));
    }, 400);

    return () => clearTimeout(timer);
  }, [allChamas, dbLoaded]);

  useEffect(() => {
    try {
      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(registrationApplications));
    } catch {
      // Handle storage error
    }
  }, [registrationApplications]);

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

  const isAuthenticated = currentUser !== null || isSuperAdminLoggedIn;

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

  const loginMember = (identifier: string, _pin?: string) => {
    const clean = identifier.trim().toLowerCase();
    for (const chama of allChamas) {
      const found = chama.members.find(
        m => m.membershipNumber.toLowerCase() === clean ||
             m.phoneNumber.replace(/\s+/g, '') === clean.replace(/\s+/g, '') ||
             m.email.toLowerCase() === clean ||
             m.name.toLowerCase().includes(clean)
      );
      if (found) {
        setCurrentUser(found);
        setCurrentMemberId(found.id);
        setActiveChamaIdState(found.chamaId);
        setIsSuperAdminLoggedIn(false);

        if (['chairperson', 'treasurer', 'secretary', 'loan_officer'].includes(found.role)) {
          setActivePortal('officials');
          setCurrentOfficialRole(found.role);
        } else {
          setActivePortal('member');
        }

        return { success: true, message: `Karibu ${found.name}! Logged into ${chama.name}` };
      }
    }
    return { 
      success: false, 
      message: 'Credentials not recognized. Please check your phone number or membership number.' 
    };
  };

  const loginSuperAdmin = (securityPin: string) => {
    if (securityPin === 'Arabella@0258') {
      setIsSuperAdminLoggedIn(true);
      setCurrentUser(null);
      setActivePortal('super_admin');
      return { success: true, message: 'Authenticated as ChamaSmart Platform Super Admin' };
    }
    return { success: false, message: 'Invalid operator security password.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsSuperAdminLoggedIn(false);
    setActivePortal('member');
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
      actorName: activePortal === 'member' ? currentMember.name : `${currentOfficialRole.toUpperCase()} Official`,
      actorRole: activePortal === 'member' ? 'member' as Role : currentOfficialRole,
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

  // Add Member (Secretary or Chairperson capability)
  const addMember = (memberData: Omit<Member, 'id' | 'chamaId' | 'totalSavings' | 'sharesCount' | 'activeLoanBalance' | 'creditScore' | 'kycVerified' | 'attendanceRate' | 'status'>) => {
    // Check role authority if user is logged in
    const callerRole = currentUser ? currentUser.role : currentOfficialRole;
    if (currentUser && !['secretary', 'chairperson', 'super_admin'].includes(callerRole)) {
      return {
        success: false,
        message: 'Only the Secretary (or Chairperson) has authority to register and onboard new member accounts.',
      };
    }

    const newId = `mem-${Date.now()}`;
    const newMember: Member = {
      ...memberData,
      id: newId,
      chamaId: activeChama.id,
      totalSavings: 0,
      sharesCount: 0,
      activeLoanBalance: 0,
      creditScore: 720,
      kycVerified: true,
      attendanceRate: 100,
      status: 'active',
    };

    updateActiveChama(chama => {
      const newAuditLogs = addAuditLog(
        chama,
        'MEMBER_ONBOARDED',
        'Secretary Registry',
        `Secretary recorded and onboarded new member account: ${memberData.name} (${memberData.membershipNumber}, ${memberData.phoneNumber}).`
      );
      return {
        ...chama,
        members: [...chama.members, newMember],
        auditLogs: newAuditLogs,
      };
    });

    return {
      success: true,
      message: `Member ${memberData.name} (${memberData.membershipNumber}) registered successfully by the Secretary!`,
    };
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
  const createChama = (chamaData: Partial<Chama>) => {
    const newChama: Chama = {
      id: `chama-${Date.now()}`,
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
          id: `mem-founder-${Date.now()}`,
          chamaId: `chama-${Date.now()}`,
          name: 'Founding Chairperson',
          phoneNumber: '+254700000001',
          email: 'chair@newchama.or.ke',
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
          chamaId: `chama-${Date.now()}`,
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
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(APPLICATIONS_STORAGE_KEY);
    setAllChamas(INITIAL_CHAMAS);
    setRegistrationApplications(INITIAL_REGISTRATION_APPLICATIONS);
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
        submitRegistrationApplication,
        reviewRegistrationApplication,
        assignMemberRole,
        createChama,
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
        castVote,
        addInvestmentAsset,
        addMember,
        exportSqlDump,
        isDbSyncing,
        resetToDefaults,
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
