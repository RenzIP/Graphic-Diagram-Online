'use client';

import { useStore } from '../../hooks/useStore.js';
import { documentStore } from '../../lib/stores/document.js';
import NodeWrapper from './NodeWrapper';
import ShapeNode from './ShapeNode';

export default function NodeRenderer() {
	const document = useStore(documentStore);
	return (
		<>
			{document.nodes.map((node) => (
				<NodeWrapper key={node.id} node={node}>
					<ShapeNode node={node} />
				</NodeWrapper>
			))}
		</>
	);
}
