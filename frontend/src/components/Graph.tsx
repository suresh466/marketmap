import cytoscape from "cytoscape";
import type { ElementsDefinition } from "cytoscape";
import { useEffect, useRef, useState } from "react";
import type { Booth } from "../types";
import { logger } from "../utils/logger";

import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../styles/Graph.css";

interface GraphProps {
	onGraphReady: (bool: boolean) => void;
	graphData: ElementsDefinition | null;
	initCyRef: (instance: cytoscape.Core) => void;
	onGetHere: (booth: Booth) => void;
	onImHere: (booth: Booth) => void;
}

export const Graph = ({
	onGraphReady,
	graphData,
	initCyRef,
	onGetHere,
	onImHere,
}: GraphProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	// const [popupData, setPopupData] = useState<NodePopupData | null>(null);
	const [booth, setBooth] = useState<Booth | null>(null);

	useEffect(() => {
		if (!containerRef.current || !graphData) {
			return;
		}

		const cy = cytoscape({
			container: containerRef.current,
			elements: graphData || [], // graphdata is not set until apps effect runs later
			minZoom: 0.1,
			maxZoom: 2,
			wheelSensitivity: 0.1,
			style: [
				{
					selector: "node",
					style: {
						"background-color": (ele) => {
							return ele.data("shape_type") === "hexagon"
								? "#DAD7CD"
								: "#A3B18A";
						},
						color: "#000",
						"border-color": (ele) => {
							return ele.data("shape_type") === "hexagon" ? "#344E41" : "#000";
						},
						label: "data(label)",
						"z-index": 1,
						"text-valign": "center",
						"text-halign": "center",
						width: (ele: cytoscape.NodeSingular) => {
							return ele.data("shape_type") === "hexagon"
								? ele.data("width") * 1.33
								: ele.data("width");
						},
						height: (ele: cytoscape.NodeSingular) => {
							return ele.data("shape_type") === "hexagon"
								? ele.data("height") * 1.33
								: ele.data("height");
						},
						"border-width": (ele) => {
							return ele.data("shape_type") === "hexagon" ? 8 : 5;
						},
						shape: (ele) => {
							const shape_type = ele.data("shape_type");
							if (shape_type === "hexagon") return "polygon";
							return ele.data("shape_type") || "rectangle";
						},
						"shape-polygon-points": (ele: cytoscape.NodeSingular) => {
							if (ele.data("shape_type") === "hexagon") {
								return "-1 -1, -1 1, -0.3 1, -0.3 0.3, 0.3 0.3, 0.3 1, 1 1, 1 -1";
							}
							return "-1 -1, 1 -1, 1 1, -1 1";
						},
						visibility: (ele: cytoscape.NodeSingular) =>
							ele.data("shape_type") === "ellipse" ||
							ele.data("shape_type") === "diamond" ||
							ele.data("shape_type") === "octagon"
								? "hidden"
								: "visible",
					},
				},
				{
					selector: "edge",
					style: {
						visibility: "hidden",
						width: 5,
						"line-color": "#999",
						"curve-style": "round-taxi" as "taxi",
						"source-endpoint": "inside-to-node",
						"target-endpoint": "inside-to-node",
					},
				},
				{
					selector: ".highlighted",
					style: {
						visibility: "visible",
						"background-color": "#F59E0B",
						"line-color": "#f00",
					},
				},
				// Add styling for origin marker
				{
					selector: ".origin-marker",
					style: {
						"border-color": "#ef4444",
						"border-width": 8,
						"z-index": 9,
						label: (ele: cytoscape.NodeSingular) => {
							return `You are here (${ele.data("label")})`;
						},
						"text-valign": "bottom",
						"text-margin-y": -15,
						"text-background-padding": 15,
						"text-background-color": "white",
						"text-background-opacity": 0.8,
						"text-background-shape": "roundrectangle",
						backgroundColor: "#14b8a6",
					},
				},
				// Add styling for destination marker
				{
					selector: ".destination-marker",
					style: {
						"border-color": "#ef4444",
						"border-width": 8,
						"z-index": 9,
						label: (ele: cytoscape.NodeSingular) => {
							return `Destination (${ele.data("label")})`;
						},
						"text-valign": "top",
						"text-margin-y": -15,
						"text-background-padding": 15,
						"text-background-color": "white",
						"text-background-opacity": 0.8,
						"text-background-shape": "roundrectangle",
						backgroundColor: "#f59e0b",
					},
				},
			],
			layout: {
				name: "preset",
				fit: true,
			},
		});

		// Add panning limits
		let justPanned = false;
		cy.on("viewport", () => {
			// Prevent infinite recursion from pan adjustment
			if (justPanned) return (justPanned = false);
			justPanned = true;

			// Get current viewport properties
			const zoom = cy.zoom();
			const pan = cy.pan();
			const width = cy.width();
			const height = cy.height();
			const paddingH = width / 2;
			const paddingV = height / 2;

			// Get graph elements bounding box
			const { x1, y1, x2, y2 } = cy.elements().boundingBox();

			// Apply panning limits
			if (x2 * zoom + pan.x < paddingH) pan.x = paddingH - x2 * zoom;
			if (y2 * zoom + pan.y < paddingV) pan.y = paddingV - y2 * zoom;
			if (x1 * zoom + pan.x > width - paddingH)
				pan.x = width - paddingH - x1 * zoom;
			if (y1 * zoom + pan.y > height - paddingV)
				pan.y = height - paddingV - y1 * zoom;

			// Update pan position
			cy.pan(pan);
		});

		cy.on("tap", "node", (e) => {
			const node = e.target;
			logger.userAction("nodeSelected", {
				id: node.id(),
				label: node.data("label"),
			});
			setBooth({ data: node.data() });
		});

		cy.on("tap", (e) => {
			if (e.target === cy) {
				setBooth(null);
			}
		});

		initCyRef(cy);
		cy.ready(() => {
			const loadTime = performance.now();
			logger.performance("graphInitialization", loadTime);
			onGraphReady(true);
			cy.fit();
		});

		return () => {
			onGraphReady(false);
			cy.destroy();
		};
	}, [initCyRef, graphData, onGraphReady]);

	return (
		<>
			{/* Graph container */}
			<div
				ref={containerRef}
				className="graph-container h-full bg-gray-50/30"
			/>

			{/* Node popup */}
			{booth && (
				<div className="absolute inset-x-4 bottom-2 z-30 rounded-lg border border-gray-100 bg-white p-5 shadow-lg md:inset-auto md:bottom-4 md:left-6 md:top-6 md:w-1/4">
					{/* Close button */}
					<button
						type="button"
						onClick={() => setBooth(null)}
						className="absolute -right-3 -top-3 flex h-8 w-8 transform items-center justify-center rounded-full border-2 border-white bg-red-500 p-2 text-white shadow-lg transition-all duration-200 hover:bg-red-600 focus:outline-none active:scale-90"
						aria-label="Close popup"
					>
						<FontAwesomeIcon icon={faTimes} className="text-sm" />
					</button>
					<div className="space-y-3">
						{/* Booth name */}
						<h3 className="text-center text-xl font-semibold text-gray-900">
							{booth.data.name} ({booth.data.label})
						</h3>

						{/* Booth details */}
						<div className="space-y-2 text-sm">
							<div className="flex items-center justify-between text-gray-600">
								<span>Booth Number:</span>
								<span className="font-medium">{booth.data.label}</span>
							</div>
							<div className="flex items-center justify-between text-gray-600">
								<span>Category:</span>
								<span className="font-medium">{booth.data.category}</span>
							</div>

							{/* Get here button */}
							<button
								type="button"
								className="mt-3 w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
								onClick={() => {
									setBooth(null);
									onGetHere(booth);
								}}
							>
								Get Here
							</button>
							{/* I'm Here button */}
							<button
								type="button"
								className="mt-3 w-full rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
								onClick={() => {
									setBooth(null);
									onImHere(booth);
								}}
							>
								I'm Here
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
