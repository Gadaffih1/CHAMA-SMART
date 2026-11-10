/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  ArrowRight, 
  Copy, 
  Share2, 
  FileText 
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { FundType } from '../../types';

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
  type: 'contribution' | 'loan_repayment';
  loanId?: string;
  title?: string;
}

export const MpesaModal: React.FC<MpesaModalProps> = ({
  isOpen,
  onClose,
  defaultAmount = 1000,
  type,
  loanId,
  title = 'Pay with Safaricom M-Pesa',
}) => {
  const { currentMember, activeChama, processMpesaPayment } = useChama();
  
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [phoneNumber, setPhoneNumber] = useState<string>(currentMember.phoneNumber || '+254712345678');
  const [step, setStep] = useState<'input' | 'stk_prompt' | 'processing' | 'success'>('input');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [receipt, setReceipt] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleInitiateSTK = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('stk_prompt');
  };

  const handleConfirmPin = async () => {
    setStep('processing');
    try {
      const res = await processMpesaPayment({
        amount: Number(amount),
        phone: phoneNumber,
        description: type === 'contribution' ? `Week Contribution - ${activeChama.name}` : `Loan Repayment (${loanId})`,
        type,
        memberId: currentMember.id,
        loanId,
      });
      setReceipt(res.receiptNumber);
      setStep('success');
    } catch {
      setStep('input');
    }
  };

  const handleCopyReceipt = () => {
    navigator.clipboard?.writeText(receipt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-amber-300/60 ring-4 ring-rose-500/10 max-h-[92vh] flex flex-col"
      >
        {/* Header with Safaricom M-Pesa green accent framed with gold */}
        <div className="bg-[#008744] text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-400/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-extrabold text-lg tracking-wider text-amber-200">
              M
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">{title}</h3>
              <p className="text-xs text-emerald-100 flex items-center gap-1">
                <span className="text-amber-300">★</span> Safaricom Daraja Instant STK Push
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {step === 'input' && (
            <form onSubmit={handleInitiateSTK} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Direct Chama Settlement:</span> Funds are credited in real-time to {activeChama.name} ({activeChama.mpesaPaybillOrTill}).
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  M-Pesa Registered Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+2547XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono-num"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">An STK pop-up prompt will be sent to this phone.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Amount to Pay (KSh)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">KSh</span>
                  <input
                    type="number"
                    min="50"
                    max="150000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono-num"
                  />
                </div>
                {type === 'contribution' && (
                  <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                    <div className="font-semibold text-slate-700">Automatic Fund Allocations:</div>
                    <div className="flex justify-between">
                      <span>• General Savings (60%):</span>
                      <span className="font-mono-num font-medium">KSh {Math.round(amount * 0.6).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Welfare Fund (20%):</span>
                      <span className="font-mono-num font-medium">KSh {Math.round(amount * 0.2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Investment Fund (20%):</span>
                      <span className="font-mono-num font-medium">KSh {(amount - Math.round(amount * 0.6) - Math.round(amount * 0.2)).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#008744] hover:bg-[#007038] text-white font-bold rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Send STK Push Prompt</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 'stk_prompt' && (
            <div className="space-y-4">
              <div className="border-2 border-emerald-500 bg-emerald-950 text-emerald-100 rounded-2xl p-5 shadow-inner">
                <div className="text-center pb-2 border-b border-emerald-800/80 mb-3">
                  <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono">SIM Toolkit / M-PESA</div>
                  <div className="font-semibold text-white text-sm">Do you want to pay KSh {amount.toLocaleString()} to {activeChama.name.substring(0, 24)}...?</div>
                </div>

                <div className="text-center py-2">
                  <div className="text-xs text-emerald-300 mb-2">Enter 4-Digit M-Pesa PIN</div>
                  <input
                    type="password"
                    maxLength={4}
                    autoFocus
                    placeholder="••••"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                    className="w-32 mx-auto text-center tracking-[0.5em] text-2xl font-mono py-2 bg-emerald-900 border border-emerald-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="flex-1 py-2 text-xs font-semibold bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPin}
                    disabled={enteredPin.length < 4}
                    className="flex-1 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-emerald-950 rounded-lg transition"
                  >
                    OK / Send PIN
                  </button>
                </div>
              </div>

              <div className="text-center text-xs text-slate-500">
                Simulating Safaricom Daraja 2.0 Webhook callback integration.
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-10 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
                <Smartphone className="w-7 h-7 text-emerald-600 absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">Processing M-Pesa Payment</h4>
                <p className="text-xs text-slate-500 mt-1">Waiting for Safaricom Daraja confirmation response...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4 py-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="text-center">
                <h4 className="font-extrabold text-slate-900 text-lg">Payment Successful!</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  KSh {amount.toLocaleString()} posted to {activeChama.name} ledger
                </p>
              </div>

              {/* Digital M-Pesa SMS Style Receipt */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-700 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">M-Pesa Ref:</span>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <span>{receipt}</span>
                    <button
                      onClick={handleCopyReceipt}
                      className="text-slate-400 hover:text-slate-600 transition"
                      title="Copy receipt code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-bold text-slate-900">KSh {amount.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sender:</span>
                  <span>{currentMember.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span>{phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-600 font-bold">COMPLETED & VERIFIED</span>
                </div>
              </div>

              {copied && (
                <div className="text-center text-xs font-semibold text-emerald-600">
                  Receipt code copied to clipboard!
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-900/10 cursor-pointer"
                >
                  Done / Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
