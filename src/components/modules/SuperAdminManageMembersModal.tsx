/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Users, UserPlus, Edit2, Trash2, CheckCircle2, ShieldCheck, Plus, Save } from 'lucide-react';
import { Chama, Member, Role } from '../../types';

interface SuperAdminManageMembersModalProps {
  chama: Chama | null;
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (memberData: any) => void;
  onEditMember: (chamaId: string, memberId: string, updates: Partial<Member>) => void;
  onRemoveMember: (chamaId: string, memberId: string) => void;
}

export const SuperAdminManageMembersModal: React.FC<SuperAdminManageMembersModalProps> = ({
  chama,
  isOpen,
  onClose,
  onAddMember,
  onEditMember,
  onRemoveMember,
}) => {
  if (!isOpen || !chama) return null;

  const [isAdding, setIsAdding] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // New member fields
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+2547');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('member');
  const [newSavings, setNewSavings] = useState(0);

  // Edit member fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<Role>('member');
  const [editSavings, setEditSavings] = useState(0);
  const [editLoanBal, setEditLoanBal] = useState(0);

  const handleStartEdit = (m: Member) => {
    setEditingMemberId(m.id);
    setEditName(m.name);
    setEditPhone(m.phoneNumber);
    setEditRole(m.role);
    setEditSavings(m.totalSavings);
    setEditLoanBal(m.activeLoanBalance);
  };

  const handleSaveEdit = (memberId: string) => {
    onEditMember(chama.id, memberId, {
      name: editName.trim(),
      phoneNumber: editPhone.trim(),
      role: editRole,
      totalSavings: Number(editSavings),
      activeLoanBalance: Number(editLoanBal),
    });
    setEditingMemberId(null);
  };

  const handleCreateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const nextNum = `CS-${chama.name.substring(0, 3).toUpperCase()}-${String(chama.members.length + 1).padStart(3, '0')}`;
    onAddMember({
      name: newName.trim(),
      phoneNumber: newPhone.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      membershipNumber: nextNum,
      joinedDate: new Date().toISOString().split('T')[0],
      role: newRole,
      nextOfKin: { name: 'Family Contact', relationship: 'Spouse', phone: '+254700000000' },
    });

    setIsAdding(false);
    setNewName('');
    setNewPhone('+2547');
    setNewEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-emerald-400 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-base">Super Admin: Member Roster & Role Control</h3>
              <span className="text-[11px] text-emerald-200 font-medium">Workspace: {chama.name} ({chama.members.length} Members)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
            <span className="text-xs font-bold text-emerald-950">Registered Member Accounts</span>
            {!isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member Account</span>
              </button>
            )}
          </div>

          {/* Add Member Form */}
          {isAdding && (
            <form onSubmit={handleCreateMemberSubmit} className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-3">
              <span className="text-xs font-bold text-emerald-950 block">Register New Member in {chama.name}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-emerald-900 block mb-0.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Samuel Mutiso"
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-emerald-950"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-emerald-900 block mb-0.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-emerald-950"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-emerald-900 block mb-0.5">Assigned Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-emerald-950"
                  >
                    <option value="member">Member</option>
                    <option value="chairperson">Chairperson</option>
                    <option value="treasurer">Treasurer</option>
                    <option value="secretary">Secretary</option>
                    <option value="loan_officer">Loan Officer</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-emerald-900 block mb-0.5">Email (Optional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-emerald-950"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs"
                >
                  Confirm Add Member
                </button>
              </div>
            </form>
          )}

          {/* Members List */}
          <div className="space-y-2.5">
            {chama.members.map((m) => {
              const isEditing = editingMemberId === m.id;

              if (isEditing) {
                return (
                  <div key={m.id} className="p-3 bg-amber-50/70 border border-amber-300 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-amber-950 block">Editing: {m.name} ({m.membershipNumber})</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-600 block">Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full p-1 bg-white border rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 block">Phone</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full p-1 bg-white border rounded text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 block">Role</label>
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as any)}
                          className="w-full p-1 bg-white border rounded text-xs"
                        >
                          <option value="member">Member</option>
                          <option value="chairperson">Chairperson</option>
                          <option value="treasurer">Treasurer</option>
                          <option value="secretary">Secretary</option>
                          <option value="loan_officer">Loan Officer</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 block">Savings (KSh)</label>
                        <input
                          type="number"
                          value={editSavings}
                          onChange={(e) => setEditSavings(Number(e.target.value))}
                          className="w-full p-1 bg-white border rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingMemberId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(m.id)}
                        className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className="p-3 rounded-xl border border-emerald-100 hover:border-emerald-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-950">{m.name}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                        {m.membershipNumber}
                      </span>
                      <span className="capitalize text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-full">
                        {m.role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Phone: <span className="font-mono">{m.phoneNumber}</span> • Savings: <strong className="text-emerald-700">KSh {m.totalSavings.toLocaleString()}</strong>
                      {m.activeLoanBalance > 0 && <span className="text-amber-800 font-semibold ml-2">• Loan: KSh {m.activeLoanBalance.toLocaleString()}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(m)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                      title="Edit member details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove ${m.name} from ${chama.name}?`)) {
                          onRemoveMember(chama.id, m.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
