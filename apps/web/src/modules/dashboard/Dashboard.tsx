import React from 'react';
import Card from '../common/Card';

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

export default Dashboard;


