/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Check, 
  Copy, 
  HardDrive, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Layers,
  Terminal
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';

interface SqlDumpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DumpFile {
  filename: string;
  sizeBytes: number;
  created: string;
  modified: string;
}

export const SqlDumpModal: React.FC<SqlDumpModalProps> = ({ isOpen, onClose }) => {
  const { allChamas, registrationApplications, exportSqlDump, isDbSyncing } = useChama();
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string>('');
  const [dumpFiles, setDumpFiles] = useState<DumpFile[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'preview'>('overview');
  const [previewSql, setPreviewSql] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  const fetchDumps = async () => {
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

  const loadPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const res = await fetch('/api/db/export-sql-dump');
      if (res.ok) {
        const text = await res.text();
        setPreviewSql(text);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDumps();
      if (activeTab === 'preview' && !previewSql) {
        loadPreview();
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleDownloadLatest = async () => {
    const res = await exportSqlDump();
    if (res.success) {
      setDownloadSuccess(res.message);
      fetchDumps();
      setTimeout(() => setDownloadSuccess(''), 6000);
    }
  };

  const handleCopySql = async () => {
    try {
      let textToCopy = previewSql;
      if (!textToCopy) {
        const res = await fetch('/api/db/export-sql-dump');
        if (res.ok) {
          textToCopy = await res.text();
          setPreviewSql(textToCopy);
        }
      }
      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (e) {
      console.error('Failed to copy SQL:', e);
    }
  };

  const totalMembers = allChamas.reduce((sum, c) => sum + c.members.length, 0);
  const totalTxs = allChamas.reduce((sum, c) => sum + c.transactions.length, 0);
  const totalAudits = allChamas.reduce((sum, c) => sum + c.auditLogs.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-amber-400/50 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header with Pink & Gold theme */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#092214] via-[#0d2e1b] to-[#07190e] text-white flex items-center justify-between border-b border-emerald-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-950/50">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl text-white">Download Database SQL Dump</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  ANSI / SQL
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Saved in workspace folder <span className="font-mono font-bold text-emerald-300">/export_sql_dump/</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Download & File Index
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('preview');
              if (!previewSql) loadPreview();
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-emerald-600 text-emerald-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SQL Script Preview</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {downloadSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Primary 1-Click Download Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-2 border-emerald-300/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      Standard Download
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1">
                      chamasmart_dump_latest.sql
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Includes complete DDL schemas (5 relational tables) and live transactional data.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadLatest}
                      disabled={isDbSyncing}
                      className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md border border-emerald-300 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                    >
                      <Download className="w-4 h-4 text-slate-950 shrink-0" />
                      <span>Download .SQL File</span>
                    </button>
                  </div>
                </div>

                {/* Direct download browser link fallback */}
                <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Direct browser file link:</span>
                  <a
                    href="/api/db/export-sql-dump"
                    download="chamasmart_dump_latest.sql"
                    className="font-mono text-amber-800 hover:underline font-bold"
                  >
                    /api/db/export-sql-dump ↗
                  </a>
                </div>
              </div>

              {/* Database Storage Live Metrics */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Database Relational Contents
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Table: chamas</span>
                    <strong className="text-base text-slate-900 font-mono-num">{allChamas.length}</strong>
                    <span className="text-[10px] text-slate-400 block">Chama workspaces</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Table: members</span>
                    <strong className="text-base text-slate-900 font-mono-num">{totalMembers}</strong>
                    <span className="text-[10px] text-slate-400 block">Member accounts</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Table: registration_applications</span>
                    <strong className="text-base text-slate-900 font-mono-num">{registrationApplications.length}</strong>
                    <span className="text-[10px] text-slate-400 block">Public applications</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Table: transactions</span>
                    <strong className="text-base text-slate-900 font-mono-num">{totalTxs}</strong>
                    <span className="text-[10px] text-slate-400 block">M-Pesa payments</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Table: audit_logs</span>
                    <strong className="text-base text-slate-900 font-mono-num">{totalAudits}</strong>
                    <span className="text-[10px] text-slate-400 block">Immutable log entries</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Engine & Integrity</span>
                    <strong className="text-emerald-700 font-semibold block mt-0.5">Foreign Keys ON</strong>
                    <span className="text-[10px] text-slate-400 block">WAL Journal Mode</span>
                  </div>
                </div>
              </div>

              {/* Files in export_sql_dump/ directory */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                    <span>Files in export_sql_dump/ ({dumpFiles.length})</span>
                  </h5>
                  <button
                    type="button"
                    onClick={fetchDumps}
                    className="text-[11px] text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {dumpFiles.map((file) => (
                    <div key={file.filename} className="p-3 bg-white hover:bg-slate-50 transition flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{file.filename}</span>
                          {file.filename.includes('latest') && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              LATEST
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {(file.sizeBytes / 1024).toFixed(1)} KB • {new Date(file.modified).toLocaleTimeString()}
                        </div>
                      </div>

                      <a
                        href={`/api/db/dumps/${file.filename}`}
                        download={file.filename}
                        className="py-1 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold text-xs flex items-center gap-1 transition"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  ANSI / PostgreSQL / MySQL Compatible SQL Dump Script
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy All'}</span>
                </button>
              </div>

              {isLoadingPreview ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading SQL script preview...</div>
              ) : (
                <div className="bg-slate-900 p-4 rounded-xl text-amber-300 font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto border border-slate-800">
                  <pre>{previewSql || '-- Loading database dump...'}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">
            Authoritative database: <strong className="text-slate-800">database/chamasmart.db</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
