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
	class="glass-card rounded-2xl overflow-hidden transition-all duration-300 {className}"
	{...rest}
>
	{@render children?.()}
</div>
