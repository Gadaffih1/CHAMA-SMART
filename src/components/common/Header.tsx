/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  User, 
  ShieldCheck, 
  Globe, 
  Smartphone, 
  RotateCcw, 
  Check, 
  Crown, 
  LogOut, 
  Sparkles,
  Database
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { PortalType, Role } from '../../types';
import { MpesaModal } from './MpesaModal';
import { NewChamaModal } from '../modules/NewChamaModal';
import { PublicChamaRegistrationModal } from '../modules/PublicChamaRegistrationModal';
import { SqlDumpModal } from './SqlDumpModal';

export const Header: React.FC = () => {
  const { 
    allChamas, 
    activeChama, 
    activePortal, 
    currentMember, 
    currentUser, 
    isSuperAdminLoggedIn, 
    userChamas, 
    currentOfficialRole, 
    setActiveChamaId, 
    setActivePortal, 
    setCurrentOfficialRole, 
    logout, 
    exportSqlDump,
    resetToDefaults 
  } = useChama();

  const [isChamaDropdownOpen, setIsChamaDropdownOpen] = useState(false);
  const [isNewChamaModalOpen, setIsNewChamaModalOpen] = useState(false);
  const [isPublicRegModalOpen, setIsPublicRegModalOpen] = useState(false);
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [isSqlDumpModalOpen, setIsSqlDumpModalOpen] = useState(false);

  const handleReset = () => {
    if (confirm('Reset ChamaSmart system records back to initial state?')) {
      resetToDefaults();
    }
  };

  const isOfficial = currentUser && ['chairperson', 'treasurer', 'secretary', 'loan_officer'].includes(currentUser.role);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#fffbfc]/98 backdrop-blur-md border-b border-amber-200/80 shadow-xs w-full">
        {/* Main Navigation Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5 sm:py-3 gap-2 sm:gap-4">
            
            {/* Logo and Wordmark */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100 shrink-0" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-nowrap">
                  <span className="font-black text-base sm:text-xl tracking-tight bg-gradient-to-r from-rose-900 via-pink-800 to-amber-600 bg-clip-text text-transparent whitespace-nowrap">
                    ChamaSmart
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                    Gold
                  </span>
                </div>
                <p className="hidden md:block text-[10px] text-amber-800/70 font-medium whitespace-nowrap">
                  SAVINGS • LENDING • INVESTMENT
                </p>
              </div>
            </div>

            {/* Right: User Profile & Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 flex-nowrap">
              {/* Logged in member badge (desktop only) */}
              {currentUser && (
                <div className="hidden xl:flex items-center gap-2 bg-rose-50/80 border border-amber-200/80 rounded-xl px-2.5 py-1 text-xs shrink-0">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 text-white font-bold flex items-center justify-center text-[11px] shadow-xs shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="max-w-[130px] truncate">
                    <div className="font-bold text-rose-950 leading-none truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-amber-800/80 capitalize font-medium truncate">{currentUser.role.replace('_', ' ')}</div>
                  </div>
                </div>
              )}

              {/* Database SQL Dump Quick Export */}
              <button
                type="button"
                onClick={() => setIsSqlDumpModalOpen(true)}
                title="Download Database SQL Dump (.sql)"
                className="py-1.5 px-2 sm:px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Database className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="hidden sm:inline text-[11px]">SQL Dump</span>
              </button>

              {/* M-Pesa Quick Pay Button with Golden trim */}
              <button
                type="button"
                onClick={() => setIsMpesaModalOpen(true)}
                className="py-1.5 px-2 sm:px-2.5 sm:px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-xs border border-emerald-400/30 transition flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
                <span className="text-[11px] sm:text-xs">M-Pesa STK</span>
              </button>

              {/* Sign Out / Logout Button */}
              <button
                type="button"
                onClick={logout}
                title="Log out back to Home"
                className="py-1.5 px-2 sm:px-2.5 text-rose-900 hover:text-rose-700 bg-rose-100/60 hover:bg-rose-200/60 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline text-xs">Sign Out</span>
              </button>

              {/* Reset Records */}
              <button
                type="button"
                onClick={handleReset}
                title="Reset system records"
                className="p-1.5 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Workspace Navigation Bar - Strictly Non-Overlapping */}
        <div className="border-t border-rose-100/80 bg-gradient-to-r from-[#fff9fb] via-[#fffdf9] to-[#fff9fb] py-2 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            
            {/* Left: Chama Workspace Switcher */}
            <div className="flex items-center gap-2">
              {!isSuperAdminLoggedIn ? (
                <div className="relative w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsChamaDropdownOpen(!isChamaDropdownOpen)}
                    className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 bg-white hover:bg-rose-50/70 border border-amber-300/80 rounded-xl text-xs font-semibold text-rose-950 transition cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-bold text-amber-900/70 text-[10px] uppercase">Workspace:</span>
                      <span className="truncate max-w-[200px] sm:max-w-[240px] font-bold text-rose-950">
                        {activeChama.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {userChamas.length > 1 && (
                        <span className="text-[9px] bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                          {userChamas.length}
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 text-amber-700/60 transition-transform ${isChamaDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Dropdown with Outside Click Backdrop */}
                  {isChamaDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-black/10" 
                        onClick={() => setIsChamaDropdownOpen(false)}
                      />
                      <div className="absolute left-0 mt-2 w-full sm:w-80 bg-white rounded-2xl shadow-2xl border border-amber-300 p-2 z-50">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80 px-3 py-1.5 flex justify-between border-b border-rose-100">
                          <span>Your Authorized Chamas</span>
                          <span className="text-rose-600 font-mono">{userChamas.length} Available</span>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                          {userChamas.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setActiveChamaId(c.id);
                                setIsChamaDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                                c.id === activeChama.id
                                  ? 'bg-rose-50 text-rose-900 font-bold border border-rose-200'
                                  : 'text-slate-700 hover:bg-amber-50/60'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <div className="font-semibold truncate">{c.name}</div>
                                <div className="text-[10px] text-amber-700/70">{c.category.replace('_', ' ')} • {c.county}</div>
                              </div>
                              {c.id === activeChama.id && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                            </button>
                          ))}
                        </div>

                        {/* Other Chamas Option */}
                        <div className="border-t border-amber-100 mt-1 pt-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800/60 px-3 py-1">
                            Other Registered Chamas
                          </div>
                          {allChamas
                            .filter(c => !userChamas.some(uc => uc.id === c.id))
                            .map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setActiveChamaId(c.id);
                                  setIsChamaDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-rose-50/50 transition truncate"
                              >
                                <div className="truncate font-medium">{c.name}</div>
                              </button>
                            ))}

                          <button
                            type="button"
                            onClick={() => {
                              setIsChamaDropdownOpen(false);
                              setIsPublicRegModalOpen(true);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition flex items-center gap-2 mt-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-600" />
                            <span>Register a New Chama (Requires Approval)</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-950 to-amber-950 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>SaaS Master Multi-Tenant Console</span>
                </div>
              )}
            </div>

            {/* Right: Workspace Portal Desk Switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl text-xs font-bold shrink-0 border border-amber-300/80 shadow-2xs overflow-x-auto no-scrollbar w-full sm:w-auto">
              {/* Member Self-Service Tab */}
              <button
                type="button"
                onClick={() => setActivePortal('member')}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                  activePortal === 'member'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs'
                    : 'text-rose-950 hover:bg-rose-50/80'
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="shrink-0">Member Portal</span>
              </button>

              {/* Officials Desk Tab */}
              {(isOfficial || isSuperAdminLoggedIn) && (
                <button
                  type="button"
                  onClick={() => setActivePortal('officials')}
                  className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                    activePortal === 'officials'
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-xs'
                      : 'text-amber-950 hover:bg-amber-50/80'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="shrink-0">Officials Desk</span>
                </button>
              )}

              {/* Super Admin Tab */}
              {isSuperAdminLoggedIn && (
                <button
                  type="button"
                  onClick={() => setActivePortal('super_admin')}
                  className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                    activePortal === 'super_admin'
                      ? 'bg-gradient-to-r from-slate-900 to-rose-950 text-amber-300 shadow-xs'
                      : 'text-rose-950 hover:bg-rose-50/80'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="shrink-0">SaaS Admin</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* M-Pesa Modal */}
      <MpesaModal
        isOpen={isMpesaModalOpen}
        onClose={() => setIsMpesaModalOpen(false)}
        type="contribution"
        defaultAmount={1000}
        title="M-Pesa Contribution Payment"
      />

      {/* New Chama Modal (Admin direct) */}
      <NewChamaModal
        isOpen={isNewChamaModalOpen}
        onClose={() => setIsNewChamaModalOpen(false)}
      />

      {/* Public Chama Registration Modal (Public request with SuperAdmin Approval) */}
      <PublicChamaRegistrationModal
        isOpen={isPublicRegModalOpen}
        onClose={() => setIsPublicRegModalOpen(false)}
      />

      {/* SQL Dump Export & Download Modal */}
      <SqlDumpModal
        isOpen={isSqlDumpModalOpen}
        onClose={() => setIsSqlDumpModalOpen(false)}
      />
    </>
  );
};
