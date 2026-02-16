<script lang="ts">
	import { documentStore } from '$lib/stores/document';
	import { selectionStore } from '$lib/stores/selection';
	import { canvasStore } from '$lib/stores/canvas';

	let selectedNodes = $derived(
		$documentStore.nodes.filter((n) => $selectionStore.nodes.includes(n.id))
	);

	let boundingBox = $derived.by(() => {
		if (selectedNodes.length === 0) return null;
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;

		for (const node of selectedNodes) {
			const w = node.width || 120;
			const h = node.height || 60;
			minX = Math.min(minX, node.position.x);
			minY = Math.min(minY, node.position.y);
			maxX = Math.max(maxX, node.position.x + w);
			maxY = Math.max(maxY, node.position.y + h);
		}
		return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
	});

	let toolbarPosition = $derived.by(() => {
		if (!boundingBox) return { x: 0, y: 0 };
		const { x, y, w } = boundingBox;
		const { x: cx, y: cy, k } = $canvasStore;

		const screenX = (x + w / 2) * k + cx;
		const screenY = y * k + cy;

		return { x: screenX, y: screenY };
	});

	function updateColor(color: string) {
		selectedNodes.forEach((node) => {
			documentStore.updateNode(node.id, { color });
		});
	}

	function deleteNodes() {
		selectedNodes.forEach((node) => {
			documentStore.removeNode(node.id);
		});
		selectionStore.clear();
	}

	function duplicateNodes() {
		const newIds: string[] = [];
		selectedNodes.forEach((node) => {
			const newNode = {
				...node,
				id: crypto.randomUUID(),
				position: { x: node.position.x + 20, y: node.position.y + 20 },
				label: `${node.label} (Copy)`
			};
			documentStore.addNode(newNode);
			newIds.push(newNode.id);
		});
		selectionStore.selectNodes(newIds);
	}

	function align(type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
		if (!boundingBox) return;
		const { x: bx, y: by, w: bw, h: bh } = boundingBox;

		selectedNodes.forEach((node) => {
			const w = node.width || 120;
			const h = node.height || 60;
			let newX = node.position.x;
			let newY = node.position.y;

			switch (type) {
				case 'left':
					newX = bx;
					break;
				case 'center':
					newX = bx + bw / 2 - w / 2;
					break;
				case 'right':
					newX = bx + bw - w;
					break;
				case 'top':
					newY = by;
					break;
				case 'middle':
					newY = by + bh / 2 - h / 2;
					break;
				case 'bottom':
					newY = by + bh - h;
					break;
			}
			documentStore.updateNode(node.id, { position: { x: newX, y: newY } });
		});
	}
</script>

{#if selectedNodes.length > 0 && boundingBox}
	<div
		class="pointer-events-none absolute z-50 flex -translate-x-1/2 -translate-y-full transform flex-col items-center gap-2 px-4 pb-4"
		style="left: {toolbarPosition.x}px; top: {toolbarPosition.y}px;"
	>
		<div
			class="pointer-events-auto flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 p-1.5 shadow-xl"
		>
			<!-- Colors -->
			<div class="flex gap-1">
				{#each ['slate', 'red', 'green', 'amber', 'indigo', 'cyan'] as color}
					<button
						class="h-4 w-4 rounded-full ring-1 ring-white/10 transition-transform hover:scale-110"
						class:bg-slate-500={color === 'slate'}
						class:bg-red-500={color === 'red'}
						class:bg-green-500={color === 'green'}
						class:bg-amber-500={color === 'amber'}
						class:bg-indigo-500={color === 'indigo'}
						class:bg-cyan-500={color === 'cyan'}
						onclick={() => updateColor(color)}
						aria-label={color}
					></button>
				{/each}
			</div>

			<div class="mx-1 h-4 w-px bg-slate-600"></div>

			{#if selectedNodes.length > 1}
				<!-- Alignment -->
				<button
					onclick={() => align('left')}
					class="p-1 text-slate-400 hover:text-white"
					title="Align Left"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						><path d="M4 22V2" /><rect width="10" height="6" x="8" y="5" /><rect
							width="10"
							height="6"
							x="8"
							y="15"
						/></svg
					>
				</button>
				<button
					onclick={() => align('center')}
					class="p-1 text-slate-400 hover:text-white"
					title="Align Center"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						><path d="M12 2v20" /><rect width="10" height="6" x="7" y="5" /><rect
							width="10"
							height="6"
							x="7"
							y="15"
						/></svg
					>
				</button>
				<button
					onclick={() => align('right')}
					class="p-1 text-slate-400 hover:text-white"
					title="Align Right"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						><path d="M20 22V2" /><rect width="10" height="6" x="6" y="5" /><rect
							width="10"
							height="6"
							x="6"
							y="15"
						/></svg
					>
				</button>
				<div class="mx-1 h-4 w-px bg-slate-600"></div>
			{/if}

			<!-- Actions -->
			<button
				class="p-1 text-slate-400 hover:text-white"
				onclick={duplicateNodes}
				title="Duplicate"
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path
						d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
					/></svg
				>
			</button>
			<button class="p-1 text-red-400 hover:text-red-200" onclick={deleteNodes} title="Delete">
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
						d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
					/></svg
				>
			</button>
		</div>
	</div>
{/if}
