import React from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, Squares2X2Icon, TagIcon, RectangleStackIcon, ArrowRightOnRectangleIcon, LockClosedIcon, PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';

function useAuthState() {
	const [token, setTokenState] = React.useState<string | null>(null);
	React.useEffect(() => {
		const existing = localStorage.getItem('accessToken');
		if (existing) setTokenState(existing);
	}, []);
	const setToken = (value: string | null) => {
		setTokenState(value);
		if (value) localStorage.setItem('accessToken', value);
		else localStorage.removeItem('accessToken');
	};
	return { token, setToken };
}

export const App: React.FC = () => {
	const auth = useAuthState();
	return (
		<BrowserRouter>
			{auth.token ? (
				<AppLayout onLogout={() => auth.setToken(null)}>
					<Routes>
						<Route path="/" element={<Navigate to="/dashboard" replace />} />
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/categories" element={<Categories token={auth.token} />} />
						<Route path="/items" element={<Items token={auth.token} />} />
						<Route path="/partners" element={<Partners token={auth.token} />} />
						<Route path="*" element={<Navigate to="/dashboard" replace />} />
					</Routes>
				</AppLayout>
			) : (
				<Routes>
					<Route path="/*" element={<Login onAuthed={auth.setToken} />} />
				</Routes>
			)}
		</BrowserRouter>
	);
};

const AppLayout: React.FC<{ children: React.ReactNode; onLogout: () => void }> = ({ children, onLogout }) => {
	const [open, setOpen] = React.useState(true);
	const nav = [
		{ to: '/dashboard', label: 'Dashboard', icon: Squares2X2Icon },
		{ to: '/categories', label: 'Categories', icon: TagIcon },
		{ to: '/items', label: 'Items', icon: RectangleStackIcon },
		{ to: '/partners', label: 'Partners', icon: UserGroupIcon },
	];
	return (
		<div className="min-h-screen bg-gray-50 text-gray-900 flex">
			<aside className={classNames('bg-white border-r w-64 transition-all', open ? 'w-64' : 'w-16')}>
				<div className="h-14 px-4 flex items-center justify-between border-b">
					<div className="flex items-center gap-2">
						<img src="/logo.png" alt="NearMate" className="h-6 w-6 rounded" />
						<span className={classNames('font-semibold text-sm', !open && 'hidden')}>NearMate Admin</span>
					</div>
					<button onClick={() => setOpen((v) => !v)} className="p-1 rounded hover:bg-gray-100">
						<Bars3Icon className="h-5 w-5" />
					</button>
				</div>
				<nav className="p-2 space-y-1">
					{nav.map((n) => (
						<Link key={n.to} to={n.to} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
							<n.icon className="h-5 w-5" />
							<span className={classNames('text-sm', !open && 'hidden')}>{n.label}</span>
						</Link>
					))}
					<button onClick={onLogout} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 w-full">
						<ArrowRightOnRectangleIcon className="h-5 w-5" />
						<span className={classNames('text-sm', !open && 'hidden')}>Logout</span>
					</button>
				</nav>
			</aside>
			<main className="flex-1 p-6">
				{children}
			</main>
		</div>
	);
};

const Login: React.FC<{ onAuthed: (token: string) => void }> = ({ onAuthed }) => {
	const [email, setEmail] = React.useState('admin@nearmate.local');
	const [password, setPassword] = React.useState('admin123');
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const navigate = useNavigate();

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const res = await fetch('/api/v1/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});
			if (!res.ok) throw new Error('Invalid credentials');
			const data = await res.json();
			onAuthed(data.accessToken);
			navigate('/dashboard');
		} catch (err: any) {
			setError(err.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen grid place-items-center bg-gradient-to-b from-gray-50 to-white px-4">
			<div className="w-full max-w-sm">
				<div className="mb-4 text-center">
					<div className="mx-auto h-12 w-12 grid place-items-center">
						<img src="/logo.png" alt="NearMate" className="h-12 w-12 object-contain" />
					</div>
					<div className="mt-3 text-base font-semibold">Sign in to NearMate</div>
					<div className="text-xs text-gray-500">Reliable help, right next door.</div>
				</div>
				<form onSubmit={submit} className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
					{error && <div className="text-sm text-red-600">{error}</div>}
					<div className="space-y-1">
						<label className="text-xs text-gray-600">Email</label>
						<input type="email" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
					</div>
					<div className="space-y-1">
						<label className="text-xs text-gray-600">Password</label>
						<input type="password" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
					</div>
					<button disabled={loading} className="w-full bg-black text-white rounded-lg py-2.5 text-sm disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button>
				</form>
				<div className="mt-4 text-center text-xs text-gray-500">By continuing, you agree to the Terms</div>
			</div>
		</div>
	);
};

const Dashboard: React.FC = () => {
	return (
		<div className="grid gap-4 grid-cols-1 md:grid-cols-3">
			<Card title="Bookings (today)">—</Card>
			<Card title="Active Providers">—</Card>
			<Card title="Avg. Rating">—</Card>
			<div className="md:col-span-3 bg-white rounded shadow p-4">Recent activity will appear here.</div>
		</div>
	);
};

const Card: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
	<div className="bg-white rounded shadow p-4">
		<div className="text-sm text-gray-500">{title}</div>
		<div className="text-2xl font-semibold mt-2">{children}</div>
	</div>
);

