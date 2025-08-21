import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import Login from './auth/Login';
import Dashboard from './dashboard/Dashboard';
import Users from './users/Users';
import Partners from './partners/Partners';
import EndUsers from './end-users/EndUsers';
import Categories from './categories/Categories';
import Items from './items/Items';
import OTPManagement from './otp/OTPManagement';
import { useAuthState } from './hooks/useAuthState';

export const App: React.FC = () => {
	const auth = useAuthState();
	return (
		<Router>
			{auth.token ? (
				<AppLayout onLogout={() => auth.setToken(null)}>
					<Routes>
						<Route path="/" element={<Navigate to="/dashboard" replace />} />
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/categories" element={<Categories token={auth.token} />} />
						<Route path="/items" element={<Items token={auth.token} />} />
						<Route path="/partners" element={<Partners token={auth.token} />} />
						<Route path="/users" element={<Users token={auth.token} />} />
						<Route path="/end-users" element={<EndUsers />} />
						<Route path="/otp-management" element={<OTPManagement token={auth.token} />} />
						<Route path="*" element={<Navigate to="/dashboard" replace />} />
					</Routes>
				</AppLayout>
			) : (
				<Routes>
					<Route path="/*" element={<Login onAuthed={auth.setToken} />} />
				</Routes>
			)}
		</Router>
	);
};


