import React from 'react';
import { useNavigate } from 'react-router-dom';

type LoginProps = {
	onAuthed: (token: string) => void;
};

const Login: React.FC<LoginProps> = ({ onAuthed }) => {
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

export default Login;


