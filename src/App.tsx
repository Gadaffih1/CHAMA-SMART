/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChamaProvider, useChama } from './context/ChamaContext';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { MemberPortal } from './components/portals/MemberPortal';
import { OfficialsPortal } from './components/portals/OfficialsPortal';
import { SuperAdminPortal } from './components/portals/SuperAdminPortal';
import { ShieldCheck, Coins } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, activePortal } = useChama();

  // If not authenticated, render the official ChamaSmart Landing Page with Member Login Gateway
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Once authenticated, route into user's authorized workspace
  return (
    <div className="min-h-screen flex flex-col bg-[#f4fbf6] text-emerald-950 selection:bg-emerald-600 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Navigation Header with Profile & Multi-Chama Switcher */}
      <Header />

      {/* Main Content Area - Strictly Contained & Responsive */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
        {activePortal === 'member' && <MemberPortal />}
        {activePortal === 'officials' && <OfficialsPortal />}
        {activePortal === 'super_admin' && <SuperAdminPortal />}
      </main>

      {/* Authenticated Workspace Footer in Light Green & Emerald */}
      <footer className="bg-white/95 border-t border-emerald-200/80 mt-auto py-6 text-xs text-emerald-900/70 w-full shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-emerald-950">ChamaSmart Gold Edition</span>
            <span className="text-emerald-400">•</span>
            <span className="text-emerald-800/80">Kenya • East Africa Fintech</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] text-emerald-800/80">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Safaricom Daraja 2.0 Ready
            </span>
            <span>•</span>
            <span>Append-Only Ledgers</span>
            <span>•</span>
            <span>Data Protection Act 2019</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ChamaProvider>
      <MainAppContent />
    </ChamaProvider>
  );
}
