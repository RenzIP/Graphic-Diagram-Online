<script lang="ts">
	let { size = 28, class: className = '' }: { size?: number | string; class?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
>
	<rect x="3" y="3" width="6" height="6" rx="1.5" />
	<rect x="15" y="3" width="6" height="6" rx="1.5" />
	<rect x="9" y="15" width="6" height="6" rx="1.5" />
	<path d="M6 9v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" />
	<path d="M12 13v2" />
</svg>
