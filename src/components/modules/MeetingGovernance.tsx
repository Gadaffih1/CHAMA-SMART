/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Vote, 
  FileText, 
  Clock, 
  Video, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Award,
  Sparkles 
} from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { MeetingAttendance } from '../../types';

export const MeetingGovernance: React.FC = () => {
  const { 
    activeChama, 
    currentMember, 
    currentOfficialRole, 
    saveMeetingAttendance, 
    saveMeetingMinutes, 
    castVote 
  } = useChama();

  const [activeTab, setActiveTab] = useState<'meetings' | 'elections'>('meetings');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(activeChama.meetings[0]?.id || '');
  const [minutesText, setMinutesText] = useState<string>(activeChama.meetings[0]?.minutes || '');
  const [actionPointInput, setActionPointInput] = useState<string>('');
  const [actionPoints, setActionPoints] = useState<string[]>(activeChama.meetings[0]?.actionPoints || []);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const meeting = activeChama.meetings.find(m => m.id === selectedMeetingId) || activeChama.meetings[0];
  const election = activeChama.elections[0];
  const isSecretary = currentOfficialRole === 'secretary';

  // Toggle attendance status
  const handleAttendanceChange = (memberId: string, status: MeetingAttendance['status']) => {
    if (!meeting) return;
    const currentAttendance = meeting.attendance || [];
    const fine = status === 'absent_without_apology' ? 200 : status === 'late' ? 100 : 0;

    const updated = currentAttendance.map(att => {
      if (att.memberId === memberId) {
        return {
          ...att,
          status,
          fineAmount: fine,
          finePaid: fine === 0,
        };
      }
      return att;
    });

    saveMeetingAttendance(meeting.id, updated);
  };

  const handleSaveMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meeting) return;
    saveMeetingMinutes(meeting.id, minutesText, actionPoints);
    setSuccessMsg('Meeting minutes and action items officially certified by Secretary.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddActionPoint = () => {
    if (!actionPointInput.trim()) return;
    setActionPoints([...actionPoints, actionPointInput.trim()]);
    setActionPointInput('');
  };

  const handleCastVote = (positionId: string, candidateId: string) => {
    if (!election) return;
    castVote(election.id, positionId, candidateId);
    setSuccessMsg('Your secret ballot vote has been registered!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 sm:p-6 overflow-hidden w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rose-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-amber-100 text-rose-800 flex items-center justify-center border border-amber-200/50 shadow-xs">
            <Users className="w-5 h-5 text-rose-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Governance, Meetings & Elections</h3>
            <p className="text-xs text-slate-500">
              Meeting registers, absenteeism fines, official minutes & democratic secret ballot voting
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-rose-50/70 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-rose-100">
          <button
            type="button"
            onClick={() => setActiveTab('meetings')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'meetings'
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chama Meetings & Minutes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('elections')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'elections'
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Democratic Elections</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* MEETINGS TAB */}
      {activeTab === 'meetings' && (
        <div className="mt-6 space-y-6">
          {meeting ? (
            <div className="space-y-6">
              {/* Meeting Meta Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Next Scheduled Meeting
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1">{meeting.title}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {meeting.date} ({meeting.time})
                    </span>
                    {meeting.virtualLink && (
                      <a
                        href={meeting.virtualLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-2.5 py-1 rounded-lg transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Virtual Meet
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="text-xs font-bold text-slate-700 mb-2">Meeting Agenda Items:</h5>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {meeting.agendaItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Attendance Sheet & Absenteeism Fines */}
              <div className="border border-slate-200/80 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Digital Attendance & Fines Register</h4>
                    <p className="text-xs text-slate-500">
                      Late arrivals incur KSh 100 fine; Absenteeism without notice incurs KSh 200 fine
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    Secretary Mode: <strong className="text-slate-800">{isSecretary ? 'Active Editor' : 'Viewer (switch role to edit)'}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[560px] text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">Member Name</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Attendance Status</th>
                        <th className="py-2.5 px-3">Fine (KSh)</th>
                        <th className="py-2.5 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {meeting.attendance?.map((att) => {
                        const mem = activeChama.members.find(m => m.id === att.memberId);
                        return (
                          <tr key={att.memberId} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {att.memberName}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 capitalize">
                              {mem?.role || 'member'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  att.status === 'present'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : att.status === 'late'
                                    ? 'bg-amber-100 text-amber-800'
                                    : att.status === 'absent_with_apology'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {att.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono-num font-bold text-slate-800">
                              {att.fineAmount > 0 ? `KSh ${att.fineAmount}` : 'None'}
                            </td>
                            <td className="py-2.5 px-3">
                              <select
                                value={att.status}
                                onChange={(e) => handleAttendanceChange(att.memberId, e.target.value as any)}
                                disabled={!isSecretary}
                                className="text-xs bg-white border border-slate-200 rounded-lg p-1 font-medium focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                              >
                                <option value="present">Present</option>
                                <option value="late">Late (KSh 100 fine)</option>
                                <option value="absent_with_apology">Apology accepted (KSh 0)</option>
                                <option value="absent_without_apology">Absent (KSh 200 fine)</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Certified Meeting Minutes */}
              <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50">
                <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Secretary’s Official Certified Minutes & Action Items
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Minutes are permanently archived and accessible by all members in their self-service portal
                </p>

                <form onSubmit={handleSaveMinutes} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Detailed Minutes & Decisions
                    </label>
                    <textarea
                      rows={4}
                      value={minutesText}
                      onChange={(e) => setMinutesText(e.target.value)}
                      placeholder="Record proceedings, financial approvals, motions raised and passed..."
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Action Items & Assigned Persons
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={actionPointInput}
                        onChange={(e) => setActionPointInput(e.target.value)}
                        placeholder="e.g. Treasurer to collect title deed search receipt before Friday"
                        className="flex-1 text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddActionPoint}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
                      >
                        Add Item
                      </button>
                    </div>

                    <ul className="text-xs space-y-1.5">
                      {actionPoints.map((pt, i) => (
                        <li key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-slate-700">
                          <span>• {pt}</span>
                          <button
                            type="button"
                            onClick={() => setActionPoints(actionPoints.filter((_, idx) => idx !== i))}
                            className="text-[10px] text-rose-500 hover:text-rose-700"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Certify & Save Minutes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400">
              No meetings scheduled.
            </div>
          )}
        </div>
      )}

      {/* ELECTIONS TAB */}
      {activeTab === 'elections' && (
        <div className="mt-6 space-y-6">
          {election ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#190615] via-[#290d23] to-[#2e1408] text-white p-5 rounded-2xl border border-amber-500/20 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-0.5 rounded border border-amber-400/30">
                      Democratic Voting Active
                    </span>
                    <h4 className="text-lg font-bold mt-1 text-white">{election.title}</h4>
                    <p className="text-xs text-rose-200 mt-0.5">
                      Term: {election.termPeriod} • Period: {election.startDate} to {election.endDate}
                    </p>
                  </div>

                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs text-xs text-center shrink-0 border border-white/10">
                    <span className="text-rose-200 block text-[10px]">Your Ballot Status</span>
                    {election.votedMemberIds.includes(currentMember.id) ? (
                      <span className="font-bold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Voted (Ballot Cast)
                      </span>
                    ) : (
                      <span className="font-bold text-amber-300 mt-0.5 block animate-pulse">
                        Pending Your Vote
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Positions List */}
              <div className="space-y-6">
                {election.positions.map((pos) => {
                  const totalVotesInPos = pos.candidates.reduce((sum, c) => sum + c.votesCount, 0);
                  const hasVoted = election.votedMemberIds.includes(currentMember.id);

                  return (
                    <div key={pos.id} className="border border-rose-100 rounded-2xl p-5 bg-gradient-to-r from-white to-[#fffaf8] shadow-xs">
                      <div className="flex justify-between items-center pb-3 border-b border-rose-100 mb-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-800">Official Position</span>
                          <h4 className="font-bold text-slate-900 text-base">{pos.title}</h4>
                        </div>
                        <span className="text-xs text-slate-500 font-mono-num">
                          {totalVotesInPos} verified votes cast
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pos.candidates.map((cand) => {
                          const votePct = totalVotesInPos > 0 
                            ? ((cand.votesCount / totalVotesInPos) * 100).toFixed(0)
                            : 0;

                          return (
                            <div
                              key={cand.candidateId}
                              className="border border-rose-100 rounded-xl p-4 bg-gradient-to-b from-[#fffdfb] to-[#fff7f9] flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h5 className="font-bold text-slate-900 text-sm">{cand.candidateName}</h5>
                                    <span className="text-[11px] text-slate-500">Nominated Candidate</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-base font-extrabold text-amber-700 font-mono-num">
                                      {cand.votesCount}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block font-mono-num">{votePct}%</span>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-rose-100/80 mb-3 italic">
                                  "{cand.manifesto}"
                                </p>
                              </div>

                              <button
                                type="button"
                                disabled={hasVoted}
                                onClick={() => handleCastVote(pos.id, cand.candidateId)}
                                className="w-full py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Vote className="w-3.5 h-3.5" />
                                <span>{hasVoted ? 'Vote Submitted' : 'Vote for Candidate'}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400">
              No active elections scheduled.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
