import Button from '../components/ui/Button.js';
import Card from '../components/ui/Card.js';

export default function HomePage() {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
			<nav className="fixed top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
								<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
								</svg>
							</div>
							<span className="text-xl font-bold tracking-tight text-white">GraDiOl</span>
						</div>
						<div className="flex items-center gap-4">
							<Button variant="ghost" size="sm" href="/login">Log in</Button>
							<Button variant="primary" size="sm" href="/register">Sign up</Button>
						</div>
					</div>
				</div>
			</nav>

			<section className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-32 pb-20 text-center sm:px-6 lg:px-8">
				<div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/20 opacity-50 blur-[120px]"></div>
				<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-400 uppercase">
					<span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></span>
					v1.0 Public Beta
				</div>
				<h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
					Build Diagrams the <br />
					<span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Smarter Way</span>
				</h1>
				<p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-400">
					A hybrid diagram editor that combines the speed of text with the power of visual tools. Collaborate in real-time, export to code, and streamline your workflow.
				</p>
				<div className="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Button variant="primary" size="lg" href="/dashboard" className="w-full px-8 sm:w-auto">Start Designing</Button>
					<Button variant="outline" size="lg" href="/demo" className="w-full px-8 sm:w-auto">View Demo</Button>
				</div>

				<div className="group relative mx-auto aspect-video max-w-5xl overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm">
					<div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50"></div>
					<div className="flex h-10 items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-4">
						<div className="flex gap-1.5">
							<div className="h-3 w-3 rounded-full border border-red-500/50 bg-red-500/20"></div>
							<div className="h-3 w-3 rounded-full border border-amber-500/50 bg-amber-500/20"></div>
							<div className="h-3 w-3 rounded-full border border-green-500/50 bg-green-500/20"></div>
						</div>
					</div>
					<svg className="h-full w-full opacity-80 transition-transform duration-700 ease-out group-hover:scale-105" viewBox="0 0 800 450">
						<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#334155" /></pattern>
						<rect width="100%" height="100%" fill="url(#grid)" />
						<g transform="translate(100, 150)"><rect width="120" height="60" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" /><text x="60" y="35" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontFamily="sans-serif">User Login</text></g>
						<path d="M220 180 L350 180" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
						<g transform="translate(350, 130)"><polygon points="50,0 100,50 50,100 0,50" fill="#1e293b" stroke="#475569" strokeWidth="2" /><text x="50" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontFamily="sans-serif">Valid?</text></g>
						<path d="M450 180 L550 180" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
						<g transform="translate(550, 150)"><rect width="120" height="60" rx="30" fill="#1e293b" stroke="#475569" strokeWidth="2" /><text x="60" y="35" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontFamily="sans-serif">Dashboard</text></g>
						<defs><marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#64748b" /></marker></defs>
					</svg>
				</div>
			</section>

			<section className="relative bg-slate-950 py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-16 text-center">
						<h2 className="mb-4 text-3xl font-bold text-white">Everything you need</h2>
						<p className="mx-auto max-w-2xl text-slate-400">Powerful features built for modern development teams.</p>
					</div>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						{[
							['Lightning Fast', 'Built with Next.js and native SVG for 60fps performance on any device. No lag, even with massive diagrams.', 'indigo'],
							['Real-time Collaboration', 'Work together with your team in real-time. See cursors, live updates, and conflict-free editing.', 'purple'],
							['Text-to-Diagram', 'Write diagrams using our intuitive DSL or convert from code. Seamlessly switch between visual and text mode.', 'cyan']
						].map(([title, text, color]) => (
							<Card key={title} className={`group p-6 transition-colors hover:border-${color}-500/50`}>
								<div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-${color}-500/10 transition-colors group-hover:bg-${color}-500/20`}></div>
								<h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
								<p className="text-slate-400">{text}</p>
							</Card>
						))}
					</div>
				</div>
			</section>

			<footer className="border-t border-slate-900 bg-slate-950 pt-16 pb-8">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
						<div className="col-span-2 md:col-span-1">
							<div className="mb-4 flex items-center gap-2"><span className="text-xl font-bold text-white">GraDiOl</span></div>
							<p className="text-sm text-slate-500">Graphic Diagram Online.<br />The modern diagramming tool for professionals.</p>
						</div>
						{['Product', 'Resources', 'Legal'].map((section) => (
							<div key={section}>
								<h4 className="mb-4 font-bold text-white">{section}</h4>
								<ul className="space-y-2 text-sm text-slate-400">
									<li><a href="/" className="transition-colors hover:text-white">{section === 'Legal' ? 'Privacy' : section === 'Product' ? 'Features' : 'Documentation'}</a></li>
									<li><a href="/" className="transition-colors hover:text-white">{section === 'Legal' ? 'Terms' : section === 'Product' ? 'Templates' : 'Blog'}</a></li>
									{section !== 'Legal' ? <li><a href="/" className="transition-colors hover:text-white">{section === 'Product' ? 'Integrations' : 'Community'}</a></li> : null}
								</ul>
							</div>
						))}
					</div>
					<div className="flex items-center justify-between border-t border-slate-900 pt-8 text-sm text-slate-600">
						<p>&copy; 2026 GraDiOl Inc. All rights reserved.</p>
						<p>Made with Next.js & TailwindCSS</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
