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
		// Only fit if the path nodes aren't all in the current viewport
		const extent = cyRef.current.extent();
		const anyNodeOutsideViewport = path.some((id) => {
			const node = cyRef.current?.getElementById(id);
			// Guard against null/undefined node
			if (!node) {
				console.warn(`Node with ID ${id} not found`);
				return false;
			}
			const bb = node.boundingBox();
			const isOutside =
				bb.x1 < extent.x1 ||
				bb.x2 > extent.x2 ||
				bb.y1 < extent.y1 ||
				bb.y2 > extent.y2;
			return isOutside;
		});

		if (anyNodeOutsideViewport) {
			cyRef.current.fit();
		}
	}, []);

	const setLocationMarkers = useCallback(
		(originId: string | null, destId: string | null) => {
			if (!cyRef.current) return;
			console.log("past if not cyref");

			// Clear all existing markers
			cyRef.current.elements().removeClass("origin-marker destination-marker");

			// Set origin marker
			if (originId) {
				console.log("inside origin if origin id");
				const originNode = cyRef.current.getElementById(originId);
				if (originNode.length > 0) {
					originNode.addClass("origin-marker");
					console.log("marker added");
				} else {
					console.warn(`Origin node with ID ${originId} not found`);
					console.log("marker not added");
				}
			}

			// Set destination marker
			if (destId) {
				console.log("inside dest if dest id");
				const destNode = cyRef.current.getElementById(destId);
				if (destNode.length > 0) {
					destNode.addClass("destination-marker");
					console.log("marker added");
				} else {
					console.warn(`Destination node with ID ${destId} not found`);
					console.log("marker not added");
				}
			}
		},
		[],
	);

	/**
	 * Gets a node ID from a booth label
	 * Used to convert booth labels to node IDs for marker placement
	 */
	const getNodeIdByLabel = useCallback((label: string): string | null => {
		if (!cyRef.current) return null;

		// Find the node with matching label
		const node = cyRef.current
			.nodes()
			.filter((node) => node.data("label") === label);
		if (node.length > 0) {
			return node.id();
		}

		console.warn(`No node found with label: ${label}`);
		return null;
	}, []);

	return {
		cy: cyRef,
		initCyRef,
		highlightPath,
		setLocationMarkers,
		getNodeIdByLabel,
	};
};
