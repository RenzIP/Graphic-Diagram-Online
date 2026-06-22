'use client';

const sizes = {
	sm: 'h-8 w-8 text-xs',
	md: 'h-10 w-10 text-sm',
	lg: 'h-12 w-12 text-base'
};

export default function Avatar({ initials = '??', size = 'md' }) {
	return (
		<div className={`flex shrink-0 items-center justify-center rounded-full bg-indigo-500/20 font-semibold text-indigo-300 ${sizes[size] ?? sizes.md}`}>
			{initials}
		</div>
	);
}
