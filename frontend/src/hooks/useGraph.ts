import type cytoscape from "cytoscape";
import { useCallback, useRef } from "react";

export const useGraph = () => {
	const cyRef = useRef<cytoscape.Core | null>(null);

	const initCyRef = useCallback((instance: cytoscape.Core) => {
		cyRef.current = instance;
	}, []);

	const highlightPath = useCallback((path: string[]) => {
		if (!cyRef.current) {
			console.error("cy is null cannot highlight path");
			return;
		}

		cyRef.current.elements().removeClass("highlighted");

		for (let i = 0; i < path.length - 1; i++) {
			const edge = cyRef.current.getElementById(
				`edge_${path[i]}_${path[i + 1]}`,
			);
			const reverseEdge = cyRef.current.getElementById(
				`edge_${path[i + 1]}_${path[i]}`,
			);

			(edge.length ? edge : reverseEdge).addClass("highlighted");
		}
		// highlight first and the last node
		cyRef.current.getElementById(path[0]).addClass("highlighted");
		cyRef.current.getElementById(path[path.length - 1]).addClass("highlighted");
	}, []);

	return { cy: cyRef, initCyRef, highlightPath };
};
