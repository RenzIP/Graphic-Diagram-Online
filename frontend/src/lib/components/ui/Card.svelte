<script lang="ts">
	import { type Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: {
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();
</script>

<div
	class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-slate-950/50 {className}"
	{...rest}
>
	{@render children?.()}
</div>
