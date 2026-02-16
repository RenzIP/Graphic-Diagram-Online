<script lang="ts">
	let { children } = $props();
</script>

<div
	class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 p-4"
>
	<!-- Animated Blob Background -->
	<div class="pointer-events-none absolute top-0 left-0 z-0 h-full w-full overflow-hidden">
		<div
			class="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-indigo-600/10 blur-[100px]"
		></div>
		<div
			class="absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-purple-600/10 blur-[100px] delay-1000"
		></div>
	</div>

	<!-- Logo -->
	<a href="/" class="z-10 mb-8 flex items-center gap-2 transition-opacity hover:opacity-80">
		<div
			class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
		>
			<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
				/>
			</svg>
		</div>
		<span class="text-2xl font-bold tracking-tight text-white">GraDiOl</span>
	</a>

	<!-- Auth Card Content -->
	<div class="z-10 w-full max-w-md">
		{@render children()}
	</div>

	<div class="z-10 mt-8 text-center text-sm text-slate-500">&copy; 2026 GraDiOl Inc.</div>
</div>
