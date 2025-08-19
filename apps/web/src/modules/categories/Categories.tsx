import React from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PortalModal from '../common/PortalModal';

type CategoriesProps = { token: string };

const Categories: React.FC<CategoriesProps> = ({ token }) => {
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
				<PortalModal title="Add Category" onClose={() => setIsAddOpen(false)}>
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
				</PortalModal>
			)}

			{isEditOpen && (
				<PortalModal title="Edit Category" onClose={cancelEdit}>
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
				</PortalModal>
			)}
		</div>
	);
};

export default Categories;


