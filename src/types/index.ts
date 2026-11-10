/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 
  | 'member' 
  | 'chairperson' 
  | 'treasurer' 
  | 'secretary' 
  | 'loan_officer' 
  | 'super_admin';

export type PortalType = 'member' | 'officials' | 'super_admin';

export type ChamaCategory = string;

export const DEFAULT_CHAMA_CATEGORIES: ChamaCategory[] = [
  'weekly_savings',
  'table_banking',
  'investment',
  'merry_go_round',
  'welfare_group',
];

export type RegistrationStatus = 'pending_approval' | 'approved' | 'rejected';

export interface ChamaRegistrationApplication {
  id: string;
  chamaName: string;
  category: ChamaCategory;
  tagline: string;
  county: string;
  country: string;
  registrationNumber?: string;
  applicantChairpersonName: string;
  applicantPhone: string;
  applicantEmail: string;
  initialMemberCount: number;
  planTier: 'Starter' | 'Basic' | 'Growth' | 'Professional' | 'Enterprise';
  status: RegistrationStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  superAdminNotes?: string;
  applicantPassword?: string;
  hasPassword?: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  monthlyFeeKsh: number;
  memberLimitText: string;
  maxMembers: number;
  description: string;
  badgeColor?: string;
  features?: string[];
}

export const DEFAULT_SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  { id: 'Starter', name: 'Starter', monthlyFeeKsh: 0, memberLimitText: 'Free up to 5 members', maxMembers: 5, description: 'Basic record keeping for newly formed tables' },
  { id: 'Basic', name: 'Basic', monthlyFeeKsh: 500, memberLimitText: 'Up to 10 members', maxMembers: 10, description: '500/- per month for up to 10 members' },
  { id: 'Growth', name: 'Growth', monthlyFeeKsh: 1500, memberLimitText: 'Up to 30 members', maxMembers: 30, description: '1,500/- per month for up to 30 members' },
  { id: 'Professional', name: 'Professional', monthlyFeeKsh: 2500, memberLimitText: 'Up to 50 members', maxMembers: 50, description: '2,500/- per month for up to 50 members' },
  { id: 'Enterprise', name: 'Enterprise', monthlyFeeKsh: 5000, memberLimitText: 'Over 50 members', maxMembers: 9999, description: 'Custom scale and priority SLA for large investment syndicates' },
];

export interface SubscriptionBill {
  id: string;
  billNumber: string;
  chamaId: string;
  chamaName: string;
  chairmanName: string;
  chairmanPhone: string;
  amount: number;
  billingPeriod: string; // e.g. "November 2026"
  dueDate: string;
  systemTillNumber: string;
  reminderNote: string;
  pushedAt: string;
  pushedBy: string;
  status: 'unpaid' | 'paid' | 'overdue' | 'waived';
  paidAt?: string;
  mpesaReceipt?: string;
  notes?: string;
}

export type FundType = 
  | 'general_savings' 
  | 'loan_revolving' 
  | 'welfare' 
  | 'investment' 
  | 'emergency' 
  | 'administrative';

export interface FundAccount {
  id: string;
  type: FundType;
  name: string;
  balance: number;
  description: string;
  color: string;
}

export interface Member {
  id: string;
  chamaId: string;
  name: string;
  phoneNumber: string;
  email: string;
  passwordHash?: string;
  membershipNumber: string;
  joinedDate: string;
  role: Role;
  avatarUrl?: string;
  totalSavings: number;
  sharesCount: number;
  activeLoanBalance: number;
  creditScore: number; // 300 - 850
  nextOfKin: {
    name: string;
    relationship: string;
    phone: string;
  };
  kycVerified: boolean;
  attendanceRate: number; // Percentage
  status: 'active' | 'suspended' | 'resigned';
}

export type LoanProductType = 
  | 'emergency' 
  | 'weekly_revolving' 
  | 'monthly_development' 
  | 'table_banking_instant' 
  | 'asset_financing';

export type InterestMethod = 'flat' | 'simple_weekly' | 'reducing_balance';

export interface LoanProduct {
  id: string;
  name: string;
  type: LoanProductType;
  description: string;
  interestRate: number; // e.g. 5%
  interestMethod: InterestMethod;
  maxAmount: number;
  minAmount: number;
  maxWeeks: number;
  guarantorsRequired: number;
}

export type LoanStatus = 
  | 'submitted' 
  | 'awaiting_guarantors' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'disbursed' 
  | 'completed' 
  | 'defaulted';

export interface LoanGuarantor {
  memberId: string;
  memberName: string;
  amountGuaranteed: number;
  status: 'pending' | 'accepted' | 'declined';
  respondedAt?: string;
}

export interface LoanRepayment {
  id: string;
  amount: number;
  date: string;
  mpesaReceipt?: string;
  recordedBy: string;
  balanceAfter: number;
}

export interface Loan {
  id: string;
  chamaId: string;
  borrowerId: string;
  borrowerName: string;
  productId: string;
  productName: string;
  principal: number;
  interestRate: number;
  interestMethod: InterestMethod;
  interestAmount: number;
  totalPayable: number;
  balanceRemaining: number;
  durationWeeks: number;
  weeklyInstalment: number;
  appliedDate: string;
  approvedDate?: string;
  disbursedDate?: string;
  dueDate: string;
  purpose: string;
  status: LoanStatus;
  guarantors: LoanGuarantor[];
  approvedByChairperson?: boolean;
  approvedByTreasurer?: boolean;
  repayments: LoanRepayment[];
}

