/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Coins, 
  Smartphone, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  FileText, 
  KeyRound, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Crown, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { PublicChamaRegistrationModal } from '../modules/PublicChamaRegistrationModal';

export const LandingPage: React.FC = () => {
  const { loginMember, loginSuperAdmin } = useChama();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Discreet Super Admin Operator Modal
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [operatorPin, setOperatorPin] = useState('');
  const [operatorError, setOperatorError] = useState('');

  // Public Chama Registration Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setLoginError('Please enter your Phone Number or Member ID.');
      return;
    }

    setIsLoading(true);
    setLoginError('');

    setTimeout(() => {
      const res = loginMember(identifier, password);
      setIsLoading(false);
      if (!res.success) {
        setLoginError(res.message);
      }
    }, 400);
  };

  const handleOperatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOperatorError('');
    const res = loginSuperAdmin(operatorPin);
    if (!res.success) {
      setOperatorError(res.message);
    } else {
      setShowOperatorModal(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-green-50 text-green-950 selection:bg-green-300 selection:text-green-950 w-full max-w-full overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="border-b border-green-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-green-600 via-emerald-500 to-lime-400 flex items-center justify-center text-white shadow-lg shadow-green-300/60 shrink-0">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-green-800 via-emerald-600 to-green-500 bg-clip-text text-transparent">
                  ChamaSmart
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-green-100 text-green-800 border border-green-300">
                  Green
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-green-800/70 font-medium">SAVINGS • LENDING • INVESTMENT</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-6 text-xs text-green-900/70 font-medium">
              <a href="#features" className="hover:text-green-600 transition">Platform Modules</a>
              <a href="#governance" className="hover:text-green-600 transition">Security & Governance</a>
            </div>

            {/* Public Chama Registration Button */}
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="py-1.5 px-3 sm:py-2 sm:px-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black text-xs rounded-xl shadow-md border border-green-500 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Register Chama</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Member Login Gateway */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-16 sm:pb-20 border-b border-green-200 w-full bg-gradient-to-b from-green-100/70 to-green-50">
        {/* Soft green ambient glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[500px] bg-green-300/30 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[400px] bg-lime-300/25 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content / Value Proposition */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-green-300 text-green-800 text-[11px] sm:text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span>Premier East Africa Financial Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-green-950">
                Together We Save. <br />
                <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-lime-600 bg-clip-text text-transparent">
                  Together We Grow.
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-green-900/80 max-w-xl leading-relaxed">
                A smarter, greener standard for managing your chama savings, weekly table-banking loans, group land investments, and tamper-proof financial records.
              </p>

              {/* Action Buttons in Hero */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="py-3 px-5 sm:px-6 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-500 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-green-300/70 border-2 border-green-400 flex items-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Register a New Chama</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                <a
                  href="#login-box"
                  className="py-3 px-5 text-green-800 hover:text-green-950 bg-white hover:bg-green-100 border border-green-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Already Registered? Sign In</span>
                </a>
              </div>

              {/* 4 Value Highlights Grid */}
              <div id="features" className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 border border-green-200 backdrop-blur-sm hover:border-green-400 hover:shadow-md hover:shadow-green-200/60 transition">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 flex items-center justify-center font-bold text-xs mb-2 border border-green-200">
                    <Coins className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-green-950 text-sm">Savings</h4>
                  <p className="text-xs text-green-900/65 mt-0.5">Track weekly & monthly contributions.</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 border border-green-200 backdrop-blur-sm hover:border-green-400 hover:shadow-md hover:shadow-green-200/60 transition">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2 border border-emerald-200">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-green-950 text-sm">Loans</h4>
                  <p className="text-xs text-green-900/65 mt-0.5">Apply and repay with M-Pesa STK push.</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 border border-green-200 backdrop-blur-sm hover:border-green-400 hover:shadow-md hover:shadow-green-200/60 transition">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-lime-100 to-green-100 text-lime-700 flex items-center justify-center font-bold text-xs mb-2 border border-lime-200">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-green-950 text-sm">Investments</h4>
                  <p className="text-xs text-green-900/65 mt-0.5">Monitor land, real estate & poultry assets.</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 border border-green-200 backdrop-blur-sm hover:border-green-400 hover:shadow-md hover:shadow-green-200/60 transition">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-teal-100 to-green-100 text-teal-700 flex items-center justify-center font-bold text-xs mb-2 border border-teal-200">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-green-950 text-sm">Reports</h4>
                  <p className="text-xs text-green-900/65 mt-0.5">Immutable audit & balance sheets.</p>
                </div>
              </div>
            </div>

            {/* Right: Prominent Member Login Card */}
            <div id="login-box" className="lg:col-span-5">
              <div className="bg-white border-2 border-green-300 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-green-200/70 relative overflow-hidden">
                {/* Green rim top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-lime-400 to-emerald-500"></div>

                <div className="flex items-center justify-between pb-4 border-b border-green-200">
                  <div>
                    <h2 className="text-xl font-black text-green-950 flex items-center gap-2">
                      <span>Member Login</span>
                      <Sparkles className="w-4 h-4 text-green-600" />
                    </h2>
                    <p className="text-xs text-green-900/70 mt-0.5">
                      Access your chama and personal financial dashboard.
                    </p>
                  </div>
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300 text-green-700 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </span>
                </div>

                {loginError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-green-900 mb-1">
                      Phone Number / Member ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+2547XXXXXXXX or CS-TUM-005"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-green-50 border border-green-300 rounded-xl text-xs font-medium text-green-950 placeholder-green-800/40 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono-num"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-green-900">
                        Password / PIN
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-green-700 hover:text-green-900 flex items-center gap-1"
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-green-50 border border-green-300 rounded-xl text-xs font-medium text-green-950 placeholder-green-800/40 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono-num"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-500 hover:via-emerald-500 hover:to-green-600 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-green-300/70 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>{isLoading ? 'Verifying Account...' : 'LOGIN TO MY CHAMA'}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>

                  <div className="text-center pt-1 text-[11px] text-green-800/70">
                    <span className="hover:text-green-950 hover:underline cursor-pointer">Forgot password?</span>
                    <span className="mx-2">•</span>
                    <span>Contact your chama administrator</span>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3 text-[10px] text-green-800/70 border-t border-green-200 mt-4">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                      Secure access
                    </span>
                    <span>•</span>
                    <span>Private financial records</span>
                    <span>•</span>
                    <span>Transparent management</span>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION: ROLE-BASED ACCESS MATRIX */}
      <section id="governance" className="py-12 sm:py-16 border-b border-green-200 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-green-950">
              Dashboard Access Based on User Role
            </h2>
            <p className="text-xs sm:text-sm text-green-900/70 mt-2">
              Strict permissions prevent unauthorized access and financial manipulation
            </p>
          </div>

          <div className="bg-white border border-green-300 rounded-3xl overflow-hidden shadow-xl shadow-green-200/50 w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[620px] text-xs text-left">
                <thead>
                  <tr className="bg-green-100 text-green-900 font-semibold border-b border-green-200">
                    <th className="py-3 px-4">Account Type</th>
                    <th className="py-3 px-4">Workspace & Governance Access</th>
                    <th className="py-3 px-4">Key Capabilities</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-100">
                  <tr className="hover:bg-green-50">
                    <td className="py-3.5 px-4 font-bold text-green-800 whitespace-nowrap">Chairperson</td>
                    <td className="py-3.5 px-4 text-green-950">Entire chama oversight and executive authorizations</td>
                    <td className="py-3.5 px-4 text-green-900/75">Dual approval for withdrawals & loans, AGM notices</td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="py-3.5 px-4 font-bold text-emerald-700 whitespace-nowrap">Treasurer</td>
                    <td className="py-3.5 px-4 text-green-950">Financial records, accounting and cashbook</td>
                    <td className="py-3.5 px-4 text-green-900/75">M-Pesa STK push, fund allocations, initiate withdrawals</td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="py-3.5 px-4 font-bold text-lime-700 whitespace-nowrap">Secretary</td>
                    <td className="py-3.5 px-4 text-green-950">Members, meetings and certified minutes</td>
                    <td className="py-3.5 px-4 text-green-900/75">Attendance registers, lateness fines, election ballots</td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="py-3.5 px-4 font-bold text-teal-700 whitespace-nowrap">Loan Committee</td>
                    <td className="py-3.5 px-4 text-green-950">Loan applications and credit appraisals</td>
                    <td className="py-3.5 px-4 text-green-900/75">Guarantor verification, disbursement triggers</td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="py-3.5 px-4 font-bold text-green-950 whitespace-nowrap">Ordinary Member</td>
                    <td className="py-3.5 px-4 text-green-950">Personal records & permitted group information</td>
                    <td className="py-3.5 px-4 text-green-900/75">My savings, apply for loan, pay via M-Pesa, vote</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Discreet Operator Access */}
      <footer className="mt-auto py-8 bg-green-100 text-xs text-green-900/70 border-t border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-green-600" />
            <span className="font-bold text-green-950">ChamaSmart © 2026</span>
            <span>•</span>
            <span>All rights reserved</span>
            <span>•</span>
            <span>Kenya • East Africa</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Data Protection Act 2019</span>
            <span>•</span>
            <span>Safaricom Daraja 2.0</span>
            <span>•</span>
            {/* Discreet Operator Route - Reduced size by 50% */}
            <button
              type="button"
              onClick={() => setShowOperatorModal(true)}
              className="text-green-800/80 hover:text-green-950 flex items-center gap-0.5 transition cursor-pointer font-bold tracking-widest text-[8px] px-1 py-0.5 rounded hover:bg-green-200/60 opacity-70 hover:opacity-100"
              title="Restricted Administrative Operator Gateway (OG)"
            >
              <KeyRound className="w-2 h-2 text-green-700" />
              <span>OG</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Discreet Operator Gateway Modal */}
      {showOperatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-green-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-green-300 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-green-200">
              <div className="flex items-center gap-2 text-green-950 font-bold text-sm">
                <Crown className="w-4 h-4 text-green-600" />
                <span>Restricted Operator Access</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOperatorModal(false)}
                className="text-green-700 hover:text-green-950"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-green-900/70">
              Administrative console for Platform Super Admin. Please provide master security key.
            </p>

            {operatorError && (
              <div className="p-2.5 bg-red-50 border border-red-300 rounded-xl text-[11px] text-red-800">
                {operatorError}
              </div>
            )}

            <form onSubmit={handleOperatorSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-green-900 block mb-1">
                  Operator Security Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter security password"
                  value={operatorPin}
                  onChange={(e) => setOperatorPin(e.target.value)}
                  className="w-full px-3 py-2 bg-green-50 border border-green-300 rounded-xl text-xs font-mono text-green-950 placeholder-green-800/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOperatorModal(false)}
                  className="px-3 py-1.5 text-xs text-green-800 hover:text-green-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Authorize Console
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Public Chama Registration Modal */}
      <PublicChamaRegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </div>
  );
};
