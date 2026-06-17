'use client';

import Link from 'next/link';

const variants = {
	primary: 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500',
	secondary: 'bg-slate-800 text-white hover:bg-slate-700',
	ghost: 'text-slate-400 hover:bg-slate-800 hover:text-white',
	outline: 'border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white',
	danger: 'bg-red-600 text-white hover:bg-red-500'
};

const sizes = {
	sm: 'h-9 px-3 text-sm',
	md: 'h-10 px-4 text-sm',
	lg: 'h-12 px-6 text-base',
	icon: 'h-10 w-10'
};

export default function Button({
	variant = 'primary',
	size = 'md',
	href,
	className = '',
	children,
	type = 'button',
	disabled = false,
	onClick,
	...props
}) {
	const classes = `inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`;

	if (href) {
		return (
			<Link href={href} className={classes} {...props}>
				{children}
			</Link>
		);
	}

	return (
		<button type={type} disabled={disabled} onClick={onClick} className={classes} {...props}>
			{children}
		</button>
	);
}
