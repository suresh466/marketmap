import cytoscape from "cytoscape";
import { useCallback, useState } from "react";

export const useGraph = () => {
	const [cy, setCy] = useState<cytoscape.Core | null>(null);

	const highlightPath = useCallback(
		(path: string[]) => {
			if (!cy) return;

			cy.elements().removeClass("highlighted");

			for (let i = 0; i < path.length - 1; i++) {
				cy.getElementById(path[i]).addClass("highlighted");
				const edge = cy.getElementById(`edge_${path[i]}_${path[i + 1]}`);
				const reverseEdge = cy.getElementById(`edge_${path[i + 1]}_${path[i]}`);

				(edge.length ? edge : reverseEdge).addClass("highlighted");
			}

			cy.getElementById(path[path.length - 1]).addClass("highlighted");
		},
		[cy],
	);

	return { cy, setCy, highlightPath };
};
