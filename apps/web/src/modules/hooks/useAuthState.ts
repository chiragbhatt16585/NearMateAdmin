import React from 'react';

export function useAuthState() {
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


