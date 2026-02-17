<script lang="ts">
	import { documentStore } from '$lib/stores/document';
	import NodeWrapper from './NodeWrapper.svelte';
	import ProcessNode from './ProcessNode.svelte';
	import DecisionNode from './DecisionNode.svelte';
	import StartEndNode from './StartEndNode.svelte';
	import EntityNode from './EntityNode.svelte';
	import ActorNode from './ActorNode.svelte';
	import AttributeNode from './AttributeNode.svelte';
	import RelationshipNode from './RelationshipNode.svelte';
	import UseCaseNode from './UseCaseNode.svelte';
	import LifelineNode from './LifelineNode.svelte';
	import TextNode from './TextNode.svelte';

	import type { Component } from 'svelte';

	const nodeTypes: Record<string, Component> = {
		process: ProcessNode as Component,
		decision: DecisionNode as Component,
		'start-end': StartEndNode as Component,
		entity: EntityNode as Component,
		actor: ActorNode as Component,
		// New types
		attribute: AttributeNode as Component,
		relationship: RelationshipNode as Component,
		usecase: UseCaseNode as Component,
		lifeline: LifelineNode as Component,
		text: TextNode as Component
	};
</script>

{#each $documentStore.nodes as node (node.id)}
	<NodeWrapper {node}>
		{#if nodeTypes[node.type]}
			<svelte:component this={nodeTypes[node.type]} {node} />
		{:else}
			<!-- Fallback or unknown type -->
			<rect width={100} height={50} fill="red" />
			<text x={50} y={25} text-anchor="middle" fill="white">??</text>
		{/if}
	</NodeWrapper>
{/each}
