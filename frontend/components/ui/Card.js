'use client';

export default function Card({ children, className = '', onClick, ...props }) {
	return (
		<div
			className={`overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-sm ${className}`}
			onClick={onClick}
			{...props}
		>
			{children}
		</div>
	);
}
