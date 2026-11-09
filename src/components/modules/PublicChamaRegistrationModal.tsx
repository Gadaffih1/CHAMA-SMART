/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  FileText, 
  Clock, 
  Crown, 
  Smartphone, 
  Info 
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { ChamaCategory } from '../../types';

interface PublicChamaRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicChamaRegistrationModal: React.FC<PublicChamaRegistrationModalProps> = ({ isOpen, onClose }) => {
  const { submitRegistrationApplication, categoryOptions } = useChama();

  const [chamaName, setChamaName] = useState('');
  const [category, setCategory] = useState<ChamaCategory>('table_banking');
  const [tagline, setTagline] = useState('Together we save, borrow and invest for community wealth');
  const [county, setCounty] = useState('Nairobi City County');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [applicantChairpersonName, setApplicantChairpersonName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('+254');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [initialMemberCount, setInitialMemberCount] = useState(15);
  const [planTier, setPlanTier] = useState<'Starter' | 'Basic' | 'Growth' | 'Professional' | 'Enterprise'>('Basic');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState('');

  useEffect(() => {
    if (!categoryOptions.includes(category) && categoryOptions[0]) setCategory(categoryOptions[0]);
  }, [category, categoryOptions]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chamaName.trim() || !applicantChairpersonName.trim()) return;

    const res = submitRegistrationApplication({
      chamaName: chamaName.trim(),
      category,
      tagline: tagline.trim(),
      county,
      country: 'Kenya',
      registrationNumber: registrationNumber.trim() || undefined,
      applicantChairpersonName: applicantChairpersonName.trim(),
      applicantPhone: applicantPhone.trim(),
      applicantEmail: applicantEmail.trim() || `${applicantChairpersonName.toLowerCase().replace(/\s+/g, '.')}@chama.ke`,
      initialMemberCount: Number(initialMemberCount),
      planTier,
    });

    if (res.success) {
      setSubmittedAppId(res.applicationId);
      setIsSubmitted(true);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setChamaName('');
    setApplicantChairpersonName('');
    setApplicantPhone('+254');
    setApplicantEmail('');
    setRegistrationNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-[#190918] rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border-2 border-amber-400/50 max-h-[92vh] flex flex-col text-rose-50">
        
        {/* Header with Pink & Gold theme */}
        <div className="bg-gradient-to-r from-rose-950 via-[#270c23] to-amber-950 p-5 sm:p-6 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-rose-950/60 shrink-0">
              <Crown className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">Register a New Chama</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Public Portal
                </span>
              </div>
              <p className="text-xs text-rose-200/70 mt-0.5">
                Apply for an isolated multi-tenant digital chama workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-rose-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {isSubmitted ? (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-amber-500/20 border-2 border-emerald-400/50 text-emerald-300 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-black text-white">Application Successfully Submitted!</h4>
              <p className="text-xs sm:text-sm text-rose-200/80 max-w-md mx-auto leading-relaxed">
                Your request to register <strong className="text-amber-300">{chamaName}</strong> has been transmitted to the <strong className="text-white">Platform Super Admin</strong> for review and validation.
              </p>
            </div>

            {/* Architecture Governance Flow card */}
            <div className="bg-[#120511] p-4 rounded-2xl border border-amber-500/30 text-left space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Next Automated Steps Upon Super Admin Approval:</span>
              </div>
              <ul className="space-y-2 text-rose-200/80 text-[11px] list-disc list-inside">
                <li>
                  <strong className="text-white">Chairperson as Chama Admin:</strong> {applicantChairpersonName} is granted full administrative ownership of the {chamaName} tenant account.
                </li>
                <li>
                  <strong className="text-white">Member Onboarding:</strong> Your designated Secretary will be authorized to register and invite member accounts.
                </li>
                <li>
                  <strong className="text-white">Role Governance:</strong> The Chairperson will assign roles (Treasurer, Secretary, Loan Officers) within the isolated workspace.
                </li>
                <li>
                  <strong className="text-white">Zero Data Overlap:</strong> Dedicated tenant isolation guarantees strictly zero cross-over data with other chamas.
                </li>
              </ul>
              <div className="pt-2 border-t border-rose-950 text-[10px] text-amber-400/90 font-mono">
                Tracking Application Reference: {submittedAppId}
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-950/60 transition"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
            
            {/* Explanatory callout */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/70 to-amber-950/60 border border-amber-500/30 text-xs text-rose-200/90 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-snug">
                <span className="font-bold text-amber-300 block">Enterprise Community Onboarding</span>
                <p className="text-[11px] text-rose-200/70">
                  Following Super Admin approval, the registered Chairperson becomes the Chama Admin with full rights. The Secretary can add member accounts, and the Chairperson assigns executive roles with strict tenant data isolation.
                </p>
              </div>
            </div>

            {/* Chama Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-rose-950 pb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Chama & Group Information</span>
              </h4>

              <div>
                <label className="text-xs font-semibold text-amber-200/90 block mb-1">
                  Chama / Group Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kilimani Urban Investors Table Banking"
                  value={chamaName}
                  onChange={(e) => setChamaName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#120511] border border-amber-500/30 rounded-xl text-white placeholder-rose-300/30 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-amber-200/90 block mb-1">
                    Operating Model / Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ChamaCategory)}
                    className="w-full text-xs px-3 py-2.5 bg-[#120511] border border-amber-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {categoryOptions.map(option => (
                      <option key={option} value={option}>{option.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-amber-200/90 block mb-1">
                    County / Geographical Region *
                  </label>
                  <input
                    type="text"
                    required
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#120511] border border-amber-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-amber-200/90 block mb-1">
                    Official Registration No. (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SHG/NRB/2026/1942"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full text-xs font-mono px-3.5 py-2.5 bg-[#120511] border border-amber-500/30 rounded-xl text-white placeholder-rose-300/30 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-amber-200/90 block mb-1">
                    Estimated Members
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    value={initialMemberCount}
                    onChange={(e) => setInitialMemberCount(Number(e.target.value))}
                    className="w-full text-xs font-mono-num px-3.5 py-2.5 bg-[#120511] border border-amber-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Founding Chairperson Details */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-rose-950 pb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Founding Chairperson (Tenant Admin)</span>
              </h4>

              <div>
                <label className="text-xs font-semibold text-amber-200/90 block mb-1">
                  Chairperson Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Mwende Mutiso"
                  value={applicantChairpersonName}
                  onChange={(e) => setApplicantChairpersonName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#120511] border border-amber-500/30 rounded-xl text-white placeholder-rose-300/30 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-amber-200/90 block mb-1">
                    M-Pesa Registered Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+2547XXXXXXXX"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full text-xs font-mono px-3.5 py-2.5 bg-[#120511] border border-amber-500/30 rounded-xl text-white placeholder-rose-300/30 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-amber-200/90 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="chair@chama.ke"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#120511] border border-amber-500/30 rounded-xl text-white placeholder-rose-300/30 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Plan Tier Selection */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-amber-200/90 block">
                Desired Platform Subscription Tier
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { id: 'Starter', label: 'Starter', price: 'Free', sub: 'Free' },
                  { id: 'Basic', label: 'Basic', price: '500/- mo', sub: 'Up to 10' },
                  { id: 'Growth', label: 'Growth', price: '1,500/- mo', sub: 'Up to 30' },
                  { id: 'Professional', label: 'Professional', price: '2,500/- mo', sub: 'Up to 50' },
                  { id: 'Enterprise', label: 'Enterprise', price: 'Custom', sub: 'Over 50' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setPlanTier(tier.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      planTier === tier.id
                        ? 'bg-gradient-to-br from-rose-900/60 to-amber-900/60 border-amber-400 text-white ring-1 ring-amber-400'
                        : 'bg-[#120511] border-rose-950 text-rose-200/70 hover:border-amber-500/30'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block text-white">{tier.label}</span>
                      <span className="text-[10px] text-amber-300 font-mono-num">{tier.price}</span>
                    </div>
                    <span className="text-[9px] text-rose-300/60 mt-1">{tier.sub} members</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Isolation Guarantee */}
            <div className="bg-[#120511] p-3 rounded-xl border border-amber-500/20 text-[11px] text-rose-200/70 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Strict multi-tenant security: Each chama workspace is mathematically scoped. No cross-over access permitted.
              </span>
            </div>

            {/* Form Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-rose-950">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-semibold text-rose-300 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-950/60 flex items-center gap-2 transition cursor-pointer"
              >
                <span>Submit for SuperAdmin Approval</span>
                <ArrowRight className="w-4 h-4 text-amber-200" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
