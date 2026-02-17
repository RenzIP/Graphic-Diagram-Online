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
		text: TextNode as Component,
		'input-output': InputOutputNode as Component,
		database: DatabaseNode as Component,
		circle: AttributeNode as Component, // Reuse attribute node for generic circle
		triangle: TriangleNode as Component,

		// Flexible Shapes via ShapeNode
		note: ShapeNode as Component,
		cloud: ShapeNode as Component,
		star: ShapeNode as Component,
		hexagon: ShapeNode as Component,
		octagon: ShapeNode as Component,
		pentagon: ShapeNode as Component,
		cross: ShapeNode as Component,
		trapezoid: ShapeNode as Component,

		// Flowchart Extended
		'manual-input': ShapeNode as Component,
		'manual-operation': ShapeNode as Component,
		delay: ShapeNode as Component,
		display: ShapeNode as Component,
		'internal-storage': ShapeNode as Component,
		document: ShapeNode as Component,
		card: ShapeNode as Component,
		collate: ShapeNode as Component,

		// Arrows
		'arrow-left': ShapeNode as Component,
		'arrow-right': ShapeNode as Component
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
