import React from 'react';

type CardProps = {
	title?: string;
	children?: React.ReactNode;
	className?: string;
};

const Card: React.FC<CardProps> = ({ title, children, className = "bg-white rounded shadow p-4" }) => (
	<div className={className}>
		{title && (
			<>
				<div className="text-sm text-gray-500">{title}</div>
				<div className="text-2xl font-semibold mt-2">{children}</div>
			</>
		)}
		{!title && children}
	</div>
);

export default Card;


