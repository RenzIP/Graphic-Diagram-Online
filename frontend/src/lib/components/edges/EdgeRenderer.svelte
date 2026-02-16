<script lang="ts">
	import { documentStore } from '$lib/stores/document';
	import BaseEdge from './BaseEdge.svelte';

	// Helper to get node by id
	function getNode(id: string) {
		return $documentStore.nodes.find((n) => n.id === id);
	}
</script>

{#each $documentStore.edges as edge (edge.id)}
	{@const sourceNode = getNode(edge.source)}
	{@const targetNode = getNode(edge.target)}

	{#if sourceNode && targetNode}
		<BaseEdge {edge} {sourceNode} {targetNode} />
	{/if}
{/each}
