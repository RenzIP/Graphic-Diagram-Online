<script lang="ts">
	import { writable } from 'svelte/store';

	interface ToastItem {
		id: number;
		message: string;
		type: 'success' | 'error' | 'info';
	}

	let toasts = $state<ToastItem[]>([]);
	let nextId = 0;

	// Expose global toast function
	if (typeof window !== 'undefined') {
		(window as any).__gradiol_toast = addToast;
	}

	function addToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
		const id = nextId++;
		toasts = [...toasts, { id, message, type }];
		setTimeout(() => removeToast(id), 4000);
	}

	function removeToast(id: number) {
		toasts = toasts.filter((t) => t.id !== id);
	}

	const typeStyles: Record<string, string> = {
		success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
		error: 'border-red-500/30 bg-red-500/10 text-red-400',
		info: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
	};

	const typeIcons: Record<string, string> = {
		success: 'M5 13l4 4L19 7',
		error: 'M6 18L18 6M6 6l12 12',
		info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
	};
</script>

<div class="fixed right-4 bottom-4 z-[100] flex flex-col gap-2">
	{#each toasts as toast (toast.id)}
		<div
			class="flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm transition-all {typeStyles[
				toast.type
			]}"
			role="alert"
		>
			<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d={typeIcons[toast.type]}
				/>
			</svg>
			<span class="text-sm font-medium">{toast.message}</span>
			<button
				class="ml-2 shrink-0 opacity-60 transition-opacity hover:opacity-100"
				onclick={() => removeToast(toast.id)}
				aria-label="Dismiss"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	{/each}
</div>
