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
  Users, 
  TrendingUp, 
  FileText, 
  KeyRound, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Crown, 
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setLoginError('Please enter your Phone Number or Member ID.');
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const res = await loginMember(identifier, password);
      setIsLoading(false);
      if (!res.success) {
        setLoginError(res.message);
      }
    } catch (error) {
      console.error('Unable to log in:', error);
      setIsLoading(false);
      setLoginError('Unable to verify your account. Please try again.');
    }
  };

  const handleOperatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperatorError('');
    try {
      const res = await loginSuperAdmin(operatorPin);
      if (!res.success) {
        setOperatorError(res.message);
      } else {
        setShowOperatorModal(false);
      }
    } catch (error) {
      console.error('Unable to authenticate operator:', error);
      setOperatorError('Unable to verify the operator password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0e021a] text-purple-100 selection:bg-pink-500 selection:text-white w-full max-w-full overflow-x-hidden relative">
      {/* Dynamic Ambient Glow Orbs for Pink, Purple & Golden Theme */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[420px] sm:w-[650px] h-[420px] sm:h-[650px] bg-pink-600/15 rounded-full blur-[130px] pointer-events-none -z-0" />
      <div className="absolute top-1/4 right-10 w-[380px] sm:w-[600px] h-[380px] sm:h-[600px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute top-1/2 left-1/3 w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] bg-amber-500/12 rounded-full blur-[120px] pointer-events-none -z-0" />

      {/* Top Navigation */}
      <nav className="border-b border-purple-500/30 bg-[#160329]/90 backdrop-blur-md sticky top-0 z-40 w-full shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Mark */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="relative overflow-hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-amber-300 via-pink-500 to-purple-800 flex items-center justify-center text-white border-t border-white/60 border-b-2 border-purple-950 shadow-md shadow-purple-950/80 shrink-0">
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-amber-200 via-pink-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.35)]">
                  ChamaSmart
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                  Kenya Cloud
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-pink-300/80 font-bold tracking-wider">
                SAVINGS • LENDING • INVESTMENT
              </p>
            </div>
          </div>

          {/* Links & Register Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-6 text-xs text-purple-200/80 font-bold">
              <a href="#features" className="hover:text-amber-300 transition-colors">Platform Modules</a>
              <a href="#governance" className="hover:text-pink-300 transition-colors">Security & Governance</a>
            </div>

            {/* Glossy, Raised Game-Like Register Button */}
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="relative group overflow-hidden py-2 px-3.5 sm:px-4 rounded-xl bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 text-purple-950 font-black text-xs uppercase tracking-wider border-t-2 border-white/80 border-b-4 border-amber-800 shadow-[0_4px_0_#78350f,0_6px_16px_rgba(245,158,11,0.4)] hover:brightness-105 active:translate-y-1 active:border-b-2 active:shadow-[0_1px_0_#78350f] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent pointer-events-none rounded-t-[inherit]" />
              <Sparkles className="w-3.5 h-3.5 text-purple-950 shrink-0" />
              <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">Register Chama</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Member Login Gateway */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-16 sm:pb-20 border-b border-purple-900/50 w-full z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content / Value Proposition */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              
              {/* Exposed Kicker Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-900/90 via-fuchsia-950/80 to-amber-950/70 border-2 border-amber-400/40 text-amber-200 text-[11px] sm:text-xs font-bold shadow-[0_4px_16px_rgba(245,158,11,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Premier East Africa Financial Platform</span>
              </div>

              {/* Appealing, Exposed, Raised Game-Like Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Together We Save. <br />
                <span className="bg-gradient-to-r from-amber-300 via-pink-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(245,158,11,0.45)]">
                  Together We Grow.
                </span>
              </h1>

              {/* Crisp, High-Contrast Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-purple-100/90 max-w-xl leading-relaxed font-medium">
                A smarter standard for managing your chama savings, weekly table-banking loans, group land investments, and tamper-proof financial records.
              </p>

              {/* Action Buttons in Hero: Appealing, Raised, Glossy */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                {/* Primary Game Button: Golden 3D Raised */}
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="relative group overflow-hidden py-3.5 px-6 sm:px-7 rounded-2xl bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 text-purple-950 font-black text-xs sm:text-sm uppercase tracking-wider border-t-2 border-white/80 border-b-4 border-amber-900 shadow-[0_8px_0_#78350f,0_12px_24px_rgba(245,158,11,0.45)] hover:brightness-105 active:translate-y-1 active:border-b-2 active:shadow-[0_2px_0_#78350f] transition-all cursor-pointer flex items-center gap-2.5"
                >
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 via-white/15 to-transparent rounded-t-[inherit] pointer-events-none" />
                  <Sparkles className="w-4 h-4 text-purple-950 shrink-0" />
                  <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">Register a New Chama</span>
                  <ArrowRight className="w-4 h-4 text-purple-950 shrink-0" />
                </button>

                {/* Secondary Game Button: Raised Pink/Fuchsia */}
                <a
                  href="#login-box"
                  className="relative group overflow-hidden py-3.5 px-6 rounded-2xl bg-gradient-to-b from-fuchsia-600 via-pink-600 to-purple-800 text-white font-extrabold text-xs sm:text-sm tracking-wide border-t-2 border-fuchsia-300/60 border-b-4 border-purple-950 shadow-[0_8px_0_#3b0764,0_12px_24px_rgba(217,70,239,0.35)] hover:brightness-105 active:translate-y-1 active:border-b-2 active:shadow-[0_2px_0_#3b0764] transition-all cursor-pointer flex items-center gap-2"
                >
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-[inherit] pointer-events-none" />
                  <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Already Registered? Sign In</span>
                </a>
              </div>

              {/* 4 Feature Highlights Grid in Pink, Purple & Golden Raised Tiles */}
              <div id="features" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-3 sm:pt-5">
                
                {/* Tile 1: Savings */}
                <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-b from-[#240838]/90 via-[#1b052d]/90 to-[#140222]/95 border-2 border-purple-500/30 hover:border-amber-400/60 shadow-[0_8px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all group cursor-default">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-purple-950 flex items-center justify-center font-black text-xs mb-2.5 border-t border-white/60 border-b-2 border-amber-900 shadow-md">
                    <Coins className="w-5 h-5 text-purple-950" />
                  </div>
                  <h4 className="font-black text-white text-base group-hover:text-amber-200 transition-colors">
                    Savings
                  </h4>
                  <p className="text-xs text-purple-200/80 mt-1 leading-relaxed">
                    Track weekly & monthly contributions, table pools, and records.
                  </p>
                </div>

                {/* Tile 2: Loans */}
                <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-b from-[#240838]/90 via-[#1b052d]/90 to-[#140222]/95 border-2 border-purple-500/30 hover:border-pink-400/60 shadow-[0_8px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all group cursor-default">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-pink-400/60 to-transparent" />
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-pink-400 via-fuchsia-500 to-purple-700 text-white flex items-center justify-center font-black text-xs mb-2.5 border-t border-white/60 border-b-2 border-purple-950 shadow-md">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-black text-white text-base group-hover:text-pink-200 transition-colors">
                    Loans & Credit
                  </h4>
                  <p className="text-xs text-purple-200/80 mt-1 leading-relaxed">
                    Apply and repay with M-Pesa STK push & guarantor approvals.
                  </p>
                </div>

                {/* Tile 3: Investments */}
                <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-b from-[#240838]/90 via-[#1b052d]/90 to-[#140222]/95 border-2 border-purple-500/30 hover:border-amber-400/60 shadow-[0_8px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all group cursor-default">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 text-purple-950 flex items-center justify-center font-black text-xs mb-2.5 border-t border-white/60 border-b-2 border-amber-900 shadow-md">
                    <TrendingUp className="w-5 h-5 text-purple-950" />
                  </div>
                  <h4 className="font-black text-white text-base group-hover:text-amber-200 transition-colors">
                    Investments
                  </h4>
                  <p className="text-xs text-purple-200/80 mt-1 leading-relaxed">
                    Monitor land, real estate, money-market, and pooled assets.
                  </p>
                </div>

                {/* Tile 4: Reports */}
                <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-b from-[#240838]/90 via-[#1b052d]/90 to-[#140222]/95 border-2 border-purple-500/30 hover:border-pink-400/60 shadow-[0_8px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all group cursor-default">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent" />
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-fuchsia-500 via-purple-600 to-purple-800 text-white flex items-center justify-center font-black text-xs mb-2.5 border-t border-white/60 border-b-2 border-purple-950 shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-black text-white text-base group-hover:text-pink-200 transition-colors">
                    Reports & Audit
                  </h4>
                  <p className="text-xs text-purple-200/80 mt-1 leading-relaxed">
                    Automated audit-ready balance sheets and certified exports.
                  </p>
                </div>

              </div>
            </div>

            {/* Right: Prominent Member Login Card in Pink, Purple & Golden Raised Style */}
            <div id="login-box" className="lg:col-span-5">
              <div className="relative overflow-hidden bg-gradient-to-b from-[#220738]/95 via-[#180329]/95 to-[#120220]/98 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_30px_rgba(217,70,239,0.15)] backdrop-blur-xl">
                {/* Radiant Golden/Fuchsia Top Rim */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-fuchsia-500 via-amber-400 to-pink-500 shadow-[0_0_14px_rgba(245,158,11,0.6)]" />

                <div className="flex items-center justify-between pb-4 border-b border-purple-800/60">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <span className="bg-gradient-to-r from-white via-pink-100 to-amber-200 bg-clip-text text-transparent">
                        Member Login
                      </span>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </h2>
                    <p className="text-xs text-purple-200/80 mt-0.5">
                      Access your chama and personal financial dashboard.
                    </p>
                  </div>
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 text-purple-950 font-black flex items-center justify-center shadow-md">
                    <Lock className="w-4 h-4" />
                  </span>
                </div>

                {loginError && (
                  <div className="mt-4 p-3 bg-rose-950/90 border border-rose-600 rounded-xl text-xs text-rose-200 flex items-start gap-2 shadow-inner">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-200/90 mb-1 tracking-wide">
                      Phone Number / Member ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+2547XXXXXXXX or CS-TUM-005"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0e021a] border-2 border-purple-500/40 rounded-xl text-xs font-semibold text-white placeholder-purple-300/30 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 font-mono-num transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-amber-200/90 tracking-wide">
                        Password / PIN
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-pink-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0e021a] border-2 border-purple-500/40 rounded-xl text-xs font-semibold text-white placeholder-purple-300/30 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 font-mono-num transition-all shadow-inner"
                    />
                  </div>

                  {/* High-Impact Game-Like Raised Glossy Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative group overflow-hidden w-full py-3.5 rounded-2xl bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 text-purple-950 font-black text-xs sm:text-sm uppercase tracking-wider border-t-2 border-white/80 border-b-4 border-amber-900 shadow-[0_8px_0_#78350f,0_12px_24px_rgba(245,158,11,0.45)] hover:brightness-105 active:translate-y-1 active:border-b-2 active:shadow-[0_2px_0_#78350f] disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 via-white/15 to-transparent rounded-t-[inherit] pointer-events-none" />
                    <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                      {isLoading ? 'VERIFYING ACCOUNT...' : 'LOGIN TO MY CHAMA'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-purple-950 shrink-0" />
                  </button>

                  <div className="text-center pt-1 text-[11px] text-purple-200/80">
                    <span className="hover:text-amber-300 hover:underline cursor-pointer">Forgot password?</span>
                    <span className="mx-2">•</span>
                    <span>Contact your chama administrator</span>
                  </div>

                  <div className="pt-3 flex items-center justify-center gap-3 text-[10px] text-purple-300/70 border-t border-purple-800/60 mt-4">
                    <span className="flex items-center gap-1 font-semibold text-pink-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
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
      <section id="governance" className="py-12 sm:py-16 border-b border-purple-900/50 w-full z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Dashboard Access Based on User Role
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-2 font-medium">
              Strict permissions prevent unauthorized access and financial manipulation
            </p>
          </div>

          <div className="bg-[#1a042e]/95 border-2 border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[620px] text-xs text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-[#2c0847] via-[#210636] to-[#2c0847] text-amber-300 font-black border-b border-purple-500/40">
                    <th className="py-3.5 px-4 tracking-wider uppercase">Account Type</th>
                    <th className="py-3.5 px-4 tracking-wider uppercase">Workspace & Governance Access</th>
                    <th className="py-3.5 px-4 tracking-wider uppercase">Key Capabilities</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/50">
                  <tr className="hover:bg-purple-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-black text-amber-300 whitespace-nowrap">Chairperson</td>
                    <td className="py-3.5 px-4 text-purple-100 font-medium">Entire chama oversight and executive authorizations</td>
                    <td className="py-3.5 px-4 text-purple-200/90 font-medium">Dual approval for withdrawals & loans, AGM notices</td>
                  </tr>
                  <tr className="hover:bg-purple-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-black text-pink-300 whitespace-nowrap">Treasurer</td>
                    <td className="py-3.5 px-4 text-purple-100 font-medium">Financial records, accounting and cashbook</td>
                    <td className="py-3.5 px-4 text-purple-200/90 font-medium">M-Pesa STK push, fund allocations, initiate withdrawals</td>
                  </tr>
                  <tr className="hover:bg-purple-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-black text-fuchsia-300 whitespace-nowrap">Secretary</td>
                    <td className="py-3.5 px-4 text-purple-100 font-medium">Members, meetings and certified minutes</td>
                    <td className="py-3.5 px-4 text-purple-200/90 font-medium">Attendance registers, lateness fines, election ballots</td>
                  </tr>
                  <tr className="hover:bg-purple-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-black text-amber-200 whitespace-nowrap">Loan Committee</td>
                    <td className="py-3.5 px-4 text-purple-100 font-medium">Loan applications and credit appraisals</td>
                    <td className="py-3.5 px-4 text-purple-200/90 font-medium">Guarantor verification, disbursement triggers</td>
                  </tr>
                  <tr className="hover:bg-purple-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-black text-white whitespace-nowrap">Ordinary Member</td>
                    <td className="py-3.5 px-4 text-purple-100 font-medium">Personal records & permitted group information</td>
                    <td className="py-3.5 px-4 text-purple-200/90 font-medium">My savings, apply for loan, pay via M-Pesa, vote</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Discreet Operator Access */}
      <footer className="mt-auto py-8 bg-[#0b0114] text-xs text-purple-300/70 border-t border-purple-900/50 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-purple-100">ChamaSmart Kenya Cloud © 2026</span>
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
            {/* Discreet Operator Route */}
            <button
              type="button"
              onClick={() => setShowOperatorModal(true)}
              className="text-amber-400/80 hover:text-amber-200 flex items-center gap-0.5 transition cursor-pointer font-bold tracking-widest text-[8px] px-1 py-0.5 rounded hover:bg-purple-900/50 opacity-70 hover:opacity-100"
              title="Restricted Administrative Operator Gateway (OG)"
            >
              <KeyRound className="w-2 h-2 text-amber-400/90" />
              <span>OG</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Discreet Operator Gateway Modal */}
      {showOperatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#1a042e] border-2 border-amber-400/50 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-purple-100">
            <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
              <div className="flex items-center gap-2 text-white font-black text-sm">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Restricted Operator Access</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOperatorModal(false)}
                className="text-purple-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-purple-200/80">
              Administrative console for Platform Super Admin. Please provide master security password.
            </p>

            {operatorError && (
              <div className="p-2.5 bg-rose-950 border border-rose-700 rounded-xl text-[11px] text-rose-300">
                {operatorError}
              </div>
            )}

            <form onSubmit={handleOperatorSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-amber-200 block mb-1">
                  Operator Security Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter security password"
                  value={operatorPin}
                  onChange={(e) => setOperatorPin(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0e021a] border border-purple-500/40 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOperatorModal(false)}
                  className="px-3 py-1.5 text-xs text-purple-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="relative overflow-hidden px-4 py-1.5 bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 border-t border-white/60 border-b-2 border-amber-800 text-purple-950 font-black text-xs rounded-xl shadow-md active:translate-y-0.5 transition cursor-pointer"
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
