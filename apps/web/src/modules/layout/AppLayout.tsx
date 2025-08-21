import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { Bars3Icon, Squares2X2Icon, TagIcon, RectangleStackIcon, ArrowRightOnRectangleIcon, UserGroupIcon, UsersIcon, KeyIcon } from '@heroicons/react/24/outline';

type AppLayoutProps = {
	children: React.ReactNode;
	onLogout: () => void;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children, onLogout }) => {
	const [open, setOpen] = React.useState(true);
	const nav = [
		{ to: '/dashboard', label: 'Dashboard', icon: Squares2X2Icon },
		{ to: '/categories', label: 'Categories', icon: TagIcon },
		{ to: '/items', label: 'Items', icon: RectangleStackIcon },
		{ to: '/partners', label: 'Partners', icon: UserGroupIcon },
		{ to: '/users', label: 'Users', icon: UserGroupIcon },
		{ to: '/end-users', label: 'End Users', icon: UsersIcon },
		{ to: '/otp-management', label: 'OTP Management', icon: KeyIcon },
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

export default AppLayout;


