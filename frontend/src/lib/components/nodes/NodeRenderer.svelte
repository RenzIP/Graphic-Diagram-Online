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
	import InputOutputNode from './InputOutputNode.svelte';
	import DatabaseNode from './DatabaseNode.svelte';
	import TriangleNode from './TriangleNode.svelte';
	import ShapeNode from './ShapeNode.svelte';

	import type { Component } from 'svelte';

	// Mapping of specific components.
	// IF a type is not listed here, it will fallback to ShapeNode.
	const nodeTypes: Record<string, Component> = {
		// Specific Legacy Components (Keep for safety/custom behavior)
		process: ProcessNode as Component,
		decision: DecisionNode as Component,
		'start-end': StartEndNode as Component,
		entity: EntityNode as Component,
		actor: ActorNode as Component,
		attribute: AttributeNode as Component,
		relationship: RelationshipNode as Component,
		usecase: UseCaseNode as Component,
		lifeline: LifelineNode as Component,
		text: TextNode as Component,
		'input-output': InputOutputNode as Component,
		database: DatabaseNode as Component,
		triangle: TriangleNode as Component

		// Explicit mappings to ShapeNode (optional if fallback is ShapeNode, but good for documentation)
		// We can actually remove the Explicit ShapeNode mappings if we use the fallback!
		// But let's leave common ones.
	};
</script>

{#each $documentStore.nodes as node (node.id)}
	<NodeWrapper {node}>
		{#if nodeTypes[node.type]}
			<svelte:component this={nodeTypes[node.type]} {node} />
		{:else}
			<!-- Universal Fallback: Render as generic ShapeNode -->
			<!-- This covers: rounded, hexagon, star, cloud, note, flowcharts, bpmn, etc. -->
			<ShapeNode {node} />
		{/if}
	</NodeWrapper>
{/each}
