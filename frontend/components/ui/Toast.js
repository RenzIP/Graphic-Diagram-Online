'use client';

import { useEffect, useState } from 'react';

export default function Toast() {
	const [toasts, setToasts] = useState([]);

	useEffect(() => {
		window.__gradiol_toast = (message, type = 'info') => {
			const id = crypto.randomUUID();
			setToasts((items) => [...items, { id, message, type }]);
			setTimeout(() => setToasts((items) => items.filter((toast) => toast.id !== id)), 3000);
		};
		return () => {
			delete window.__gradiol_toast;
		};
	}, []);

	return (
		<div className="fixed right-4 bottom-4 z-[60] space-y-2">
			{toasts.map((toast) => (
				<div
					key={toast.id}
					className={`rounded-lg border px-4 py-3 text-sm shadow-xl ${
						toast.type === 'error'
							? 'border-red-500/30 bg-red-500/10 text-red-300'
							: toast.type === 'success'
								? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
								: 'border-slate-700 bg-slate-800 text-slate-200'
					}`}
				>
					{toast.message}
				</div>
			))}
		</div>
	);
}
