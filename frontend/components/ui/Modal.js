'use client';

export default function Modal({ open, onClose, title, children }) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
			<div
				className="modal-in w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 text-slate-200 shadow-2xl shadow-black/40"
				onMouseDown={(e) => e.stopPropagation()}
			>
				{title ? (
					<div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
						<h3 className="text-lg font-semibold text-white">{title}</h3>
						<button className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white" onClick={onClose} aria-label="Close">
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				) : null}
				{children}
			</div>
		</div>
	);
}
