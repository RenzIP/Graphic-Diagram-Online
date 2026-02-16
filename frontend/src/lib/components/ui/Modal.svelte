<script lang="ts">
	import { type Snippet } from 'svelte';

	let {
		open = false,
		title = '',
		onclose,
		children
	}: {
		open: boolean;
		title?: string;
		onclose?: () => void;
		children?: Snippet;
	} = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onclose?.();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose?.();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		onmousedown={handleBackdropClick}
	>
		<div
			class="animate-in w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50"
			role="dialog"
			aria-modal="true"
			aria-label={title || 'Modal dialog'}
		>
			{#if title}
				<div class="flex items-center justify-between border-b border-slate-800 px-6 py-4">
					<h2 class="text-lg font-semibold text-white">{title}</h2>
					<button
						class="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
						onclick={onclose}
						aria-label="Close"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			{/if}
			<div class="p-6">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.animate-in {
		animation: modalIn 0.2s ease-out;
	}
	@keyframes modalIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
