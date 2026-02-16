<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { onMount } from 'svelte';

	// Landing page interaction (e.g. scroll animations if needed)
</script>

<div class="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
	<!-- Navigation -->
	<nav class="fixed top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center gap-2">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
					>
						<svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
							/>
						</svg>
					</div>
					<span class="text-xl font-bold tracking-tight text-white">GraDiOl</span>
				</div>
				<div class="flex items-center gap-4">
					<Button variant="ghost" size="sm" href="/login">Log in</Button>
					<Button variant="primary" size="sm" href="/register">Sign up</Button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<section
		class="relative mx-auto max-w-7xl overflow-hidden px-4 pt-32 pb-20 text-center sm:px-6 lg:px-8"
	>
		<!-- Background Gradient Blob -->
		<div
			class="pointer-events-none absolute top-0 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/20 opacity-50 blur-[120px]"
		></div>

		<div
			class="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-400 uppercase"
		>
			<span class="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></span>
			v1.0 Public Beta
		</div>

		<h1 class="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
			Build Diagrams the <br />
			<span
				class="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
				>Smarter Way</span
			>
		</h1>

		<p class="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-400">
			A hybrid diagram editor that combines the speed of text with the power of visual tools.
			Collaborate in real-time, export to code, and streamline your workflow.
		</p>

		<div class="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
			<Button variant="primary" size="lg" href="/dashboard" class="w-full px-8 sm:w-auto"
				>Start Designing</Button
			>
			<Button variant="outline" size="lg" href="/demo" class="w-full px-8 sm:w-auto"
				>View Demo</Button
			>
		</div>

		<!-- Mockup Preview -->
		<div
			class="group relative mx-auto aspect-video max-w-5xl overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm"
		>
			<div
				class="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50"
			></div>

			<!-- Fake UI Header -->
			<div class="flex h-10 items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-4">
				<div class="flex gap-1.5">
					<div class="h-3 w-3 rounded-full border border-red-500/50 bg-red-500/20"></div>
					<div class="h-3 w-3 rounded-full border border-amber-500/50 bg-amber-500/20"></div>
					<div class="h-3 w-3 rounded-full border border-green-500/50 bg-green-500/20"></div>
				</div>
			</div>

			<!-- Fake SVG Content (Simplified) -->
			<svg
				class="h-full w-full opacity-80 transition-transform duration-700 ease-out group-hover:scale-105"
				viewBox="0 0 800 450"
			>
				<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
					<circle cx="1" cy="1" r="1" fill="#334155" />
				</pattern>
				<rect width="100%" height="100%" fill="url(#grid)" />

				<!-- Nodes -->
				<g transform="translate(100, 150)">
					<rect width="120" height="60" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2" />
					<text
						x="60"
						y="35"
						text-anchor="middle"
						fill="#e2e8f0"
						font-size="14"
						font-family="sans-serif">User Login</text
					>
				</g>

				<path d="M220 180 L350 180" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />

				<g transform="translate(350, 130)">
					<polygon
						points="50,0 100,50 50,100 0,50"
						fill="#1e293b"
						stroke="#475569"
						stroke-width="2"
					/>
					<text
						x="50"
						y="55"
						text-anchor="middle"
						fill="#e2e8f0"
						font-size="14"
						font-family="sans-serif">Valid?</text
					>
				</g>

				<path d="M450 180 L550 180" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />

				<g transform="translate(550, 150)">
					<rect width="120" height="60" rx="30" fill="#1e293b" stroke="#475569" stroke-width="2" />
					<text
						x="60"
						y="35"
						text-anchor="middle"
						fill="#e2e8f0"
						font-size="14"
						font-family="sans-serif">Dashboard</text
					>
				</g>

				<defs>
					<marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
						<polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
					</marker>
				</defs>
			</svg>
		</div>
	</section>

	<!-- Features Grid -->
	<section class="relative bg-slate-950 py-24">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="mb-16 text-center">
				<h2 class="mb-4 text-3xl font-bold text-white">Everything you need</h2>
				<p class="mx-auto max-w-2xl text-slate-400">
					Powerful features built for modern development teams.
				</p>
			</div>

			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				<Card class="group p-6 transition-colors hover:border-indigo-500/50">
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 transition-colors group-hover:bg-indigo-500/20"
					>
						<svg
							class="h-6 w-6 text-indigo-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-xl font-bold text-white">Lightning Fast</h3>
					<p class="text-slate-400">
						Built with SvelteKit and native SVG for 60fps performance on any device. No lag, even
						with massive diagrams.
					</p>
				</Card>

				<Card class="group p-6 transition-colors hover:border-purple-500/50">
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 transition-colors group-hover:bg-purple-500/20"
					>
						<svg
							class="h-6 w-6 text-purple-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-xl font-bold text-white">Real-time Collaboration</h3>
					<p class="text-slate-400">
						Work together with your team in real-time. See cursors, live updates, and conflict-free
						editing.
					</p>
				</Card>

				<Card class="group p-6 transition-colors hover:border-cyan-500/50">
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 transition-colors group-hover:bg-cyan-500/20"
					>
						<svg
							class="h-6 w-6 text-cyan-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-xl font-bold text-white">Text-to-Diagram</h3>
					<p class="text-slate-400">
						Write diagrams using our intuitive DSL or convert from code. Seamlessly switch between
						visual and text mode.
					</p>
				</Card>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-slate-900 bg-slate-950 pt-16 pb-8">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
				<div class="col-span-2 md:col-span-1">
					<div class="mb-4 flex items-center gap-2">
						<span class="text-xl font-bold text-white">GraDiOl</span>
					</div>
					<p class="text-sm text-slate-500">
						Graphic Diagram Online.<br />
						The modern diagramming tool for professionals.
					</p>
				</div>
				<div>
					<h4 class="mb-4 font-bold text-white">Product</h4>
					<ul class="space-y-2 text-sm text-slate-400">
						<li><a href="/" class="transition-colors hover:text-white">Features</a></li>
						<li><a href="/" class="transition-colors hover:text-white">Templates</a></li>
						<li><a href="/" class="transition-colors hover:text-white">Integrations</a></li>
					</ul>
				</div>
				<div>
					<h4 class="mb-4 font-bold text-white">Resources</h4>
					<ul class="space-y-2 text-sm text-slate-400">
						<li><a href="/" class="transition-colors hover:text-white">Documentation</a></li>
						<li><a href="/" class="transition-colors hover:text-white">Blog</a></li>
						<li><a href="/" class="transition-colors hover:text-white">Community</a></li>
					</ul>
				</div>
				<div>
					<h4 class="mb-4 font-bold text-white">Legal</h4>
					<ul class="space-y-2 text-sm text-slate-400">
						<li><a href="/" class="transition-colors hover:text-white">Privacy</a></li>
						<li><a href="/" class="transition-colors hover:text-white">Terms</a></li>
					</ul>
				</div>
			</div>
			<div
				class="flex items-center justify-between border-t border-slate-900 pt-8 text-sm text-slate-600"
			>
				<p>&copy; 2026 GraDiOl Inc. All rights reserved.</p>
				<p>Made with SvelteKit & TailwindCSS</p>
			</div>
		</div>
	</footer>
</div>
