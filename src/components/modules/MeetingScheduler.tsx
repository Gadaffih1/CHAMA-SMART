/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  FileDown, 
  Trash2, 
  Check, 
  X, 
  ListOrdered, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  ExternalLink,
  DollarSign,
  AlertTriangle,
  BadgeCheck
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { Meeting, MeetingAttendance } from '../../types';
import { MeetingCalendar } from './MeetingCalendar';
import { localDateKey } from './meetingCalendar';

const STANDARD_TABLE_BANKING_AGENDA = [
  '1. Opening Devotion & Confirmation of Quorum',
  '2. Reading and Adoption of Previous Meeting Minutes',
  '3. Member Welfare & Benevolent Fund Updates',
  '4. Monthly Savings & Share Capital Collections',
  '5. Table Banking Loan Requests, Appraisals & Disbursals',
  '6. Merry-Go-Round Rotation Payout',
  '7. Delinquency Review & Fines Enforcement',
  '8. Any Other Business (AOB) & Closing Adjournment',
];

const AGM_AGENDA = [
  '1. Opening Remarks by Chairperson',
  '2. Presentation of Annual Audited Financial Statements by Treasurer',
  '3. Review of Chama Investment Portfolio & Asset Dividends',
  '4. Constitution Review & Resolution Ratification',
  '5. Democratic Election of Management Officials',
  '6. Strategic Goals & Subscription Plan for the Next Fiscal Year',
  '7. Vote of Thanks & Refreshments',
];

