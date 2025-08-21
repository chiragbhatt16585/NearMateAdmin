import React from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, IdentificationIcon, BanknotesIcon, CurrencyRupeeIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import PortalModal from '../common/PortalModal';

type PartnersProps = { token: string };

type PartnerRow = {
	id: string;
	name: string;
	phone: string;
	email: string;
	loginId?: string;
	kycs?: { id: string; idType?: string; idNumber?: string; status?: string; docUrl?: string }[];
	bank?: { accountName?: string; accountNo?: string; ifsc?: string; bankName?: string };
	categoryKeys: string[];
	serviceRadiusKm?: number;
	isAvailable?: boolean;
	pricingType?: string;
	priceMin?: number | null;
	priceMax?: number | null;
	plan?: string | null;
	planStatus?: string | null;
	boostActive?: boolean;
	boostStart?: string | null;
	boostEnd?: string | null;
	ratingAvg?: number;
	ratingCount?: number;
	ratings?: { id: string; rating: number; comment?: string; createdAt: string; booking: { user: { name: string }; category: { label: string } } }[];
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
	const [viewPlanPartner, setViewPlanPartner] = React.useState<PartnerRow | null>(null);
	const [viewRatingsPartner, setViewRatingsPartner] = React.useState<PartnerRow | null>(null);

	// Add form
	const [pName, setPName] = React.useState('');
	const [pPhone, setPPhone] = React.useState('');
	const [pEmail, setPEmail] = React.useState('');
	const [pCatKeys, setPCatKeys] = React.useState<string[]>([]);
	const [pRadius, setPRadius] = React.useState<number>(5);
	const [pAvailable, setPAvailable] = React.useState<boolean>(true);
	const [pPricingType, setPPricingType] = React.useState<string>('hourly');
	const [pPriceMin, setPPriceMin] = React.useState<string>('');
	const [pPriceMax, setPPriceMax] = React.useState<string>('');
	const [pPlan, setPPlan] = React.useState<string>('');
	const [pPlanStatus, setPPlanStatus] = React.useState<string>('active');
	const [pBoostActive, setPBoostActive] = React.useState<boolean>(false);
	const [pBoostStart, setPBoostStart] = React.useState<string>('');
	const [pBoostEnd, setPBoostEnd] = React.useState<string>('');
	const [pKycIdType, setPKycIdType] = React.useState<string>('');
	const [pKycIdNumber, setPKycIdNumber] = React.useState<string>('');
	const [pKycDocUrl, setPKycDocUrl] = React.useState<string>('');
	const [pKycStatus, setPKycStatus] = React.useState<string>('pending');

	// Edit form
	const [editingId, setEditingId] = React.useState<string | null>(null);
	const [eName, setEName] = React.useState('');
	const [ePhone, setEPhone] = React.useState('');
	const [eEmail, setEEmail] = React.useState('');
	const [eCatKeys, setECatKeys] = React.useState<string[]>([]);
	const [eRadius, setERadius] = React.useState<number>(5);
	const [eAvailable, setEAvailable] = React.useState<boolean>(true);
	const [ePricingType, setEPricingType] = React.useState<string>('hourly');
	const [ePriceMin, setEPriceMin] = React.useState<string>('');
	const [ePriceMax, setEPriceMax] = React.useState<string>('');
	const [ePlan, setEPlan] = React.useState<string>('');
	const [ePlanStatus, setEPlanStatus] = React.useState<string>('active');
	const [eBoostActive, setEBoostActive] = React.useState<boolean>(false);
	const [eBoostStart, setEBoostStart] = React.useState<string>('');
	const [eBoostEnd, setEBoostEnd] = React.useState<string>('');
	const [eKycIdType, setEKycIdType] = React.useState<string>('');
	const [eKycIdNumber, setEKycIdNumber] = React.useState<string>('');
	const [eKycDocUrl, setEKycDocUrl] = React.useState<string>('');
	const [eKycStatus, setEKycStatus] = React.useState<string>('pending');

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
				const payload = await pRes.json();
				const rows = Array.isArray(payload) ? payload : (Array.isArray((payload as any)?.data) ? (payload as any).data : []);
				setPartners(
					rows.map((r: any) => ({
						id: r.id,
						name: r.name,
						phone: r.phone || '',
						email: r.email || '',
						loginId: r.loginId || '',
						kycs: Array.isArray(r.kycs) ? r.kycs : [],
						bank: r.bank || {},
						categoryKeys: Array.isArray(r.categories)
							? r.categories
								.map((pc: any) => pc?.serviceCategory?.key)
								.filter(Boolean)
							: [],
						serviceRadiusKm: r.serviceRadiusKm,
						isAvailable: r.isAvailable,
						pricingType: r.pricingType || '',
						priceMin: typeof r.priceMin === 'number' ? r.priceMin : null,
						priceMax: typeof r.priceMax === 'number' ? r.priceMax : null,
						plan: r.plan || '',
						planStatus: r.planStatus || '',
						boostActive: !!r.boostActive,
						boostStart: r.boostStart ? new Date(r.boostStart).toISOString().slice(0,16) : '',
						boostEnd: r.boostEnd ? new Date(r.boostEnd).toISOString().slice(0,16) : '',
						ratingAvg: r.ratingAvg,
						ratingCount: r.ratingCount,
						ratings: Array.isArray(r.ratings) ? r.ratings : [],
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
		setERadius(p.serviceRadiusKm ?? 5);
		setEAvailable(!!p.isAvailable);
		setEPricingType(p.pricingType || 'hourly');
		setEPriceMin(p.priceMin != null ? String(p.priceMin) : '');
		setEPriceMax(p.priceMax != null ? String(p.priceMax) : '');
		setEPlan(p.plan || '');
		setEPlanStatus(p.planStatus || 'active');
		setEBoostActive(!!p.boostActive);
		setEBoostStart(p.boostStart || '');
		setEBoostEnd(p.boostEnd || '');
		setEKycIdType('');
		setEKycIdNumber('');
		setEKycDocUrl('');
		setEKycStatus('pending');
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
		setPRadius(5);
		setPAvailable(true);
		setPPricingType('hourly');
		setPPriceMin('');
		setPPriceMax('');
		setPPlan('');
		setPPlanStatus('active');
		setPBoostActive(false);
		setPBoostStart('');
		setPBoostEnd('');
		setPKycIdType('');
		setPKycIdNumber('');
		setPKycDocUrl('');
		setPKycStatus('pending');
		setIsAddOpen(true);
	}

	async function addPartner(e: React.FormEvent) {
		e.preventDefault();
		const payload: any = {
			name: pName.trim(),
			phone: pPhone.trim() || undefined,
			email: pEmail.trim() || undefined,
			categoryKeys: [...pCatKeys],
			serviceRadiusKm: Number.isFinite(Number(pRadius)) ? Number(pRadius) : undefined,
			isAvailable: !!pAvailable,
			pricingType: pPricingType || undefined,
			priceMin: pPriceMin.trim() ? Number(pPriceMin) : undefined,
			priceMax: pPriceMax.trim() ? Number(pPriceMax) : undefined,
			plan: pPlan.trim() || undefined,
			planStatus: pPlanStatus.trim() || undefined,
			boostActive: !!pBoostActive,
			boostStart: pBoostStart || undefined,
			boostEnd: pBoostEnd || undefined,
			kyc: (pKycIdType || pKycIdNumber || pKycDocUrl || pKycStatus) ? {
				idType: pKycIdType || undefined,
				idNumber: pKycIdNumber || undefined,
				docUrl: pKycDocUrl || undefined,
				status: pKycStatus || undefined,
			} : undefined,
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
		body.serviceRadiusKm = Number.isFinite(Number(eRadius)) ? Number(eRadius) : undefined;
		body.isAvailable = !!eAvailable;
		body.pricingType = ePricingType || null;
		body.priceMin = ePriceMin.trim() ? Number(ePriceMin) : null;
		body.priceMax = ePriceMax.trim() ? Number(ePriceMax) : null;
		body.plan = ePlan || null;
		body.planStatus = ePlanStatus || null;
		body.boostActive = !!eBoostActive;
		body.boostStart = eBoostStart || null;
		body.boostEnd = eBoostEnd || null;
		body.kyc = {
			idType: eKycIdType || null,
			idNumber: eKycIdNumber || null,
			docUrl: eKycDocUrl || null,
			status: eKycStatus || null,
		};
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
								<th className="px-3 py-2 text-left w-20">Radius</th>
								<th className="px-3 py-2 text-left w-16">Avail.</th>
								<th className="px-3 py-2 text-left w-32">Pricing</th>
								<th className="px-3 py-2 text-left w-28">KYC</th>
								<th className="px-3 py-2 text-left w-28">Bank</th>
								<th className="px-3 py-2 text-left w-24">Plan</th>
								<th className="px-3 py-2 text-left w-24">Ratings</th>
								<th className="px-3 py-2 text-right w-40">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{filtered.length === 0 ? (
								<tr><td className="px-3 py-6 text-center text-gray-500" colSpan={10}>No partners</td></tr>
							) : (
								filtered.map((p, idx) => (
									<tr key={p.id} className="hover:bg-gray-50">
										<td className="px-3 py-2">{idx + 1}</td>
										<td className="px-3 py-2 font-medium">{p.name}</td>
										<td className="px-3 py-2 text-gray-700">{p.categoryKeys.map((k: string) => keyToLabel(k)).join(', ')}</td>
										<td className="px-3 py-2 text-gray-900 font-mono">{p.loginId || '—'}</td>
										<td className="px-3 py-2 text-gray-500">{p.phone || '—'}</td>
										<td className="px-3 py-2 text-gray-500">{p.email || '—'}</td>
										<td className="px-3 py-2 text-gray-500">{(p.serviceRadiusKm ?? 5)} km</td>
										<td className="px-3 py-2">
											<span className={"inline-flex items-center px-2 py-0.5 rounded text-xs " + (p.isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600')}>{p.isAvailable ? 'On' : 'Off'}</span>
										</td>
										<td className="px-3 py-2 text-gray-700">
											{p.pricingType ? (p.pricingType === 'hourly' ? 'Hourly' : 'Fixed') : '—'}
											{(p.priceMin != null || p.priceMax != null) && (
												<div className="text-xs text-gray-500">{p.priceMin != null ? `₹${p.priceMin}` : ''}{p.priceMax != null ? ` - ₹${p.priceMax}` : ''}</div>
											)}
										</td>
										<td className="px-3 py-2">
											<button type="button" onClick={async ()=>{
												try {
													const res = await fetch(`/api/v1/partners/${p.id}/kyc`, { headers: { Authorization: `Bearer ${token}` } });
													if (res.ok) { const kycs = await res.json(); setViewKycPartner({ ...p, kycs } as any); } else { setViewKycPartner(p); }
												} catch { setViewKycPartner(p); }
											}} className="inline-flex items-center gap-1 hover:underline">
												<IdentificationIcon className="h-4 w-4" /> {/* show count if available */}
												{Array.isArray((p as any).kycs) && (p as any).kycs.length ? `${(p as any).kycs.length} docs` : 'Manage'}
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
											<button type="button" onClick={()=> setViewPlanPartner(p)} className="inline-flex items-center gap-1 hover:underline">
												<CurrencyRupeeIcon className="h-4 w-4" /> {p.plan ? p.plan : 'Plan'}
											</button>
										</td>
										<td className="px-3 py-2">
											<button 
												type="button" 
												onClick={() => setViewRatingsPartner(p)}
												className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded"
											>
												<div className="flex items-center gap-1">
													<span className="text-yellow-500">★</span>
													<span className="font-medium">{p.ratingAvg?.toFixed(1) || '—'}</span>
												</div>
												<span className="text-xs text-gray-500">({p.ratingCount || 0})</span>
											</button>
										</td>
										<td className="px-3 py-2">
											<div className="flex items-center justify-end gap-2">
												<button onClick={() => startEdit(p)} className="inline-flex items-center gap-1 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded px-2 py-1"><Cog6ToothIcon className="h-4 w-4" /> Edit</button>
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
							<div>
								<label className="text-xs text-gray-600">Service radius (km)</label>
								<input type="number" min={0} value={pRadius} onChange={(e)=>setPRadius(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2" placeholder="5" />
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
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div>
								<label className="text-xs text-gray-600">Availability</label>
								<div className="mt-1"><label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={pAvailable} onChange={(e)=>setPAvailable(e.target.checked)} /> Available</label></div>
							</div>
							<div>
								<label className="text-xs text-gray-600">Pricing Type</label>
								<select value={pPricingType} onChange={(e)=>setPPricingType(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
									<option value="hourly">Hourly</option>
									<option value="fixed">Fixed</option>
								</select>
							</div>
							<div>
								<label className="text-xs text-gray-600">Price Range</label>
								<div className="flex gap-2 mt-1">
									<input type="number" placeholder="Min" value={pPriceMin} onChange={(e)=>setPPriceMin(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
									<input type="number" placeholder="Max" value={pPriceMax} onChange={(e)=>setPPriceMax(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
								</div>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div>
								<label className="text-xs text-gray-600">Plan</label>
								<input value={pPlan} onChange={(e)=>setPPlan(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" placeholder="Gold / Basic" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Plan Status</label>
								<select value={pPlanStatus} onChange={(e)=>setPPlanStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
									<option value="active">Active</option>
									<option value="paused">Paused</option>
									<option value="expired">Expired</option>
								</select>
							</div>
							<div>
								<label className="text-xs text-gray-600">Boost</label>
								<div className="mt-1 flex items-center gap-2">
									<label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={pBoostActive} onChange={(e)=>setPBoostActive(e.target.checked)} /> Active</label>
								</div>
								<div className="mt-2 grid grid-cols-2 gap-2">
									<input type="datetime-local" value={pBoostStart} onChange={(e)=>setPBoostStart(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
									<input type="datetime-local" value={pBoostEnd} onChange={(e)=>setPBoostEnd(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
								</div>
							</div>
						</div>
						<div>
							<label className="text-xs text-gray-600">KYC</label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
								<div>
									<label className="text-xs text-gray-600">ID Type</label>
									<select value={pKycIdType} onChange={(e)=>setPKycIdType(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
										<option value="">Select</option>
										<option value="Aadhar Card">Aadhaar</option>
										<option value="Pan Card">PAN</option>
										<option value="GST">GST</option>
									</select>
								</div>
								<div>
									<label className="text-xs text-gray-600">ID Number</label>
									<input value={pKycIdNumber} onChange={(e)=>setPKycIdNumber(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" />
								</div>
								<div>
									<label className="text-xs text-gray-600">Document URL</label>
									<input value={pKycDocUrl} onChange={(e)=>setPKycDocUrl(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" placeholder="https://..." />
								</div>
								<div>
									<label className="text-xs text-gray-600">Verification Status</label>
									<select value={pKycStatus} onChange={(e)=>setPKycStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
										<option value="pending">Pending</option>
										<option value="verified">Approved</option>
										<option value="rejected">Rejected</option>
									</select>
								</div>
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
							<div>
								<label className="text-xs text-gray-600">Service radius (km)</label>
								<input type="number" min={0} value={eRadius} onChange={(e)=>setERadius(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2" />
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
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div>
								<label className="text-xs text-gray-600">Availability</label>
								<div className="mt-1"><label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={eAvailable} onChange={(e)=>setEAvailable(e.target.checked)} /> Available</label></div>
							</div>
							<div>
								<label className="text-xs text-gray-600">Pricing Type</label>
								<select value={ePricingType} onChange={(e)=>setEPricingType(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
									<option value="hourly">Hourly</option>
									<option value="fixed">Fixed</option>
								</select>
							</div>
							<div>
								<label className="text-xs text-gray-600">Price Range</label>
								<div className="flex gap-2 mt-1">
									<input type="number" placeholder="Min" value={ePriceMin} onChange={(e)=>setEPriceMin(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
									<input type="number" placeholder="Max" value={ePriceMax} onChange={(e)=>setEPriceMax(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
								</div>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div>
								<label className="text-xs text-gray-600">Plan</label>
								<input value={ePlan} onChange={(e)=>setEPlan(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" />
							</div>
							<div>
								<label className="text-xs text-gray-600">Plan Status</label>
								<select value={ePlanStatus} onChange={(e)=>setEPlanStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
									<option value="active">Active</option>
									<option value="paused">Paused</option>
									<option value="expired">Expired</option>
								</select>
							</div>
							<div>
								<label className="text-xs text-gray-600">Boost</label>
								<div className="mt-1 flex items-center gap-2">
									<label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={eBoostActive} onChange={(e)=>setEBoostActive(e.target.checked)} /> Active</label>
								</div>
								<div className="mt-2 grid grid-cols-2 gap-2">
									<input type="datetime-local" value={eBoostStart} onChange={(e)=>setEBoostStart(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
									<input type="datetime-local" value={eBoostEnd} onChange={(e)=>setEBoostEnd(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
								</div>
							</div>
						</div>
						<div>
							<label className="text-xs text-gray-600">KYC</label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
								<div>
									<label className="text-xs text-gray-600">ID Type</label>
									<select value={eKycIdType} onChange={(e)=>setEKycIdType(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
										<option value="">Select</option>
										<option value="Aadhar Card">Aadhaar</option>
										<option value="Pan Card">PAN</option>
										<option value="GST">GST</option>
									</select>
								</div>
								<div>
									<label className="text-xs text-gray-600">ID Number</label>
									<input value={eKycIdNumber} onChange={(e)=>setEKycIdNumber(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" />
								</div>
								<div>
									<label className="text-xs text-gray-600">Document URL</label>
									<input value={eKycDocUrl} onChange={(e)=>setEKycDocUrl(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" placeholder="https://..." />
								</div>
								<div>
									<label className="text-xs text-gray-600">Verification Status</label>
									<select value={eKycStatus} onChange={(e)=>setEKycStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
										<option value="pending">Pending</option>
										<option value="verified">Approved</option>
										<option value="rejected">Rejected</option>
									</select>
								</div>
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
				<PortalModal title={`KYC — ${viewKycPartner.name}`} onClose={()=>setViewKycPartner(null)} maxWidthClass="max-w-2xl">
					<div className="space-y-3 text-sm">
						<div className="flex items-center justify-between">
							<div className="text-gray-600">Documents</div>
							<button onClick={async ()=>{
								// reload kycs
								try {
									const res = await fetch(`/api/v1/partners/${viewKycPartner.id}/kyc`, { headers: { Authorization: `Bearer ${token}` } });
									if (res.ok) {
										const kycs = await res.json();
										setViewKycPartner({ ...viewKycPartner, kycs } as any);
									}
								} catch {}
							}} className="text-xs underline">Refresh</button>
						</div>
						<div className="border rounded divide-y">
							{Array.isArray((viewKycPartner as any).kycs) && (viewKycPartner as any).kycs.length ? (
								(viewKycPartner as any).kycs.map((k:any)=> (
									<div key={k.id} className="p-3 flex items-center justify-between gap-3">
										<div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
											<div><div className="text-gray-500">ID Type</div><div className="font-medium">{k.idType || '—'}</div></div>
											<div><div className="text-gray-500">ID Number</div><div className="font-medium">{k.idNumber || '—'}</div></div>
											<div><div className="text-gray-500">Status</div><div className="font-medium">{k.status || 'pending'}</div></div>
											<div><div className="text-gray-500">Doc</div><div className="truncate"><a className="text-blue-700 hover:underline" href={k.docUrl} target="_blank" rel="noreferrer">{k.docUrl || '—'}</a></div></div>
										</div>
										<div className="flex items-center gap-2">
											<button className="px-2 py-1 text-xs border rounded" onClick={async ()=>{
												const next = prompt('Update status (pending/verified/rejected):', k.status || 'pending');
												if (next == null) return;
												await fetch(`/api/v1/partners/${viewKycPartner.id}/kyc/${k.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: next }) });
												const res = await fetch(`/api/v1/partners/${viewKycPartner.id}/kyc`, { headers: { Authorization: `Bearer ${token}` } });
												if (res.ok) { const kycs = await res.json(); setViewKycPartner({ ...viewKycPartner, kycs } as any); }
											}}>Update</button>
											<button className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded" onClick={async ()=>{
												if (!confirm('Delete this KYC?')) return;
												await fetch(`/api/v1/partners/${viewKycPartner.id}/kyc/${k.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
												const res = await fetch(`/api/v1/partners/${viewKycPartner.id}/kyc`, { headers: { Authorization: `Bearer ${token}` } });
												if (res.ok) { const kycs = await res.json(); setViewKycPartner({ ...viewKycPartner, kycs } as any); }
											}}>Delete</button>
										</div>
									</div>
								))
							) : (
								<div className="p-3 text-gray-500">No KYC documents</div>
							)}
						</div>
						<div className="pt-2">
							<div className="text-gray-600 mb-1">Add document</div>
							<form className="grid grid-cols-1 md:grid-cols-4 gap-2" onSubmit={async (e)=>{
								e.preventDefault();
								const idType = (document.getElementById('newKycType') as HTMLSelectElement).value;
								const idNumber = (document.getElementById('newKycNum') as HTMLInputElement).value;
								const docUrl = (document.getElementById('newKycDoc') as HTMLInputElement).value;
								const status = (document.getElementById('newKycStatus') as HTMLSelectElement).value;
								await fetch(`/api/v1/partners/${viewKycPartner.id}/kyc`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ idType, idNumber, docUrl, status }) });
								const res = await fetch(`/api/v1/partners/${viewKycPartner.id}/kyc`, { headers: { Authorization: `Bearer ${token}` } });
								if (res.ok) { const kycs = await res.json(); setViewKycPartner({ ...viewKycPartner, kycs } as any); }
							}}>
								<select id="newKycType" className="border rounded px-2 py-1">
									<option value="">Type</option>
									<option value="Aadhar Card">Aadhaar</option>
									<option value="Pan Card">PAN</option>
									<option value="GST">GST</option>
								</select>
								<input id="newKycNum" placeholder="ID Number" className="border rounded px-2 py-1" />
								<input id="newKycDoc" placeholder="Document URL" className="border rounded px-2 py-1" />
								<select id="newKycStatus" className="border rounded px-2 py-1">
									<option value="pending">Pending</option>
									<option value="verified">Approved</option>
									<option value="rejected">Rejected</option>
								</select>
								<div className="md:col-span-4 flex justify-end">
									<button className="px-3 py-1.5 rounded bg-black text-white text-xs">Add</button>
								</div>
							</form>
						</div>
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

			{viewRatingsPartner && (
				<PortalModal title={`Ratings — ${viewRatingsPartner.name}`} onClose={()=>setViewRatingsPartner(null)} maxWidthClass="max-w-3xl">
					<div className="space-y-4">
						{/* Rating Summary */}
						<div className="bg-gray-50 p-4 rounded-lg">
							<div className="flex items-center gap-4">
								<div className="text-center">
									<div className="text-3xl font-bold text-yellow-600">{viewRatingsPartner.ratingAvg?.toFixed(1) || '0.0'}</div>
									<div className="text-sm text-gray-600">Average Rating</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold">{viewRatingsPartner.ratingCount || 0}</div>
									<div className="text-sm text-gray-600">Total Ratings</div>
								</div>
								<div className="flex items-center gap-1">
									<span className="text-yellow-500 text-2xl">★</span>
									<span className="text-lg font-medium">{viewRatingsPartner.ratingAvg?.toFixed(1) || '0.0'}</span>
								</div>
							</div>
						</div>

						{/* Individual Ratings */}
						<div>
							<div className="text-lg font-medium mb-3">Recent Ratings</div>
							<div className="space-y-3">
								{viewRatingsPartner.ratings && viewRatingsPartner.ratings.length > 0 ? (
									viewRatingsPartner.ratings.map((rating) => (
										<div key={rating.id} className="border rounded-lg p-4">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-2">
														<div className="flex items-center gap-1">
															{Array.from({ length: 5 }, (_, i) => (
																<span key={i} className={`text-lg ${i < rating.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
																	★
																</span>
															))}
														</div>
														<span className="text-sm text-gray-500">
															{new Date(rating.createdAt).toLocaleDateString()}
														</span>
													</div>
													{rating.comment && (
														<div className="text-gray-700 mb-2">{rating.comment}</div>
													)}
													<div className="text-sm text-gray-500">
														Service: {rating.booking.category.label} • Customer: {rating.booking.user.name}
													</div>
												</div>
											</div>
										</div>
									))
								) : (
									<div className="text-center text-gray-500 py-8">
										<div className="text-2xl mb-2">⭐</div>
										<div>No ratings yet</div>
										<div className="text-sm">Ratings will appear here once customers rate this partner</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</PortalModal>
			)}
		</div>
	);
};

export default Partners;


