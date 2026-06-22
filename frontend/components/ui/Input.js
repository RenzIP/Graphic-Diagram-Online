'use client';

export default function Input({ label, value = '', onChange, className = '', id, ...props }) {
	const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');
	return (
		<div>
			{label ? (
				<label htmlFor={inputId} className="mb-1 block text-sm text-slate-400">
					{label}
				</label>
			) : null}
			<input
				id={inputId}
				value={value}
				onChange={(e) => onChange?.(e.target.value, e)}
				className={`w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none ${className}`}
				{...props}
			/>
		</div>
	);
}
