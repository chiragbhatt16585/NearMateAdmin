import React from 'react';

type ItemsProps = { token: string };

const Items: React.FC<ItemsProps> = ({ token }) => {
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

export default Items;


