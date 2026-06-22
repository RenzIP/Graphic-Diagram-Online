export default function AuthLayout({ children }) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
			<div className="w-full max-w-md">
				<div className="mb-8 flex justify-center">
					<a href="/" className="flex items-center gap-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
							<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
						</div>
						<span className="text-2xl font-bold tracking-tight text-white">GraDiOl</span>
					</a>
				</div>
				{children}
			</div>
		</div>
	);
}