const Items: React.FC<{ token: string }> = ({ token }) => {
	const [rows, setRows] = React.useState<any[]>([]);
	const [name, setName] = React.useState('');
	const [description, setDescription] = React.useState('');
	async function load() {
		const res = await fetch('/api/v1/items', { headers: { Authorization: `Bearer ${token}` } });
		setRows(await res.json());
	}
	React.useEffect(() => { load(); }, []);
	async function add(e: React.FormEvent) {
		e.preventDefault();
		await fetch('/api/v1/items', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, description }) });
		setName(''); setDescription(''); load();
	}
	async function del(id: string) {
		await fetch(`/api/v1/items/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
		load();
	}
	return (
		<div className="space-y-4">
			<form onSubmit={add} className="bg-white shadow rounded p-4 space-y-3">
				<div className="text-lg font-medium">Create Item</div>
				<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full border rounded px-3 py-2" />
				<input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full border rounded px-3 py-2" />
				<button className="bg-black text-white rounded px-4 py-2">Add</button>
			</form>
			<div className="bg-white shadow rounded p-4">
				<div className="text-lg font-medium mb-3">Items</div>
				<ul className="divide-y">
					{rows.map((it) => (
						<li key={it.id} className="py-2 flex items-center justify-between">
							<div>
								<div className="font-medium">{it.name}</div>
								<div className="text-sm text-gray-500">{it.description}</div>
							</div>
							<button onClick={() => del(it.id)} className="text-red-600 hover:underline">Delete</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

const Categories: React.FC<{ token: string }> = ({ token }) => {
	const [rows, setRows] = React.useState<any[]>([]);
	const [keyVal, setKeyVal] = React.useState('');
	const [label, setLabel] = React.useState('');
	const [icon, setIcon] = React.useState('');
	const [tone, setTone] = React.useState('');
	const [popular, setPopular] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [editingId, setEditingId] = React.useState<string | null>(null);
	const [editKey, setEditKey] = React.useState('');
	const [editLabel, setEditLabel] = React.useState('');
	const [editIcon, setEditIcon] = React.useState('');
	const [editTone, setEditTone] = React.useState('');
	const [editPopular, setEditPopular] = React.useState(false);
	const [query, setQuery] = React.useState('');
	const [toast, setToast] = React.useState<string | null>(null);
	const [isAddOpen, setIsAddOpen] = React.useState(false);
	const [isEditOpen, setIsEditOpen] = React.useState(false);
	const [sortBy, setSortBy] = React.useState<'key'|'label'|'icon'|'tone'|'popular'|'createdAt'>('label');
	const [sortDir, setSortDir] = React.useState<'asc'|'desc'>('asc');

	async function load() {
		try {
			setLoading(true);
			setError(null);
			const res = await fetch('/api/v1/categories', { headers: { Authorization: `Bearer ${token}` } });
			if (res.status === 401) {
				localStorage.removeItem('accessToken');
				window.location.href = '/';
				return;
			}
			if (!res.ok) throw new Error('Failed to load categories');
			setRows(await res.json());
		} catch (e: any) {
			setError(e.message || 'Error');
		} finally {
			setLoading(false);
		}
	}
	React.useEffect(() => { load(); }, []);

	async function add(e: React.FormEvent) {
		e.preventDefault();
		const payload: any = { key: keyVal.trim(), label: label.trim() };
		if (!payload.key || !payload.label) { alert('Key and Label are required'); return; }
		if (icon.trim().length) payload.icon = icon.trim();
		if (tone.trim().length) payload.tone = tone.trim();
		payload.popular = !!popular;
		const res = await fetch('/api/v1/categories', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
		if (!res.ok) {
			const msg = await res.text();
			alert(`Failed to add: ${msg}`);
			return;
		}
		setKeyVal(''); setLabel(''); setIcon(''); setTone(''); setPopular(false); setIsAddOpen(false); setToast('Category added'); load();
	}
	async function del(id: string) {
		await fetch(`/api/v1/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
		load();
	}
	function startEdit(row: any) {
		setEditingId(row.id);
		setEditKey(row.key || '');
		setEditLabel(row.label || '');
		setEditIcon(row.icon || '');
		setEditTone(row.tone || '');
		setEditPopular(!!row.popular);
		setIsEditOpen(true);
	}
	function cancelEdit() {
		setEditingId(null);
		setEditKey('');
		setEditLabel('');
		setEditIcon('');
		setEditTone('');
		setEditPopular(false);
		setIsEditOpen(false);
	}
	async function saveEdit() {
		if (!editingId) return;
		const body: any = {};
		if (editKey.trim()) body.key = editKey.trim();
		if (editLabel.trim()) body.label = editLabel.trim();
		if (!body.key && !body.label && !editIcon.trim() && !editTone.trim()) { alert('Nothing to update'); return; }
		if (editIcon.trim().length) body.icon = editIcon.trim();
		if (editTone.trim().length) body.tone = editTone.trim();
		body.popular = !!editPopular;
		const res = await fetch(`/api/v1/categories/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
		if (!res.ok) {
			const msg = await res.text();
			alert(`Failed to save: ${msg}`);
			return;
		}
		cancelEdit(); setToast('Category updated');
		load();
	}

	const filtered = rows.filter((r) => ((r.key || '') + ' ' + (r.label || '')).toLowerCase().includes(query.toLowerCase().trim()));

	function toggleSort(next: 'key'|'label'|'icon'|'tone'|'popular'|'createdAt') {
		if (sortBy === next) {
			setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortBy(next);
			setSortDir('asc');
		}
	}

	const rowsSorted = React.useMemo(() => {
		const toCompare = [...filtered];
		const dir = sortDir === 'asc' ? 1 : -1;
		return toCompare.sort((a: any, b: any) => {
			let av: any;
			let bv: any;
			switch (sortBy) {
				case 'createdAt':
					av = a.createdAt ? new Date(a.createdAt).getTime() : 0;
					bv = b.createdAt ? new Date(b.createdAt).getTime() : 0;
					break;
				case 'popular':
					av = a.popular ? 1 : 0;
					bv = b.popular ? 1 : 0;
					break;
				default:
					av = (a[sortBy] || '').toString().toLowerCase();
					bv = (b[sortBy] || '').toString().toLowerCase();
			}
			if (av < bv) return -1 * dir;
			if (av > bv) return 1 * dir;
			return 0;
		});
	}, [filtered, sortBy, sortDir]);

	const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
		createPortal(
			<div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
				<div className="absolute inset-0 bg-black/40" onClick={onClose} />
				<div className="absolute inset-0 grid place-items-center p-4">
					<div className="w-full max-w-md bg-white rounded-xl shadow-xl" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
						<div className="px-4 py-3 border-b flex items-center justify-between">
							<div className="font-semibold text-sm">{title}</div>
							<button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" aria-label="Close"><XMarkIcon className="h-5 w-5" /></button>
						</div>
						<div className="p-4">{children}</div>
					</div>
				</div>
			</div>,
			document.getElementById('modal-root') as HTMLElement
		)
	);

	return (
		<div className="space-y-4">
			{toast && (
				<div className="bg-green-50 text-green-800 text-sm rounded border border-green-200 px-3 py-2">
					{toast}
				</div>
			)}
			<div className="bg-white shadow rounded p-4">
				<div className="flex items-center justify-between gap-3">
					<div className="text-lg font-medium">Categories</div>
					<div className="flex items-center gap-2">
						<div className="relative">
							<MagnifyingGlassIcon className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
							<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="pl-7 pr-3 py-2 border rounded-lg text-sm" />
						</div>
						<button onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-3 py-2 text-sm">
							<PlusIcon className="h-4 w-4" /> Add Category
						</button>
					</div>
				</div>
				<div className="mt-4 overflow-hidden border rounded-lg">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 text-gray-600">
							<tr>
								<th className="px-3 py-2 text-left w-16">#</th>
								<th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort('key')}>Key {sortBy==='key' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
								<th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort('label')}>Label {sortBy==='label' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
								<th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort('icon')}>Icon {sortBy==='icon' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
								<th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort('tone')}>Tone {sortBy==='tone' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
								<th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort('popular')}>Popular {sortBy==='popular' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
								<th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort('createdAt')}>Created {sortBy==='createdAt' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
								<th className="px-3 py-2 text-right w-40">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{loading ? (
								<tr><td className="px-3 py-6 text-center text-gray-500" colSpan={8}>Loading…</td></tr>
							) : filtered.length === 0 ? (
								<tr><td className="px-3 py-6 text-center text-gray-500" colSpan={8}>No categories</td></tr>
							) : (
								rowsSorted.map((it, idx) => (
									<tr key={it.id} className="hover:bg-gray-50">
										<td className="px-3 py-2">{idx + 1}</td>
										<td className="px-3 py-2 font-mono text-gray-700">{it.key}</td>
										<td className="px-3 py-2 font-medium">{it.label}</td>
										<td className="px-3 py-2 text-gray-500">{it.icon || '—'}</td>
										<td className="px-3 py-2"><span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded" style={{ backgroundColor: it.tone || '#eee' }} /><span className="text-gray-500">{it.tone || '—'}</span></span></td>
										<td className="px-3 py-2">
											<label className="inline-flex items-center gap-2 cursor-pointer select-none">
												<input type="checkbox" checked={!!it.popular} onChange={async (e) => { await fetch(`/api/v1/categories/${it.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ popular: e.target.checked }) }); load(); }} />
												<span className="text-sm text-gray-600">{it.popular ? 'Yes' : 'No'}</span>
											</label>
										</td>
										<td className="px-3 py-2 text-gray-500">{it.createdAt ? new Date(it.createdAt).toLocaleDateString() : '—'}</td>
										<td className="px-3 py-2">
											<div className="flex items-center justify-end gap-2">
												<button onClick={() => startEdit(it)} className="inline-flex items-center gap-1 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded px-2 py-1">
													<PencilSquareIcon className="h-4 w-4" /> Edit
												</button>
												<button onClick={() => { if (confirm('Delete this category?')) del(it.id); }} className="inline-flex items-center gap-1 text-red-700 hover:bg-red-50 border border-red-200 rounded px-2 py-1">
													<TrashIcon className="h-4 w-4" /> Delete
												</button>
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
				<Modal title="Add Category" onClose={() => setIsAddOpen(false)}>
					<form onSubmit={add} className="space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<label className="text-xs text-gray-600">Key</label>
								<input value={keyVal} onChange={(e) => setKeyVal(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. plumber" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Label</label>
								<input value={label} onChange={(e) => setLabel(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Plumber" />
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<label className="text-xs text-gray-600">Icon (optional)</label>
								<input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 🛠️ or wrench" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Tone (optional)</label>
								<input value={tone} onChange={(e) => setTone(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="#E9EEF9" />
							</div>
						</div>
						<div className="flex items-center justify-between gap-3">
							<label className="inline-flex items-center gap-2 text-sm text-gray-700">
								<input type="checkbox" checked={popular} onChange={(e)=>setPopular(e.target.checked)} /> Popular
							</label>
							<div className="flex items-center gap-2">
								<button type="button" onClick={() => setIsAddOpen(false)} className="px-3 py-2 rounded border">Cancel</button>
								<button className="px-3 py-2 rounded bg-black text-white">Save</button>
							</div>
						</div>
					</form>
				</Modal>
			)}

			{isEditOpen && (
				<Modal title="Edit Category" onClose={cancelEdit}>
					<div className="space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<label className="text-xs text-gray-600">Key</label>
								<input value={editKey} onChange={(e) => setEditKey(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Label</label>
								<input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<label className="text-xs text-gray-600">Icon (optional)</label>
								<input value={editIcon} onChange={(e) => setEditIcon(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Tone (optional)</label>
								<input value={editTone} onChange={(e) => setEditTone(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
							</div>
						</div>
						<div className="flex items-center justify-between gap-3">
							<label className="inline-flex items-center gap-2 text-sm text-gray-700">
								<input type="checkbox" checked={editPopular} onChange={(e)=>setEditPopular(e.target.checked)} /> Popular
							</label>
							<div className="flex items-center gap-2">
								<button onClick={cancelEdit} className="px-3 py-2 rounded border">Cancel</button>
								<button onClick={saveEdit} className="px-3 py-2 rounded bg-black text-white">Save</button>
							</div>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
};

const Partners: React.FC<{ token: string }> = ({ token }) => {
	const [cats, setCats] = React.useState<any[]>([]);
	const [partners, setPartners] = React.useState<any[]>([]);
	const [isAddOpen, setIsAddOpen] = React.useState(false);
	const [isEditOpen, setIsEditOpen] = React.useState(false);
	const [toast, setToast] = React.useState<string | null>(null);
	const [query, setQuery] = React.useState('');

	// Add form
	const [pName, setPName] = React.useState('Chirag Bhatt');
	const [pPhone, setPPhone] = React.useState('');
	const [pEmail, setPEmail] = React.useState('');
	const [pCatKeys, setPCatKeys] = React.useState<string[]>(['electrician', 'ac']);

	// Edit form
	const [editingId, setEditingId] = React.useState<string | null>(null);
	const [eName, setEName] = React.useState('');
	const [ePhone, setEPhone] = React.useState('');
	const [eEmail, setEEmail] = React.useState('');
	const [eCatKeys, setECatKeys] = React.useState<string[]>([]);

	React.useEffect(() => {
		(async () => {
			try {
				const res = await fetch('/api/v1/categories', { headers: { Authorization: `Bearer ${token}` } });
				if (res.ok) {
					const data = await res.json();
					setCats(data);
					// Seed one dummy partner only once when empty
					setPartners((prev) => prev.length ? prev : [
						{ id: crypto.randomUUID(), name: 'Chirag Bhatt', phone: '', email: '', categoryKeys: ['electrician','ac'] },
					]);
				}
			} catch {}
		})();
	}, [token]);

	function keyToLabel(k: string) {
		const found = cats.find((c: any) => c.key === k);
		return found ? found.label : k;
	}

	const filtered = partners.filter(p => (p.name + ' ' + p.email + ' ' + p.phone).toLowerCase().includes(query.toLowerCase().trim()));

	function startEdit(p: any) {
		setEditingId(p.id);
		setEName(p.name);
		setEPhone(p.phone || '');
		setEEmail(p.email || '');
		setECatKeys([...p.categoryKeys]);
		setIsEditOpen(true);
	}

	function toggleArray(setter: (v: React.SetStateAction<string[]>) => void, key: string) {
		setter((prev) => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
	}

	function addPartner(e: React.FormEvent) {
		e.preventDefault();
		setPartners(prev => [...prev, { id: crypto.randomUUID(), name: pName.trim(), phone: pPhone.trim(), email: pEmail.trim(), categoryKeys: [...pCatKeys] }]);
		setToast('Partner added');
		setIsAddOpen(false);
		setPName(''); setPPhone(''); setPEmail(''); setPCatKeys([]);
	}

	function saveEdit() {
		if (!editingId) return;
		setPartners(prev => prev.map(p => p.id === editingId ? { ...p, name: eName.trim(), phone: ePhone.trim(), email: eEmail.trim(), categoryKeys: [...eCatKeys] } : p));
		setToast('Partner updated');
		setIsEditOpen(false);
		setEditingId(null);
	}

	function remove(id: string) {
		if (!confirm('Delete this partner?')) return;
		setPartners(prev => prev.filter(p => p.id !== id));
	}

	const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
		<div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className="absolute inset-0 grid place-items-center p-4">
				<div className="w-full max-w-xl bg-white rounded-xl shadow-xl" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
					<div className="px-4 py-3 border-b flex items-center justify-between">
						<div className="font-semibold text-sm">{title}</div>
						<button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" aria-label="Close"><XMarkIcon className="h-5 w-5" /></button>
					</div>
					<div className="p-4">{children}</div>
				</div>
			</div>
		</div>
	);

	return (
		<div className="space-y-4">
			{toast && <div className="bg-green-50 text-green-800 text-sm rounded border border-green-200 px-3 py-2">{toast}</div>}
			<div className="bg-white shadow rounded p-4">
				<div className="flex items-center justify-between gap-3">
					<div className="text-lg font-medium">Partners</div>
					<div className="flex items-center gap-2">
						<div className="relative">
							<MagnifyingGlassIcon className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
							<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="pl-7 pr-3 py-2 border rounded-lg text-sm" />
						</div>
						<button onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-3 py-2 text-sm">
							<PlusIcon className="h-4 w-4" /> Add Partner
						</button>
					</div>
				</div>
				<div className="mt-4 overflow-hidden border rounded-lg">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 text-gray-600">
							<tr>
								<th className="px-3 py-2 text-left w-16">#</th>
								<th className="px-3 py-2 text-left">Name</th>
								<th className="px-3 py-2 text-left">Categories</th>
								<th className="px-3 py-2 text-left">Contact</th>
								<th className="px-3 py-2 text-right w-40">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{filtered.length === 0 ? (
								<tr><td className="px-3 py-6 text-center text-gray-500" colSpan={5}>No partners</td></tr>
							) : (
								filtered.map((p, idx) => (
									<tr key={p.id} className="hover:bg-gray-50">
										<td className="px-3 py-2">{idx + 1}</td>
										<td className="px-3 py-2 font-medium">{p.name}</td>
										<td className="px-3 py-2 text-gray-700">{p.categoryKeys.map((k: string) => keyToLabel(k)).join(', ')}</td>
										<td className="px-3 py-2 text-gray-500">{[p.phone, p.email].filter(Boolean).join(' • ') || '—'}</td>
										<td className="px-3 py-2">
											<div className="flex items-center justify-end gap-2">
												<button onClick={() => startEdit(p)} className="inline-flex items-center gap-1 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded px-2 py-1"><PencilSquareIcon className="h-4 w-4" /> Edit</button>
												<button onClick={() => remove(p.id)} className="inline-flex items-center gap-1 text-red-700 hover:bg-red-50 border border-red-200 rounded px-2 py-1"><TrashIcon className="h-4 w-4" /> Delete</button>
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
				<Modal title="Add Partner" onClose={() => setIsAddOpen(false)}>
					<form onSubmit={addPartner} className="space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<label className="text-xs text-gray-600">Name</label>
								<input value={pName} onChange={(e)=>setPName(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Partner name" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Phone</label>
								<input value={pPhone} onChange={(e)=>setPPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Phone" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Email</label>
								<input value={pEmail} onChange={(e)=>setPEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Email" />
							</div>
						</div>
						<div>
							<label className="text-xs text-gray-600">Categories</label>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
								{cats.map((c:any)=> (
									<label key={c.id} className="inline-flex items-center gap-2 text-sm">
										<input type="checkbox" checked={pCatKeys.includes(c.key)} onChange={()=>toggleArray(setPCatKeys, c.key)} /> {c.label}
									</label>
								))}
							</div>
						</div>
						<div className="flex items-center justify-end gap-2">
							<button type="button" onClick={()=>setIsAddOpen(false)} className="px-3 py-2 rounded border">Cancel</button>
							<button className="px-3 py-2 rounded bg-black text-white">Save</button>
						</div>
					</form>
				</Modal>
			)}

			{isEditOpen && (
				<Modal title="Edit Partner" onClose={()=>setIsEditOpen(false)}>
					<div className="space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<label className="text-xs text-gray-600">Name</label>
								<input value={eName} onChange={(e)=>setEName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Phone</label>
								<input value={ePhone} onChange={(e)=>setEPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Email</label>
								<input value={eEmail} onChange={(e)=>setEEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
							</div>
						</div>
						<div>
							<label className="text-xs text-gray-600">Categories</label>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
								{cats.map((c:any)=> (
									<label key={c.id} className="inline-flex items-center gap-2 text-sm">
										<input type="checkbox" checked={eCatKeys.includes(c.key)} onChange={()=>toggleArray(setECatKeys, c.key)} /> {c.label}
									</label>
								))}
							</div>
						</div>
						<div className="flex items-center justify-end gap-2">
							<button onClick={()=>setIsEditOpen(false)} className="px-3 py-2 rounded border">Cancel</button>
							<button onClick={saveEdit} className="px-3 py-2 rounded bg-black text-white">Save</button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
};
