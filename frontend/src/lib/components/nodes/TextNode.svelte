<script lang="ts">
	import { type Node } from '$lib/stores/document';

	let { node }: { node: Node } = $props();
</script>

<!-- Using foreignObject to allow text wrapping via HTML -->
<foreignObject width={node.width || 120} height={node.height || 60}>
	<div class="flex h-full w-full items-center justify-center p-1">
		<div
			class="text-center font-medium whitespace-pre-wrap text-slate-200 select-none"
			style="font-size: 14px; line-height: 1.2;"
		>
			{node.label || 'Text'}
		</div>
	</div>
</foreignObject>
