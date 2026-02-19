<script lang="ts">
	let {
		src,
		alt = 'Avatar',
		initials = 'User',
		size = 'md',
		class: className = ''
	}: {
		src?: string | null;
		alt?: string;
		initials?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
	} = $props();

	const sizeClasses = {
		sm: 'w-8 h-8 text-xs',
		md: 'w-10 h-10 text-sm',
		lg: 'w-12 h-12 text-base',
		xl: 'w-16 h-16 text-lg'
	};

	function getInitials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	}
</script>

<div
	class="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800 {sizeClasses[
		size
	]} {className}"
>
	{#if src}
		<img {src} {alt} class="h-full w-full object-cover" />
	{:else}
		<span class="font-medium text-slate-300">{getInitials(initials)}</span>
	{/if}
</div>