export const MeetingScheduler: React.FC = () => {
  const { 
    activeChama, 
    currentUser,
    isSuperAdminLoggedIn,
    dbSyncError,
    retryDbSync,
    scheduleMeeting, 
    saveMeetingAttendance, 
    updateMeetingStatus, 
    deleteMeeting 
  } = useChama();

  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'in_progress' | 'completed'>('all');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(activeChama.meetings?.[0]?.id || '');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [formError, setFormError] = useState('');

  // New Meeting Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return localDateKey(d);
  });
  const [time, setTime] = useState('14:00');
  const [venue, setVenue] = useState('Chama Community Hall');
  const [isVirtual, setIsVirtual] = useState(false);
  const [virtualLink, setVirtualLink] = useState('');
  const [agendaItems, setAgendaItems] = useState<string[]>([...STANDARD_TABLE_BANKING_AGENDA]);
  const [newAgendaInput, setNewAgendaInput] = useState('');

  const meetings = activeChama.meetings || [];
  const filteredMeetings = meetings.filter(m =>
    (!selectedDate || (m.date === selectedDate && m.status === 'upcoming')) &&
    (filterStatus === 'all' || m.status === filterStatus)
  ).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.title.localeCompare(b.title));

  const selectedMeeting = filteredMeetings.find(m => m.id === selectedMeetingId) || filteredMeetings[0];

  const actualRole = activeChama.members.find(member => member.id === currentUser?.id)?.role;
  const canManage = isSuperAdminLoggedIn || (actualRole !== undefined && ['chairperson', 'secretary', 'treasurer', 'loan_officer'].includes(actualRole));

  // Quick preset loading
  const handleLoadAgendaPreset = (preset: 'standard' | 'agm') => {
    if (preset === 'standard') {
      setAgendaItems([...STANDARD_TABLE_BANKING_AGENDA]);
    } else {
      setAgendaItems([...AGM_AGENDA]);
    }
  };

  const handleAddAgendaItem = () => {
    if (!newAgendaInput.trim()) return;
    setAgendaItems(prev => [...prev, `${prev.length + 1}. ${newAgendaInput.trim()}`]);
    setNewAgendaInput('');
  };

  const handleRemoveAgendaItem = (index: number) => {
    setAgendaItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time || !venue.trim()) {
      setFormError('Enter a title, date, time and meeting location.');
      return;
    }
    if (isVirtual && !/^https?:\/\//i.test(virtualLink.trim())) {
      setFormError('Enter a virtual meeting link starting with http:// or https://.');
      return;
    }
    setFormError('');

    const res = scheduleMeeting({
      title: title.trim(),
      date,
      time,
      venue: venue.trim(),
      isVirtual,
      virtualLink: isVirtual ? virtualLink.trim() : undefined,
      agendaItems: [...agendaItems, ...(newAgendaInput.trim() ? [newAgendaInput.trim()] : [])].filter(item => item.trim().length > 0),
    });

    if (res.success) {
      setSelectedMeetingId(res.meetingId);
      setSelectedDate(date);
      setFilterStatus('all');
      const [year, month] = date.split('-').map(Number);
      setCalendarMonth(new Date(year, month - 1, 1));
      setIsScheduleModalOpen(false);
      setTitle('');
      setNewAgendaInput('');
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(''), 4500);
    }
  };

  // Attendance update
  const handleAttendanceChange = (memberId: string, status: MeetingAttendance['status']) => {
    if (!selectedMeeting) return;
    const currentAttendance = selectedMeeting.attendance || [];
    const fine = status === 'absent_without_apology' ? 200 : status === 'late' ? 100 : 0;

    const updated = currentAttendance.map(att => {
      if (att.memberId === memberId) {
        return {
          ...att,
          status,
          fineAmount: fine,
          finePaid: fine === 0 ? true : att.finePaid,
        };
      }
      return att;
    });

    saveMeetingAttendance(selectedMeeting.id, updated);
  };

  // Toggle fine paid status
  const handleToggleFinePaid = (memberId: string) => {
    if (!selectedMeeting) return;
    const currentAttendance = selectedMeeting.attendance || [];
    const updated = currentAttendance.map(att => {
      if (att.memberId === memberId) {
        return {
          ...att,
          finePaid: !att.finePaid,
        };
      }
      return att;
    });
    saveMeetingAttendance(selectedMeeting.id, updated);
  };

  // Mark all present shortcut
  const handleMarkAllPresent = () => {
    if (!selectedMeeting) return;
    const updated: MeetingAttendance[] = (activeChama.members || []).map(m => ({
      memberId: m.id,
      memberName: m.name,
      status: 'present',
      fineAmount: 0,
      finePaid: true,
    }));
    saveMeetingAttendance(selectedMeeting.id, updated);
    setFeedbackMsg('All members registered as Present for this session.');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Export Attendance Register to CSV
  const handleExportAttendanceCsv = () => {
    if (!selectedMeeting) return;
    const headers = ['Meeting Title', 'Meeting Date', 'Meeting Time', 'Member Name', 'Membership Number', 'Role', 'Attendance Status', 'Fine Amount (KSh)', 'Fine Paid'];
    const rows = (selectedMeeting.attendance || []).map(att => {
      const memberInfo = activeChama.members.find(m => m.id === att.memberId);
      return [
        `"${selectedMeeting.title.replace(/"/g, '""')}"`,
        selectedMeeting.date,
        selectedMeeting.time,
        `"${att.memberName.replace(/"/g, '""')}"`,
        memberInfo?.membershipNumber || 'N/A',
        memberInfo?.role || 'member',
        att.status.replace(/_/g, ' ').toUpperCase(),
        att.fineAmount || 0,
        att.finePaid ? 'YES' : 'NO',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_${selectedMeeting.title.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedMeeting.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    if (!window.confirm('Are you sure you want to cancel and remove this scheduled meeting?')) return;
    const res = deleteMeeting(meetingId);
    if (res.success) {
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  // Quorum and Attendance Metrics
  const totalMembers = activeChama.members.length;
  const attendanceList = selectedMeeting?.attendance || [];
  const presentCount = attendanceList.filter(a => a.status === 'present').length;
  const apologyCount = attendanceList.filter(a => a.status === 'absent_with_apology').length;
  const absentCount = attendanceList.filter(a => a.status === 'absent_without_apology').length;
  const lateCount = attendanceList.filter(a => a.status === 'late').length;
  const attendanceRate = totalMembers > 0 ? Math.round(((presentCount + lateCount) / totalMembers) * 100) : 0;
  const isQuorumAchieved = attendanceRate >= 66; // Constitutional 2/3 majority requirement

  const totalFinesAccrued = attendanceList.reduce((sum, a) => sum + (a.fineAmount || 0), 0);
  const totalFinesCollected = attendanceList.reduce((sum, a) => a.finePaid ? sum + (a.fineAmount || 0) : sum, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-2xl p-5 sm:p-6 text-white border border-emerald-700/40 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Officials Governance Module
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">
                {activeChama.name}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>Meeting Scheduler & Attendance Register</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/70 max-w-2xl leading-relaxed">
              Schedule regular Chama assembly dates, structure constitutional agenda items, and maintain an immutable attendance register with automated absenteeism fines.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {canManage && (
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule New Meeting</span>
              </button>
            )}
          </div>
        </div>

        {/* Governance Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-emerald-700/50">
          <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60">
            <span className="text-[10px] text-emerald-300/80 uppercase font-bold tracking-wider block">Total Scheduled</span>
            <span className="text-lg font-black text-white">{meetings.length} Sessions</span>
          </div>
          <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60">
            <span className="text-[10px] text-emerald-300/80 uppercase font-bold tracking-wider block">Upcoming Meetings</span>
            <span className="text-lg font-black text-amber-300">{meetings.filter(m => m.status === 'upcoming').length} Pending</span>
          </div>
          <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60">
            <span className="text-[10px] text-emerald-300/80 uppercase font-bold tracking-wider block">Constitutional Quorum</span>
            <span className="text-lg font-black text-emerald-300">66% (2/3 Majority)</span>
          </div>
          <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60">
            <span className="text-[10px] text-emerald-300/80 uppercase font-bold tracking-wider block">Session Fines Pool</span>
            <span className="text-lg font-black text-emerald-300">KSh {totalFinesAccrued.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}
      {dbSyncError && (
        <div role="alert" className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs font-semibold text-rose-900">
          {dbSyncError} <button type="button" onClick={retryDbSync} className="underline">Retry saving</button>
        </div>
      )}

      {/* Main Split Layout: Meeting Calendar List (Left) + Selected Meeting Details & Attendance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Scheduled Meetings Directory (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <MeetingCalendar
            meetings={meetings}
            month={calendarMonth}
            selectedDate={selectedDate}
            onMonthChange={setCalendarMonth}
            onDateSelect={day => {
              setSelectedDate(day);
              setFilterStatus('all');
            }}
          />
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{selectedDate ? `Meetings on ${selectedDate}` : `Meetings (${meetings.length})`}</span>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-emerald-50 p-0.5 rounded-lg border border-emerald-200/60 text-[10px]">
                {(['all', 'upcoming', 'in_progress', 'completed'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => { setSelectedDate(null); setFilterStatus(tab); }}
                    className={`px-2 py-1 rounded-md font-bold capitalize transition ${
                      filterStatus === tab
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'text-emerald-900 hover:text-emerald-700'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Meetings Cards List */}
            <div className="divide-y divide-emerald-50 mt-2 max-h-[640px] overflow-y-auto space-y-2 pr-1">
              {filteredMeetings.map(m => {
                const isSelected = selectedMeeting?.id === m.id;
                const mPres = (m.attendance || []).filter(a => a.status === 'present').length;
                const mTotal = activeChama.members.length;
                const mRate = mTotal > 0 ? Math.round((mPres / mTotal) * 100) : 0;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMeetingId(m.id)}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block ${
                          m.status === 'upcoming' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : m.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {m.status.replace('_', ' ')}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{m.title}</h4>
                      </div>
                      
                      {canManage && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeeting(m.id);
                          }}
                          title="Cancel Meeting"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{m.date}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{m.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span className="flex items-center gap-1 truncate max-w-[170px]">
                        {m.isVirtual ? <Video className="w-3 h-3 text-blue-600" /> : <MapPin className="w-3 h-3 text-emerald-600" />}
                        <span className="truncate">{m.venue}</span>
                      </span>
                      <span className="font-mono text-emerald-800 font-bold shrink-0">
                        {mRate}% Quorum
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredMeetings.length === 0 && (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs">{selectedDate ? 'No upcoming meetings on this date.' : 'No meetings found in this status category.'}</p>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition"
                    >
                      Schedule First Session
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Meeting Agenda & Attendance Register (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedMeeting ? (
            <>
              {/* Meeting Header & Status Controls */}
              <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Session: {selectedMeeting.date} @ {selectedMeeting.time}
                      </span>
                      {selectedMeeting.isVirtual && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <Video className="w-3 h-3" /> Virtual Link
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-lg text-slate-900 mt-1">{selectedMeeting.title}</h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedMeeting.venue}</span>
                      {selectedMeeting.virtualLink && (
                        <a
                          href={selectedMeeting.virtualLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-mono ml-2"
                        >
                          Join Video Call <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </p>
                  </div>

                  {/* Status Toggle & CSV Export */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {canManage && (
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs border border-slate-200">
                        {(['upcoming', 'in_progress', 'completed'] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateMeetingStatus(selectedMeeting.id, st)}
                            className={`px-2.5 py-1 rounded-lg font-bold capitalize transition text-[11px] ${
                              selectedMeeting.status === st
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {st.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleExportAttendanceCsv}
                      title="Download Attendance Matrix (.csv)"
                      className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Quorum Progress Bar */}
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Quorum Audit Status</span>
                    </span>
                    <span className="font-mono text-emerald-900 font-bold">
                      {presentCount + lateCount} / {totalMembers} Members ({attendanceRate}%)
                    </span>
                  </div>

                  <div className="w-full bg-emerald-200/80 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        isQuorumAchieved ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-700 font-semibold">• {presentCount} Present</span>
                      <span className="text-blue-700 font-semibold">• {lateCount} Late</span>
                      <span className="text-amber-700 font-semibold">• {apologyCount} Apology</span>
                      <span className="text-rose-700 font-semibold">• {absentCount} Absent</span>
                    </div>

                    <div className="font-bold">
                      {isQuorumAchieved ? (
                        <span className="text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Quorum Validated (&gt;= 66%)</span>
                        </span>
                      ) : (
                        <span className="text-amber-800 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Quorum Deficient (&lt; 66%)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meeting Agenda Items Showcase */}
                <div className="pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
                    <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Certified Session Agenda ({selectedMeeting.agendaItems?.length || 0} Items)</span>
                  </h4>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                    {(selectedMeeting.agendaItems || []).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800">
                        <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{item.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    ))}
                    {(!selectedMeeting.agendaItems || selectedMeeting.agendaItems.length === 0) && (
                      <p className="text-xs text-slate-500 italic">No formal agenda set for this meeting.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Attendance Tracker Table */}
              <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Digital Attendance Register</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mark member status in real-time. Unexcused absence auto-charges standard KSh 200 constitutional fine.
                    </p>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleMarkAllPresent}
                        className="py-1.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Mark All Present</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[700px] text-xs text-left">
                    <thead>
                      <tr className="bg-emerald-50/60 text-emerald-950 font-semibold border-b border-emerald-200/80">
                        <th className="py-2.5 px-3">Member Details</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Attendance Status</th>
                        <th className="py-2.5 px-3">Fine (KSh)</th>
                        <th className="py-2.5 px-3 text-right">Fine Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeChama.members.map(member => {
                        const att = attendanceList.find(a => a.memberId === member.id) || {
                          memberId: member.id,
                          memberName: member.name,
                          status: 'present' as const,
                          fineAmount: 0,
                          finePaid: true,
                        };

                        return (
                          <tr key={member.id} className="hover:bg-emerald-50/20 transition">
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-900 block">{member.name}</span>
                              <span className="font-mono text-[11px] text-slate-500">{member.membershipNumber} · {member.phoneNumber}</span>
                            </td>

                            <td className="py-3 px-3">
                              <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                                {member.role.replace('_', ' ')}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                {[
                                  { id: 'present', label: 'Present', color: 'bg-emerald-600 text-white' },
                                  { id: 'late', label: 'Late', color: 'bg-blue-600 text-white' },
                                  { id: 'absent_with_apology', label: 'Apology', color: 'bg-amber-600 text-white' },
                                  { id: 'absent_without_apology', label: 'Absent', color: 'bg-rose-600 text-white' },
                                ].map(option => (
                                  <button
                                    key={option.id}
                                    type="button"
                                    disabled={!canManage}
                                    onClick={() => handleAttendanceChange(member.id, option.id as any)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                                      att.status === option.id
                                        ? `${option.color} shadow-xs`
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </td>

                            <td className="py-3 px-3 font-mono">
                              {att.fineAmount > 0 ? (
                                <span className="font-bold text-rose-700">KSh {att.fineAmount}</span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-right">
                              {att.fineAmount > 0 ? (
                                <button
                                  type="button"
                                  disabled={!canManage}
                                  onClick={() => handleToggleFinePaid(member.id)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                                    att.finePaid
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                                  }`}
                                >
                                  {att.finePaid ? '✓ Paid' : 'Unpaid (Click to Clear)'}
                                </button>
                              ) : (
                                <span className="text-emerald-700 text-[10px] font-semibold">Exempt</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs p-12 text-center space-y-3">
              <Calendar className="w-12 h-12 text-emerald-300 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">No Meeting Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select an upcoming or completed meeting from the calendar on the left, or schedule a new session.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {isScheduleModalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="schedule-meeting-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
            
            {/* Modal Header with Light Green Accent */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 flex items-center justify-between border-b border-emerald-700/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 flex items-center justify-center shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="schedule-meeting-title" className="font-black text-base sm:text-lg text-white">Schedule New Chama Meeting</h3>
                  <p className="text-xs text-emerald-200/80">Configure date, location, virtual links & constitutional agenda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateMeeting} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {formError && <p role="alert" className="text-xs font-semibold text-rose-700">{formError}</p>}
              <div>
                <label htmlFor="meeting-title" className="text-xs font-semibold text-slate-700 block mb-1">
                  Meeting Title / Assembly Theme *
                </label>
                <input
                  id="meeting-title"
                  type="text"
                  required
                  placeholder="e.g. Monthly Table Banking Assembly & Savings Reconciliation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="meeting-date" className="text-xs font-semibold text-slate-700 block mb-1">
                    Meeting Date *
                  </label>
                  <input
                    id="meeting-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="meeting-time" className="text-xs font-semibold text-slate-700 block mb-1">
                    Meeting Time *
                  </label>
                  <input
                    id="meeting-time"
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="meeting-venue" className="text-xs font-semibold text-slate-700 block mb-1">
                  Physical Venue / Meeting Location *
                </label>
                <input
                  id="meeting-venue"
                  type="text"
                  required
                  placeholder="e.g. Chama Community Center, St. Jude Hall, or Host Residence"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Hybrid / Virtual Meeting Toggle */}
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="font-bold text-xs text-emerald-950 block">Hybrid / Virtual Attendance Option</span>
                      <span className="text-[10px] text-emerald-800">Provide remote members with Google Meet / Zoom dial-in</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Enable virtual attendance"
                    checked={isVirtual}
                    onChange={(e) => setIsVirtual(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {isVirtual && (
                  <div>
                    <label htmlFor="meeting-link" className="text-[11px] font-semibold text-emerald-900 block mb-1">
                      Virtual Video Call Link
                    </label>
                    <input
                      id="meeting-link"
                      type="url"
                      required
                      placeholder="https://meet.google.com/xyz-wxyz-abc"
                      value={virtualLink}
                      onChange={(e) => setVirtualLink(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-emerald-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Agenda Builder Section */}
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Meeting Agenda Items ({agendaItems.length})</span>
                  </label>

                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleLoadAgendaPreset('standard')}
                      className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold transition"
                    >
                      Load Table Banking Agenda
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadAgendaPreset('agm')}
                      className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 font-bold transition"
                    >
                      Load AGM Agenda
                    </button>
                  </div>
                </div>

                {/* Agenda Items List */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-44 overflow-y-auto space-y-1.5">
                  {agendaItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-xs">
                      <span className="font-medium text-slate-800 truncate">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAgendaItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Agenda Item Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom agenda item..."
                    value={newAgendaInput}
                    onChange={(e) => setNewAgendaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAgendaItem();
                      }
                    }}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAgendaItem}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer"
                >
                  Confirm & Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
