import type cytoscape from "cytoscape";
import { useCallback, useState } from "react";

export const useGraph = () => {
	const [cy, setCy] = useState<cytoscape.Core | null>(null);

	const highlightPath = useCallback(
		(path: string[]) => {
			if (!cy) {
				console.error("cy is null cannot highlight path");
				return;
			}

			cy.elements().removeClass("highlighted");

			for (let i = 0; i < path.length - 1; i++) {
				const edge = cy.getElementById(`edge_${path[i]}_${path[i + 1]}`);
				const reverseEdge = cy.getElementById(`edge_${path[i + 1]}_${path[i]}`);

				(edge.length ? edge : reverseEdge).addClass("highlighted");
			}
			// highlight first and the last node
			cy.getElementById(path[0]).addClass("highlighted");
			cy.getElementById(path[path.length - 1]).addClass("highlighted");
		},
		[cy],
	);

	return { cy, setCy, highlightPath };
};
