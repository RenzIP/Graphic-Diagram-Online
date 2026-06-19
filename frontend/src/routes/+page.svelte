<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Logo from '$lib/components/ui/Logo.svelte';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});
</script>

<div class="min-h-screen bg-background text-text-primary overflow-hidden relative font-inter">
	<!-- Ambient Background Elements -->
	<div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-30 pointer-events-none blur-[120px] bg-gradient-to-b from-primary/30 via-accent/10 to-transparent"></div>
	<div class="absolute top-1/4 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none blur-[150px] bg-accent/30 rounded-full"></div>

	<!-- Navigation -->
	<nav class="fixed top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/10 border border-white/10">
						<Logo size="20" class="text-white" />
					</div>
					<span class="text-xl font-bold tracking-tight text-white font-outfit">GraDiOl</span>
				</div>
				<div class="flex items-center gap-3">
					<Button variant="ghost" size="sm" href="/login">Log in</Button>
					<Button variant="primary" size="sm" href="/register">Sign up</Button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	{#if mounted}
		<section class="relative mx-auto max-w-7xl px-4 pt-40 pb-20 text-center sm:px-6 lg:px-8 z-10" in:fade={{ duration: 800 }}>
			<div in:fly={{ y: 20, duration: 800, delay: 100 }} class="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary shadow-[0_0_15px_rgba(99,102,241,0.1)]">
				<span class="relative flex h-2 w-2">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
				</span>
				GraDiOl v2.0 is now live
			</div>

			<h1 in:fly={{ y: 20, duration: 800, delay: 200 }} class="mb-6 text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-tight font-outfit">
				Diagrams, <br />
				<span class="text-slate-50 pb-2 block">
					Reimagined.
				</span>
			</h1>

			<p in:fly={{ y: 20, duration: 800, delay: 300 }} class="mx-auto mb-10 max-w-2xl text-lg md:text-xl leading-relaxed text-text-secondary font-light">
				The ultimate canvas for your ideas. Design architecture, flows, and maps with the power of text and the beauty of modern visual tools.
			</p>

			<div in:fly={{ y: 20, duration: 800, delay: 400 }} class="mb-24 flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button variant="primary" size="lg" href="/dashboard" class="w-full sm:w-auto px-10 text-base hover-premium">Start Designing Free</Button>
				<Button variant="outline" size="lg" href="/demo" class="w-full sm:w-auto px-10 text-base gap-2 group hover-premium">
					View Showcase
					<svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
					</svg>
				</Button>
			</div>

			<!-- Premium Editor Showcase -->
			<div in:fly={{ y: 40, duration: 1000, delay: 600 }} class="group relative mx-auto aspect-[16/10] max-w-5xl rounded-2xl border border-white/10 bg-surface/80 shadow-[0_0_100px_rgba(99,102,241,0.15)] backdrop-blur-xl overflow-hidden ring-1 ring-white/5">
				<!-- Mock UI Header -->
				<div class="flex h-12 items-center justify-between border-b border-white/5 bg-card/50 px-4">
					<div class="flex gap-2">
						<div class="h-3 w-3 rounded-full bg-red-500/80 border border-red-500"></div>
						<div class="h-3 w-3 rounded-full bg-amber-500/80 border border-amber-500"></div>
						<div class="h-3 w-3 rounded-full bg-green-500/80 border border-green-500"></div>
					</div>
					<div class="flex gap-4">
						<div class="h-6 w-24 bg-white/5 rounded-md"></div>
						<div class="h-6 w-16 bg-white/5 rounded-md"></div>
					</div>
				</div>
				<!-- Canvas Area -->
				<div class="absolute inset-0 top-12 overflow-hidden bg-[#0a0f1c]">
					<!-- Grid Pattern -->
					<div class="absolute inset-0" style="background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 24px 24px;"></div>
					<!-- Fake Nodes -->
					<div class="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-card border border-primary/50 rounded-xl shadow-xl shadow-primary/20 flex flex-col items-center justify-center gap-2 group-hover:-translate-y-2 transition-transform duration-500">
						<div class="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
							<svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
						</div>
						<span class="text-white font-medium text-sm">Client Request</span>
					</div>

					<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-surface border border-white/10 rounded-xl shadow-xl flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-500 delay-75">
						<div class="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
							<svg class="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
						</div>
						<span class="text-white font-medium text-sm">API Gateway</span>
					</div>

					<div class="absolute top-3/4 left-3/4 transform -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-card border border-success/50 rounded-xl shadow-xl shadow-success/10 flex flex-col items-center justify-center gap-2 group-hover:translate-y-2 transition-transform duration-500 delay-150">
						<div class="h-8 w-8 rounded-lg bg-success/20 flex items-center justify-center">
							<svg class="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
						</div>
						<span class="text-white font-medium text-sm">Database Cluster</span>
					</div>

					<!-- Animated Connecting Lines -->
					<svg class="absolute inset-0 w-full h-full pointer-events-none">
						<path d="M 288 150 C 400 150, 400 225, 400 225" stroke="rgba(99,102,241,0.5)" stroke-width="2" fill="none" stroke-dasharray="4 4" class="animate-[dash_1s_linear_infinite]" />
						<path d="M 592 225 C 592 225, 600 338, 704 338" stroke="rgba(16,185,129,0.5)" stroke-width="2" fill="none" stroke-dasharray="4 4" class="animate-[dash_1s_linear_infinite_reverse]" />
					</svg>

					<!-- Gradient Overlay -->
					<div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
				</div>
			</div>
		</section>

		<!-- Features Grid -->
		<section class="relative py-32 border-t border-white/5">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="mb-20 text-center">
					<h2 class="mb-4 text-3xl md:text-5xl font-bold text-white font-outfit">Crafted for Professionals</h2>
					<p class="mx-auto max-w-2xl text-text-secondary text-lg">
						Everything you need to visualize your ideas without the friction of traditional tools.
					</p>
				</div>

				<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
					<Card class="group p-8 hover-premium hover:bg-surface/80 border-transparent hover:border-white/10">
						<div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
							<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<h3 class="mb-3 text-xl font-bold text-white font-outfit">Infinite Canvas</h3>
						<p class="text-text-secondary leading-relaxed text-sm">
							A boundless workspace with buttery-smooth panning and zooming. Navigate massive architectures with 60fps performance.
						</p>
					</Card>

					<Card class="group p-8 hover-premium hover:bg-surface/80 border-transparent hover:border-white/10">
						<div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent ring-1 ring-accent/20">
							<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
						</div>
						<h3 class="mb-3 text-xl font-bold text-white font-outfit">Real-time Multiplayer</h3>
						<p class="text-text-secondary leading-relaxed text-sm">
							Work together seamlessly. See live cursors, instant updates, and collaborate without stepping on each other's toes.
						</p>
					</Card>

					<Card class="group p-8 hover-premium hover:bg-surface/80 border-transparent hover:border-white/10">
						<div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 text-pink-500 ring-1 ring-pink-500/20">
							<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
							</svg>
						</div>
						<h3 class="mb-3 text-xl font-bold text-white font-outfit">Text & Visual Hybrid</h3>
						<p class="text-text-secondary leading-relaxed text-sm">
							Write code to generate diagrams, or use the visual editor to modify them. Both stay perfectly in sync at all times.
						</p>
					</Card>
				</div>
			</div>
		</section>

		<!-- Statistics / Social Proof -->
		<section class="py-24 border-t border-white/5 bg-surface/30">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-8">
					<div class="flex flex-col gap-2">
						<span class="text-4xl font-bold text-white font-outfit">10k+</span>
						<span class="text-sm text-text-tertiary">Active Users</span>
					</div>
					<div class="flex flex-col gap-2">
						<span class="text-4xl font-bold text-white font-outfit">1M+</span>
						<span class="text-sm text-text-tertiary">Diagrams Created</span>
					</div>
					<div class="flex flex-col gap-2">
						<span class="text-4xl font-bold text-white font-outfit">99.9%</span>
						<span class="text-sm text-text-tertiary">Uptime</span>
					</div>
					<div class="flex flex-col gap-2">
						<span class="text-4xl font-bold text-white font-outfit">5/5</span>
						<span class="text-sm text-text-tertiary">Customer Rating</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Footer -->
		<footer class="border-t border-white/5 bg-background pt-20 pb-10">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="mb-16 grid grid-cols-2 gap-8 md:grid-cols-5">
					<div class="col-span-2 md:col-span-2">
						<div class="mb-6 flex items-center gap-2">
							<Logo size="24" class="text-primary" />
							<span class="text-2xl font-bold text-white font-outfit">GraDiOl</span>
						</div>
						<p class="text-sm text-text-tertiary max-w-xs leading-relaxed">
							Graphic Diagram Online.<br />
							The modern diagramming tool for professionals, built with obsession for quality.
						</p>
					</div>
					<div>
						<h4 class="mb-6 font-semibold text-white">Product</h4>
						<ul class="space-y-4 text-sm text-text-secondary">
							<li><a href="/" class="transition-colors hover:text-white">Features</a></li>
							<li><a href="/" class="transition-colors hover:text-white">Templates</a></li>
							<li><a href="/" class="transition-colors hover:text-white">Integrations</a></li>
							<li><a href="/" class="transition-colors hover:text-white">Changelog</a></li>
						</ul>
					</div>
					<div>
						<h4 class="mb-6 font-semibold text-white">Resources</h4>
						<ul class="space-y-4 text-sm text-text-secondary">
							<li><a href="/" class="transition-colors hover:text-white">Documentation</a></li>
							<li><a href="/" class="transition-colors hover:text-white">Blog</a></li>
							<li><a href="/" class="transition-colors hover:text-white">Community</a></li>
							<li><a href="/" class="transition-colors hover:text-white">Help Center</a></li>
						</ul>
					</div>
					<div>
						<h4 class="mb-6 font-semibold text-white">Legal</h4>
						<ul class="space-y-4 text-sm text-text-secondary">
							<li><a href="/" class="transition-colors hover:text-white">Privacy</a></li>
							<li><a href="/" class="transition-colors hover:text-white">Terms</a></li>
							<li><a href="/" class="transition-colors hover:text-white">Security</a></li>
						</ul>
					</div>
				</div>
				<div class="flex items-center justify-between border-t border-white/5 pt-8 text-sm text-text-tertiary">
					<p>&copy; 2026 GraDiOl Inc. All rights reserved.</p>
					<div class="flex gap-4">
						<p>Crafted with SvelteKit</p>
					</div>
				</div>
			</div>
		</footer>
	{/if}
</div>

<style>
	@keyframes dash {
		to {
			stroke-dashoffset: -16;
		}
	}
	@keyframes dash_reverse {
		to {
			stroke-dashoffset: 16;
		}
	}
</style>
