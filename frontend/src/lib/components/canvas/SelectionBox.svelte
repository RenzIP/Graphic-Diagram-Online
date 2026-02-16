<script lang="ts">
	let {
		x = 0,
		y = 0,
		width = 0,
		height = 0,
		visible = false
	}: {
		x: number;
		y: number;
		width: number;
		height: number;
		visible: boolean;
	} = $props();
</script>

{#if visible && width > 0 && height > 0}
	<rect
		{x}
		{y}
		{width}
		{height}
		class="fill-indigo-500/10 stroke-indigo-500/50 stroke-1"
		rx="2"
		style="pointer-events: none;"
	/>
{/if}
