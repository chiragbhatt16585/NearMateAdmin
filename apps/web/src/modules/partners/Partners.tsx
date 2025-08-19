import React from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, IdentificationIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import PortalModal from '../common/PortalModal';

type PartnersProps = { token: string };

type PartnerRow = {
	id: string;
	name: string;
	phone: string;
	email: string;
	loginId?: string;
	kyc?: { idType?: string; idNumber?: string; status?: string };
	bank?: { accountName?: string; accountNo?: string; ifsc?: string; bankName?: string };
	categoryKeys: string[];
};

const Partners: React.FC<PartnersProps> = ({ token }) => {
	const [cats, setCats] = React.useState<any[]>([]);
	const [partners, setPartners] = React.useState<PartnerRow[]>([]);
	const [isAddOpen, setIsAddOpen] = React.useState(false);
	const [isEditOpen, setIsEditOpen] = React.useState(false);
	const [toast, setToast] = React.useState<string | null>(null);
	const [query, setQuery] = React.useState('');
	const [viewKycPartner, setViewKycPartner] = React.useState<PartnerRow | null>(null);
	const [viewBankPartner, setViewBankPartner] = React.useState<PartnerRow | null>(null);

	// Add form
	const [pName, setPName] = React.useState('');
	const [pPhone, setPPhone] = React.useState('');
	const [pEmail, setPEmail] = React.useState('');
	const [pCatKeys, setPCatKeys] = React.useState<string[]>([]);

	// Edit form
	const [editingId, setEditingId] = React.useState<string | null>(null);
	const [eName, setEName] = React.useState('');
	const [ePhone, setEPhone] = React.useState('');
	const [eEmail, setEEmail] = React.useState('');
	const [eCatKeys, setECatKeys] = React.useState<string[]>([]);

	async function load() {
		try {
			const [cRes, pRes] = await Promise.all([
				fetch('/api/v1/categories', { headers: { Authorization: `Bearer ${token}` } }),
				fetch('/api/v1/partners', { headers: { Authorization: `Bearer ${token}` } }),
			]);
			if (cRes.status === 401 || pRes.status === 401) {
				localStorage.removeItem('accessToken');
				window.location.href = '/';
				return;
			}
			if (cRes.ok) setCats(await cRes.json());
			if (pRes.ok) {
				const rows = await pRes.json();
				setPartners(
					rows.map((r: any) => ({
						id: r.id,
						name: r.name,
						phone: r.phone || '',
						email: r.email || '',
						loginId: r.loginId || '',
						kyc: r.kyc || {},
						bank: r.bank || {},
						categoryKeys: Array.isArray(r.categories)
							? r.categories
								.map((pc: any) => pc?.serviceCategory?.key)
								.filter(Boolean)
							: [],
					}) )
				);
			}
		} catch {}
	}

	React.useEffect(() => { load(); }, []);

	function keyToLabel(k: string) {
		const found = cats.find((c: any) => c.key === k);
		return found ? found.label : k;
	}

	const filtered = partners.filter(p => (p.name + ' ' + p.email + ' ' + p.phone).toLowerCase().includes(query.toLowerCase().trim()));

	function startEdit(p: PartnerRow) {
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

	function openAdd() {
		setPName('');
		setPPhone('');
		setPEmail('');
		setPCatKeys([]);
		setIsAddOpen(true);
	}

	async function addPartner(e: React.FormEvent) {
		e.preventDefault();
		const payload: any = {
			name: pName.trim(),
			phone: pPhone.trim() || undefined,
			email: pEmail.trim() || undefined,
			categoryKeys: [...pCatKeys],
		};
		if (!payload.name) { alert('Name is required'); return; }
		const res = await fetch('/api/v1/partners', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
		if (!res.ok) {
			const msg = await res.text();
			alert(`Failed to add: ${msg}`);
			return;
		}
		setIsAddOpen(false);
		setPName(''); setPPhone(''); setPEmail(''); setPCatKeys([]);
		setToast('Partner added');
		load();
	}

	async function saveEdit() {
		if (!editingId) return;
		const body: any = {};
		if (typeof eName === 'string' && eName.trim()) body.name = eName.trim();
		body.phone = ePhone.trim().length ? ePhone.trim() : null;
		body.email = eEmail.trim().length ? eEmail.trim() : null;
		body.categoryKeys = [...eCatKeys];
		const res = await fetch(`/api/v1/partners/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
		if (!res.ok) {
			const msg = await res.text();
			alert(`Failed to save: ${msg}`);
			return;
		}
		setIsEditOpen(false);
		setEditingId(null);
		setToast('Partner updated');
		load();
	}

	async function remove(id: string) {
		if (!confirm('Delete this partner?')) return;
		await fetch(`/api/v1/partners/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
		load();
	}

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
						<button onClick={openAdd} className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-3 py-2 text-sm">
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
								<th className="px-3 py-2 text-left w-28">Login ID</th>
								<th className="px-3 py-2 text-left">Phone</th>
								<th className="px-3 py-2 text-left">Email</th>
								<th className="px-3 py-2 text-left w-28">KYC</th>
								<th className="px-3 py-2 text-left w-28">Bank</th>
								<th className="px-3 py-2 text-right w-40">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{filtered.length === 0 ? (
								<tr><td className="px-3 py-6 text-center text-gray-500" colSpan={9}>No partners</td></tr>
							) : (
								filtered.map((p, idx) => (
									<tr key={p.id} className="hover:bg-gray-50">
										<td className="px-3 py-2">{idx + 1}</td>
										<td className="px-3 py-2 font-medium">{p.name}</td>
										<td className="px-3 py-2 text-gray-700">{p.categoryKeys.map((k: string) => keyToLabel(k)).join(', ')}</td>
										<td className="px-3 py-2 text-gray-900 font-mono">{p.loginId || '—'}</td>
										<td className="px-3 py-2 text-gray-500">{p.phone || '—'}</td>
										<td className="px-3 py-2 text-gray-500">{p.email || '—'}</td>
										<td className="px-3 py-2">
											<button type="button" onClick={async ()=>{
												try {
													const res = await fetch(`/api/v1/partners/${p.id}`, { headers: { Authorization: `Bearer ${token}` } });
													if (res.ok) setViewKycPartner(await res.json()); else setViewKycPartner(p);
												} catch { setViewKycPartner(p); }
											}} className="inline-flex items-center gap-1 hover:underline">
												<IdentificationIcon className="h-4 w-4" />
												{p?.kyc?.status ? (p.kyc.status.charAt(0).toUpperCase() + p.kyc.status.slice(1)) : '—'}
											</button>
										</td>
										<td className="px-3 py-2">
											<button type="button" onClick={async ()=>{
												try {
													const res = await fetch(`/api/v1/partners/${p.id}`, { headers: { Authorization: `Bearer ${token}` } });
													if (res.ok) setViewBankPartner(await res.json()); else setViewBankPartner(p);
												} catch { setViewBankPartner(p); }
											}} className="inline-flex items-center gap-1 hover:underline">
												<BanknotesIcon className="h-4 w-4" /> {p?.bank?.accountNo ? 'Yes' : '—'}
											</button>
										</td>
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
				<PortalModal title="Add Partner" onClose={() => setIsAddOpen(false)} maxWidthClass="max-w-xl">
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
				</PortalModal>
			)}

			{isEditOpen && (
				<PortalModal title="Edit Partner" onClose={()=>setIsEditOpen(false)} maxWidthClass="max-w-xl">
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
				</PortalModal>
			)}

			{viewKycPartner && (
				<PortalModal title={`KYC — ${viewKycPartner.name}`} onClose={()=>setViewKycPartner(null)} maxWidthClass="max-w-md">
					<div className="space-y-2 text-sm">
						<div className="flex justify-between"><span className="text-gray-600">ID Type</span><span className="font-medium">{viewKycPartner?.kyc?.idType || '—'}</span></div>
						<div className="flex justify-between"><span className="text-gray-600">ID Number</span><span className="font-medium">{viewKycPartner?.kyc?.idNumber || '—'}</span></div>
						<div className="flex justify-between"><span className="text-gray-600">Status</span><span className="font-medium">{viewKycPartner?.kyc?.status ? (viewKycPartner.kyc.status.charAt(0).toUpperCase() + viewKycPartner.kyc.status.slice(1)) : '—'}</span></div>
					</div>
				</PortalModal>
			)}

			{viewBankPartner && (
				<PortalModal title={`Bank — ${viewBankPartner.name}`} onClose={()=>setViewBankPartner(null)} maxWidthClass="max-w-md">
					<div className="space-y-2 text-sm">
						<div className="flex justify-between"><span className="text-gray-600">Account Name</span><span className="font-medium">{viewBankPartner?.bank?.accountName || '—'}</span></div>
						<div className="flex justify-between"><span className="text-gray-600">Account Number</span><span className="font-medium">{viewBankPartner?.bank?.accountNo || '—'}</span></div>
						<div className="flex justify-between"><span className="text-gray-600">IFSC</span><span className="font-medium">{viewBankPartner?.bank?.ifsc || '—'}</span></div>
						<div className="flex justify-between"><span className="text-gray-600">Bank Name</span><span className="font-medium">{viewBankPartner?.bank?.bankName || '—'}</span></div>
					</div>
				</PortalModal>
			)}
		</div>
	);
};

export default Partners;