export type ContributionStatus = 'paid' | 'pending' | 'overdue' | 'waived';

export interface Contribution {
  id: string;
  chamaId: string;
  memberId: string;
  memberName: string;
  cycleName: string; // e.g. "Week 45 - Nov 2026"
  targetAmount: number;
  paidAmount: number;
  penaltyAmount: number;
  dueDate: string;
  paidDate?: string;
  status: ContributionStatus;
  mpesaReceipt?: string;
  fundAllocations: {
    fundType: FundType;
    amount: number;
  }[];
}

export type TransactionType = 
  | 'contribution' 
  | 'loan_disbursement' 
  | 'loan_repayment' 
  | 'withdrawal' 
  | 'investment_purchase' 
  | 'investment_income' 
  | 'fund_transfer' 
  | 'penalty_payment' 
  | 'merry_go_round_payout';

export type PaymentMethod = 'mpesa_stk' | 'mpesa_c2b' | 'bank_transfer' | 'cash';

export interface Transaction {
  id: string;
  chamaId: string;
  reference: string; // e.g. "TX-2026-9812"
  mpesaReceipt?: string;
  date: string;
  type: TransactionType;
  amount: number;
  description: string;
  fundType: FundType;
  memberId?: string;
  memberName?: string;
  initiatedBy: string;
  approvedBy?: string;
  status: 'pending_approval' | 'confirmed' | 'reversed';
  paymentMethod: PaymentMethod;
  reversalReason?: string;
  reversalRef?: string;
}

export interface PendingWithdrawal {
  id: string;
  chamaId: string;
  amount: number;
  fundType: FundType;
  purpose: string;
  recipientName: string;
  recipientPhone: string;
  initiatedBy: string; // Treasurer
  initiatedAt: string;
  approvedBy?: string; // Chairperson
  approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface InvestmentAsset {
  id: string;
  chamaId: string;
  title: string;
  category: 'land' | 'real_estate' | 'business' | 'shares' | 'equipment';
  acquisitionCost: number;
  currentValuation: number;
  acquisitionDate: string;
  location?: string;
  titleDeedOrReg?: string;
  monthlyRevenue: number;
  monthlyExpenses: number;
  status: 'active' | 'under_development' | 'sold';
  notes: string;
}

export interface MerryGoRoundRotation {
  id: string;
  chamaId: string;
  cycleNumber: number;
  roundName: string;
  contributionPerMember: number;
  payoutAmount: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  membersOrder: {
    order: number;
    memberId: string;
    memberName: string;
    payoutDate: string;
    isPaid: boolean;
    paidDate?: string;
    mpesaReceipt?: string;
  }[];
  currentTurnIndex: number;
}

export interface MeetingAttendance {
  memberId: string;
  memberName: string;
  status: 'present' | 'absent_with_apology' | 'absent_without_apology' | 'late';
  fineAmount: number;
  finePaid: boolean;
}

export interface Meeting {
  id: string;
  chamaId: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  isVirtual: boolean;
  virtualLink?: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  agendaItems: string[];
  minutes?: string;
  actionPoints?: string[];
  attendance: MeetingAttendance[];
}

export interface ElectionCandidate {
  candidateId: string;
  candidateName: string;
  manifesto: string;
  votesCount: number;
}

export interface ElectionPosition {
  id: string;
  title: 'Chairperson' | 'Treasurer' | 'Secretary' | 'Loan Committee Head';
  candidates: ElectionCandidate[];
}

export interface Election {
  id: string;
  chamaId: string;
  title: string;
  termPeriod: string;
  status: 'upcoming' | 'active' | 'closed';
  startDate: string;
  endDate: string;
  positions: ElectionPosition[];
  votedMemberIds: string[];
}

export interface AuditLog {
  id: string;
  chamaId: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Chama {
  id: string;
  name: string;
  category: ChamaCategory;
  tagline: string;
  county: string;
  country: string;
  registrationNumber: string;
  formedDate: string;
  currency: string; // 'KSh'
  planTier: 'Starter' | 'Basic' | 'Growth' | 'Professional' | 'Enterprise';
  monthlySubscriptionKsh: number;
  mpesaPaybillOrTill: string;
  accountNumber: string;
  funds: FundAccount[];
  loanProducts: LoanProduct[];
  members: Member[];
  loans: Loan[];
  contributions: Contribution[];
  transactions: Transaction[];
  pendingWithdrawals: PendingWithdrawal[];
  investments: InvestmentAsset[];
  merryGoRound?: MerryGoRoundRotation;
  meetings: Meeting[];
  elections: Election[];
  auditLogs: AuditLog[];
  // Platform Tenant Management & Subscription Billing
  status?: 'active' | 'suspended' | 'deactivated';
  statusReason?: string;
  systemTillNumber?: string;
  cashReceived?: number;
  debtPending?: number;
  reminderNote?: string;
  subscriptionBills?: SubscriptionBill[];
}
