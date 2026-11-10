import React, { useState } from 'react';
import { Filter, KeyRound, Pencil, Plus, Search, Shield, Trash2, UserRound, X } from 'lucide-react';
import { useChama } from '../../context/ChamaContext';
import { Member, Role } from '../../types';

type AccountDraft = {
  chamaId: string;
  name: string;
  phoneNumber: string;
  email: string;
  membershipNumber: string;
  role: Exclude<Role, 'super_admin'>;
  status: Member['status'];
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhone: string;
  password: string;
};

const emptyDraft: AccountDraft = {
  chamaId: '',
  name: '',
  phoneNumber: '+254',
  email: '',
  membershipNumber: '',
  role: 'member',
  status: 'active',
  nextOfKinName: '',
  nextOfKinRelationship: 'Spouse',
  nextOfKinPhone: '+254',
  password: '',
};

const categorySlug = (label: string) =>
  label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const displayCategory = (category: string) =>
  category.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());

export const UserAccountManager: React.FC = () => {
  const {
    allChamas,
    registrationApplications,
    categoryOptions,
    addCategory,
    renameCategory,
    removeCategory,
    addMember,
    updateMemberAccount,
    deleteMemberAccount,
    resetMemberPassword,
    isSuperAdminLoggedIn,
  } = useChama();
  const [draft, setDraft] = useState<AccountDraft>(emptyDraft);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [resetTarget, setResetTarget] = useState<Member | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChamaFilter, setSelectedChamaFilter] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [newCategory, setNewCategory] = useState('');
  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [renamedCategory, setRenamedCategory] = useState('');
  const [pendingCategoryDelete, setPendingCategoryDelete] = useState<string | null>(null);
  const [replacementCategory, setReplacementCategory] = useState('');
  const [feedback, setFeedback] = useState('');

  if (!isSuperAdminLoggedIn) return null;

  const accounts = allChamas.flatMap(chama =>
    chama.members.map(member => ({ member, chamaName: chama.name, chamaId: chama.id })),
  );

  const filteredAccounts = accounts.filter(({ member, chamaName, chamaId }) => {
    if (selectedChamaFilter !== 'all' && chamaId !== selectedChamaFilter) return false;
    if (selectedRoleFilter !== 'all' && member.role !== selectedRoleFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      member.name.toLowerCase().includes(q) ||
      member.phoneNumber.toLowerCase().includes(q) ||
      (member.email && member.email.toLowerCase().includes(q)) ||
      member.membershipNumber.toLowerCase().includes(q) ||
      chamaName.toLowerCase().includes(q)
    );
  });

  const startCreate = () => {
    setEditingMember(null);
    setDraft({ ...emptyDraft, chamaId: allChamas[0]?.id || '' });
  };

  const startEdit = (member: Member) => {
    setEditingMember(member);
    setDraft({
      chamaId: member.chamaId,
      name: member.name,
      phoneNumber: member.phoneNumber,
      email: member.email,
      membershipNumber: member.membershipNumber,
      role: member.role === 'super_admin' ? 'member' : member.role,
      status: member.status,
      nextOfKinName: member.nextOfKin?.name || '',
      nextOfKinRelationship: member.nextOfKin?.relationship || '',
      nextOfKinPhone: member.nextOfKin?.phone || '+254',
      password: '',
    });
  };

  const saveAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextOfKin = {
      name: draft.nextOfKinName || 'Family Contact',
      relationship: draft.nextOfKinRelationship || 'Other',
      phone: draft.nextOfKinPhone,
    };

    if (editingMember) {
      if (draft.password && draft.password.trim()) {
        if (draft.password.trim().length < 8) {
          setFeedback('Password must be at least 8 characters long.');
          return;
        }
        await resetMemberPassword(editingMember.id, draft.password.trim());
      }
      const result = updateMemberAccount(editingMember.id, {
        name: draft.name.trim(),
        phoneNumber: draft.phoneNumber.trim(),
        email: draft.email.trim(),
        membershipNumber: draft.membershipNumber.trim(),
        role: draft.role,
        status: draft.status,
        nextOfKin,
      });
      setFeedback(
        draft.password && draft.password.trim().length >= 8
          ? `${result.message} Password successfully updated.`
          : result.message
      );
      if (result.success) {
        setEditingMember(null);
        setDraft(emptyDraft);
      }
      return;
    }

    const result = await addMember({
      name: draft.name.trim(),
      phoneNumber: draft.phoneNumber.trim(),
      email: draft.email.trim(),
      membershipNumber: draft.membershipNumber.trim(),
      joinedDate: new Date().toISOString().slice(0, 10),
      role: draft.role,
      nextOfKin,
      password: draft.password,
    }, draft.chamaId);
    setFeedback(result.message);
    if (result.success) setDraft(emptyDraft);
  };

  const submitResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resetTarget) return;
    const result = await resetMemberPassword(resetTarget.id, resetPassword);
    setFeedback(result.message);
    if (result.success) {
      setResetTarget(null);
      setResetPassword('');
    }
  };

  const submitNewCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const slug = categorySlug(newCategory);
    const result = await addCategory(slug);
    setFeedback(result.message);
    if (result.success) setNewCategory('');
  };

  const submitRenameCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!renamingCategory) return;
    const result = await renameCategory(renamingCategory, categorySlug(renamedCategory));
    setFeedback(result.message);
    if (result.success) setRenamingCategory(null);
  };

  const handleRemoveAccount = (member: Member) => {
    if (!window.confirm(`Permanently remove ${member.name}'s account? Historical transactions will remain.`)) return;
    const result = deleteMemberAccount(member.id);
    setFeedback(result.message);
  };

  const handleRemoveCategory = async (category: string) => {
    const inUse = allChamas.some(chama => chama.category === category) ||
      registrationApplications.some(application => application.category === category);
    if (inUse) {
      setPendingCategoryDelete(category);
      setReplacementCategory(categoryOptions.find(option => option !== category) || '');
      return;
    }
    const result = await removeCategory(category);
    setFeedback(result.message);
  };

  const confirmCategoryRemoval = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pendingCategoryDelete) return;
    const result = await removeCategory(pendingCategoryDelete, replacementCategory);
    setFeedback(result.message);
    if (result.success) setPendingCategoryDelete(null);
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-900" role="status">
          {feedback}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900">User Accounts</h3>
            <p className="text-xs text-slate-500 mt-1">Create, edit, remove, and reset passwords for any account across all Chama workspaces.</p>
          </div>
          <button type="button" onClick={startCreate} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400">
            <Plus className="h-4 w-4" /> Add User
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid gap-3 sm:grid-cols-3 pt-1 pb-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, phone, email, Chama..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedChamaFilter}
              onChange={e => setSelectedChamaFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="all">All Chamas ({allChamas.length})</option>
              {allChamas.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedRoleFilter}
              onChange={e => setSelectedRoleFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="chairperson">Chama Admin (Chairperson)</option>
              <option value="treasurer">Treasurer</option>
              <option value="secretary">Secretary</option>
              <option value="loan_officer">Loan Officer</option>
              <option value="member">Member</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2.5">Name / Member ID</th>
                <th className="px-3 py-2.5">Chama</th>
                <th className="px-3 py-2.5">Phone</th>
                <th className="px-3 py-2.5">Role / Status</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map(({ member, chamaName }) => (
                <tr key={member.id}>
                  <td className="px-3 py-3">
                    <span className="block font-bold text-slate-900">{member.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{member.membershipNumber}</span>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{chamaName}</td>
                  <td className="px-3 py-3 font-mono text-slate-700">{member.phoneNumber}</td>
                  <td className="px-3 py-3 capitalize text-slate-700">{member.role.replace('_', ' ')} · {member.status}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" onClick={() => setResetTarget(member)} className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 font-semibold text-blue-900 hover:bg-blue-100">Reset Password</button>
                      <button type="button" onClick={() => startEdit(member)} aria-label={`Edit ${member.name}`} className="rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-100"><Pencil className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => handleRemoveAccount(member)} aria-label={`Remove ${member.name}`} className="rounded-lg border border-rose-200 p-1.5 text-rose-700 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAccounts.length === 0 && <tr><td colSpan={5} className="px-3 py-8 text-center text-slate-500">No matching user accounts found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Shield className="h-4 w-4 text-amber-600" />
          <div>
            <h3 className="font-bold text-slate-900">Chama Categories</h3>
            <p className="text-xs text-slate-500 mt-1">Changes are reflected in workspace and public registration category lists.</p>
          </div>
        </div>
        <form onSubmit={submitNewCategory} className="flex gap-2">
          <input required value={newCategory} onChange={event => setNewCategory(event.target.value)} placeholder="New category name" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs" />
          <button type="submit" className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"><Plus className="h-4 w-4" /> Add</button>
        </form>
        <div className="divide-y divide-slate-100">
          {categoryOptions.map(category => (
            <div key={category} className="flex items-center justify-between gap-3 py-2.5">
              {renamingCategory === category ? (
                <form onSubmit={submitRenameCategory} className="flex min-w-0 flex-1 gap-2">
                  <input autoFocus required value={renamedCategory} onChange={event => setRenamedCategory(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs" />
                  <button type="submit" className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white">Save</button>
                  <button type="button" onClick={() => setRenamingCategory(null)} aria-label="Cancel category rename" className="rounded-lg border border-slate-200 p-1.5 text-slate-600"><X className="h-3.5 w-3.5" /></button>
                </form>
              ) : (
                <>
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-800"><UserRound className="h-4 w-4 text-slate-400" />{displayCategory(category)}</span>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => { setRenamingCategory(category); setRenamedCategory(displayCategory(category)); }} className="rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-100" aria-label={`Rename ${displayCategory(category)}`}><Pencil className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => void handleRemoveCategory(category)} className="rounded-lg border border-rose-200 p-1.5 text-rose-700 hover:bg-rose-50" aria-label={`Remove ${displayCategory(category)}`}><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {pendingCategoryDelete && (
          <form onSubmit={confirmCategoryRemoval} className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <p className="text-xs text-amber-950">The category <strong>{displayCategory(pendingCategoryDelete)}</strong> is in use. Choose where its Chamas and applications should move before removing it.</p>
            <div className="flex flex-wrap gap-2">
              <select required value={replacementCategory} onChange={event => setReplacementCategory(event.target.value)} className="min-w-[180px] flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs">
                {categoryOptions.filter(option => option !== pendingCategoryDelete).map(option => <option key={option} value={option}>{displayCategory(option)}</option>)}
              </select>
              <button type="submit" className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700">Reassign & Remove</button>
              <button type="button" onClick={() => setPendingCategoryDelete(null)} className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-950">Cancel</button>
            </div>
          </form>
        )}
      </section>

      {(draft.chamaId || editingMember) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <form onSubmit={saveAccount} className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900">{editingMember ? 'Edit User Account' : 'Onboard User Account'}</h3>
                <p className="text-xs text-slate-500 mt-1">Passwords are stored as salted hashes.</p>
              </div>
              <button type="button" onClick={() => { setEditingMember(null); setDraft(emptyDraft); }} aria-label="Close account form" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            {!editingMember && (
              <label className="block text-xs font-semibold text-slate-700">Chama workspace
                <select required value={draft.chamaId} onChange={event => setDraft({ ...draft, chamaId: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  {allChamas.map(chama => <option key={chama.id} value={chama.id}>{chama.name}</option>)}
                </select>
              </label>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">Full name
                <input required value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Phone
                <input required type="tel" value={draft.phoneNumber} onChange={event => setDraft({ ...draft, phoneNumber: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Email
                <input type="email" value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Membership number
                <input required value={draft.membershipNumber} onChange={event => setDraft({ ...draft, membershipNumber: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Role
                <select value={draft.role} onChange={event => setDraft({ ...draft, role: event.target.value as AccountDraft['role'] })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <option value="member">Member</option><option value="chairperson">Chama Admin</option><option value="secretary">Secretary</option><option value="treasurer">Treasurer</option><option value="loan_officer">Loan Officer</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">Status
                <select value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as AccountDraft['status'] })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <option value="active">Active</option><option value="suspended">Suspended</option><option value="resigned">Resigned</option>
                </select>
              </label>
            </div>
            {editingMember ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 space-y-1">
                <label className="text-xs font-semibold text-blue-950 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-blue-600" /> Set / Reset User Password
                  </span>
                  <span className="text-[10px] text-blue-700 font-normal">Leave blank to retain current password</span>
                </label>
                <input
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Enter new password (min. 8 characters)"
                  value={draft.password}
                  onChange={event => setDraft({ ...draft, password: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ) : (
              <label className="block text-xs font-semibold text-slate-700">Initial password *
                <input required type="password" minLength={8} autoComplete="new-password" placeholder="At least 8 characters" value={draft.password} onChange={event => setDraft({ ...draft, password: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </label>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-semibold text-slate-700">Next of kin
                <input value={draft.nextOfKinName} onChange={event => setDraft({ ...draft, nextOfKinName: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Relationship
                <input value={draft.nextOfKinRelationship} onChange={event => setDraft({ ...draft, nextOfKinRelationship: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Kin phone
                <input type="tel" value={draft.nextOfKinPhone} onChange={event => setDraft({ ...draft, nextOfKinPhone: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono" />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" onClick={() => { setEditingMember(null); setDraft(emptyDraft); }} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button type="submit" className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400">{editingMember ? 'Save Changes' : 'Create Account'}</button>
            </div>
          </form>
        </div>
      )}

      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <form onSubmit={submitResetPassword} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="font-bold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-500">{resetTarget.name}</p>
            <input required type="password" minLength={8} autoComplete="new-password" value={resetPassword} onChange={event => setResetPassword(event.target.value)} placeholder="New password (at least 8 characters)" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setResetTarget(null)} className="rounded-xl px-4 py-2 text-xs text-slate-600 hover:bg-slate-100">Cancel</button>
              <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">Save Password</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
