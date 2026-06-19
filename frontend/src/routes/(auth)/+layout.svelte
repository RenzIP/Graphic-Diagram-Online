<script lang="ts">
	import Logo from '$lib/components/ui/Logo.svelte';
	let { children } = $props();
</script>

<div class="flex min-h-screen w-full bg-background font-inter text-text-primary">
	<!-- Left Side: Form Content -->
	<div class="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8 xl:w-5/12">
		<div class="mx-auto w-full max-w-md">
			<!-- Logo -->
			<a href="/" class="mb-10 flex items-center gap-3 transition-opacity hover:opacity-80">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/10 border border-white/10">
					<Logo size="24" class="text-white" />
				</div>
				<span class="text-3xl font-bold tracking-tight text-white font-outfit">GraDiOl</span>
			</a>

			<!-- Auth Card Content -->
			<div class="relative">
				{@render children()}
			</div>

			<div class="mt-8 text-sm text-text-tertiary">
				&copy; 2026 GraDiOl Inc. All rights reserved.
			</div>
		</div>
	</div>

	<!-- Right Side: Illustration / Visuals -->
	<div class="relative hidden w-0 flex-1 lg:block overflow-hidden bg-surface">
		<!-- Background Gradient -->
		<div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-surface to-accent/10 mix-blend-multiply"></div>
		
		<!-- Decorative Ambient Blobs -->
		<div class="absolute top-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-primary/20 blur-[120px]"></div>
		<div class="absolute bottom-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-accent/20 blur-[120px]"></div>

		<div class="absolute inset-0 flex items-center justify-center p-12">
			<!-- Abstract UI Element representing the app -->
			<div class="relative w-full max-w-2xl aspect-[4/3] rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm shadow-[0_0_100px_rgba(99,102,241,0.1)] overflow-hidden">
				<div class="absolute inset-0" style="background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 20px 20px;"></div>
				
				<div class="absolute top-1/3 left-1/4 w-32 h-16 rounded-xl border border-primary/40 bg-primary/10 shadow-lg shadow-primary/20 animate-[float_6s_ease-in-out_infinite]"></div>
				<div class="absolute top-1/2 left-1/2 w-40 h-24 rounded-xl border border-accent/40 bg-accent/10 shadow-lg shadow-accent/20 animate-[float_8s_ease-in-out_infinite_reverse]"></div>
				
				<!-- Connecting lines SVG -->
				<svg class="absolute inset-0 w-full h-full">
					<path d="M 300 200 C 350 200, 350 300, 400 300" stroke="rgba(255,255,255,0.1)" stroke-width="2" fill="none" stroke-dasharray="4 4" class="animate-[dash_2s_linear_infinite]" />
				</svg>
			</div>
		</div>
		
		<!-- Overlay Text -->
		<div class="absolute bottom-12 left-12 right-12 text-white z-10">
			<blockquote class="space-y-2">
				<p class="text-xl font-medium leading-relaxed font-outfit text-text-primary">
					"The fastest way to architect your ideas and share them with your team. A beautifully designed hybrid between code and canvas."
				</p>
			</blockquote>
		</div>
	</div>
</div>

<style>
	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-20px); }
	}
	@keyframes dash {
		to { stroke-dashoffset: -16; }
	}
</style>
