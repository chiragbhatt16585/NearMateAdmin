import React from 'react';

type CardProps = {
	title: string;
	children?: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ title, children }) => (
	<div className="bg-white rounded shadow p-4">
		<div className="text-sm text-gray-500">{title}</div>
		<div className="text-2xl font-semibold mt-2">{children}</div>
	</div>
);

export default Card;


