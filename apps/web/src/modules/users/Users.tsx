import React from 'react';
import PortalModal from '../common/PortalModal';

type UsersProps = { token: string };

const ROLES = [
	' Super Admin',
	'Administrator',
	'Payment Collector',
	'Sales Executive',
	'Support Staff',
].map(r => r.trim());

const Users: React.FC<UsersProps> = ({ token }) => {
	const [rows, setRows] = React.useState<any[]>([]);
	const [query, setQuery] = React.useState('');
	const [isAddOpen, setIsAddOpen] = React.useState(false);
	const [isEditOpen, setIsEditOpen] = React.useState(false);
	const [editingId, setEditingId] = React.useState<string | null>(null);

	// add form
	const [aEmail, setAEmail] = React.useState('');
	const [aName, setAName] = React.useState('');
	const [aPassword, setAPassword] = React.useState('');
	const [aRole, setARole] = React.useState(ROLES[1]);

	// edit form
	const [eName, setEName] = React.useState('');
	const [eRole, setERole] = React.useState(ROLES[1]);
	const [eStatus, setEStatus] = React.useState('active');
	const [ePassword, setEPassword] = React.useState('');

	async function load() {
		const res = await fetch(`/api/v1/users?search=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } });
		if (res.ok) setRows(await res.json());
	}

	React.useEffect(() => { load(); }, []);

	async function addUser(e: React.FormEvent) {
		e.preventDefault();
		const payload = { email: aEmail.trim(), name: aName.trim(), password: aPassword.trim(), role: aRole };
		if (!payload.email || !payload.name || !payload.password) { alert('All fields required'); return; }
		const res = await fetch('/api/v1/users', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
		if (!res.ok) { alert(await res.text()); return; }
		setIsAddOpen(false);
		setAEmail(''); setAName(''); setAPassword(''); setARole(ROLES[1]);
		load();
	}

	function startEdit(row: any) {
		setEditingId(row.id);
		setEName(row.name || '');
		setERole(row.role || ROLES[1]);
		setEStatus(row.status || 'active');
		setEPassword('');
		setIsEditOpen(true);
	}

	async function saveEdit() {
		if (!editingId) return;
		const payload: any = { name: eName.trim(), role: eRole, status: eStatus };
		if (ePassword.trim()) payload.password = ePassword.trim();
		const res = await fetch(`/api/v1/users/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
		if (!res.ok) { alert(await res.text()); return; }
		setIsEditOpen(false); setEditingId(null);
		load();
	}

	async function remove(id: string) {
		if (!confirm('Delete this user?')) return;
		await fetch(`/api/v1/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
		load();
	}

	const filtered = rows;

	return (
		<div className="space-y-4">
			<div className="bg-white shadow rounded p-4">
				<div className="flex items-center justify-between gap-3">
					<div className="text-lg font-medium">Users</div>
					<div className="flex items-center gap-2">
						<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="px-3 py-2 border rounded-lg text-sm" />
						<button onClick={() => { setIsAddOpen(true); }} className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-3 py-2 text-sm">Add User</button>
					</div>
				</div>
				<div className="mt-4 overflow-hidden border rounded-lg">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 text-gray-600">
							<tr>
								<th className="px-3 py-2 text-left w-16">#</th>
								<th className="px-3 py-2 text-left">Name</th>
								<th className="px-3 py-2 text-left">Email</th>
								<th className="px-3 py-2 text-left">Role</th>
								<th className="px-3 py-2 text-left">Status</th>
								<th className="px-3 py-2 text-right w-40">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{filtered.length === 0 ? (
								<tr><td className="px-3 py-6 text-center text-gray-500" colSpan={6}>No users</td></tr>
							) : (
								filtered.map((u: any, idx: number) => (
									<tr key={u.id} className="hover:bg-gray-50">
										<td className="px-3 py-2">{idx + 1}</td>
										<td className="px-3 py-2 font-medium">{u.name}</td>
										<td className="px-3 py-2 text-gray-500">{u.email}</td>
										<td className="px-3 py-2">{u.role}</td>
										<td className="px-3 py-2">{u.status}</td>
										<td className="px-3 py-2">
											<div className="flex items-center justify-end gap-2">
												<button onClick={() => startEdit(u)} className="inline-flex items-center gap-1 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded px-2 py-1">Edit</button>
												<button onClick={() => remove(u.id)} className="inline-flex items-center gap-1 text-red-700 hover:bg-red-50 border border-red-200 rounded px-2 py-1">Delete</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{isAddOpen && (
				<PortalModal title="Add User" onClose={() => setIsAddOpen(false)} maxWidthClass="max-w-xl">
					<form onSubmit={addUser} className="space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<label className="text-xs text-gray-600">Name</label>
								<input value={aName} onChange={(e)=>setAName(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Full name" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Email</label>
								<input type="email" value={aEmail} onChange={(e)=>setAEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="you@example.com" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Password</label>
								<input type="password" value={aPassword} onChange={(e)=>setAPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="••••••••" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Role</label>
								<select value={aRole} onChange={(e)=>setARole(e.target.value)} className="w-full border rounded-lg px-3 py-2">
									{ROLES.map(r => <option key={r} value={r}>{r}</option>)}
								</select>
							</div>
						</div>
						<div className="flex items-center justify-end gap-2">
							<button type="button" onClick={()=>setIsAddOpen(false)} className="px-3 py-2 rounded border">Cancel</button>
							<button className="px-3 py-2 rounded bg-black text-white">Save</button>
						</div>
					</form>
				</PortalModal>
			)}

			{isEditOpen && (
				<PortalModal title="Edit User" onClose={()=>setIsEditOpen(false)} maxWidthClass="max-w-xl">
					<div className="space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<label className="text-xs text-gray-600">Name</label>
								<input value={eName} onChange={(e)=>setEName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Role</label>
								<select value={eRole} onChange={(e)=>setERole(e.target.value)} className="w-full border rounded-lg px-3 py-2">
									{ROLES.map(r => <option key={r} value={r}>{r}</option>)}
								</select>
							</div>
							<div>
								<label className="text-xs text-gray-600">Status</label>
								<select value={eStatus} onChange={(e)=>setEStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2">
									<option value="active">active</option>
									<option value="disabled">disabled</option>
								</select>
							</div>
							<div>
								<label className="text-xs text-gray-600">New Password (optional)</label>
								<input type="password" value={ePassword} onChange={(e)=>setEPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
							</div>
						</div>
						<div className="flex items-center justify-end gap-2">
							<button onClick={()=>setIsEditOpen(false)} className="px-3 py-2 rounded border">Cancel</button>
							<button onClick={saveEdit} className="px-3 py-2 rounded bg-black text-white">Save</button>
						</div>
					</div>
				</PortalModal>
			)}
		</div>
	);
};

export default Users;


