import cytoscape from "cytoscape";
import type { ElementsDefinition } from "cytoscape";
import { useEffect, useRef, useState } from "react";

import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../styles/Graph.css";

interface NodePopupData {
	label: string;
	name: string;
	category: string;
}

interface GraphProps {
	onGraphReady: (bool: boolean) => void;
	graphData: ElementsDefinition | null;
	initCyRef: (instance: cytoscape.Core) => void;
	onGetHere: (booth: NodePopupData) => void;
	onImHere: (booth: NodePopupData) => void;
}

export const Graph = ({
	onGraphReady,
	graphData,
	initCyRef,
	onGetHere,
	onImHere,
}: GraphProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [popupData, setPopupData] = useState<NodePopupData | null>(null);

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
						"background-color": "#A3B18A",
						color: "#000",
						"border-color": "#000",
						label: "data(label)",
						"text-valign": "center",
						"text-halign": "center",
						width: "data(width)",
						height: "data(height)",
						"border-width": 5,
						shape: (ele) => {
							const shape_type = ele.data("shape_type");
							if (shape_type === "hexagon") return "concave-hexagon";
							return ele.data("shape_type") || "rectangle";
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
			setPopupData({
				label: node.data("label"),
				name: node.data("name"),
				category: node.data("category"),
			});
		});

		cy.on("tap", (e) => {
			if (e.target === cy) {
				setPopupData(null);
			}
		});

		initCyRef(cy);
		cy.ready(() => {
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
				className="h-full graph-container bg-gray-50/30"
			/>

			{/* Node popup */}
			{popupData && (
				<div className="absolute z-30 bottom-2 inset-x-4 md:inset-auto md:top-6 md:left-6 md:bottom-4 md:w-1/4 bg-white rounded-lg shadow-lg p-5 border border-gray-100">
					{/* Close button */}
					<button
						type="button"
						onClick={() => setPopupData(null)}
						className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center w-8 h-8 transition-all duration-200 transform active:scale-90 focus:outline-none"
						aria-label="Close popup"
					>
						<FontAwesomeIcon icon={faTimes} className="text-sm" />
					</button>
					<div className="space-y-3">
						{/* Booth name */}
						<h3 className="font-semibold text-gray-900 text-xl text-center">
							{popupData.name} ({popupData.label})
						</h3>

						{/* Booth details */}
						<div className="space-y-2 text-sm">
							<div className="flex items-center justify-between text-gray-600">
								<span>Booth Number:</span>
								<span className="font-medium">{popupData.label}</span>
							</div>
							<div className="flex items-center justify-between text-gray-600">
								<span>Category:</span>
								<span className="font-medium">{popupData.category}</span>
							</div>

							{/* Get here button */}
							<button
								type="button"
								className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
								onClick={() => {
									setPopupData(null);
									onGetHere(popupData);
								}}
							>
								Get Here
							</button>
							{/* I'm Here button */}
							<button
								type="button"
								className="w-full mt-3 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
								onClick={() => {
									setPopupData(null);
									onImHere(popupData);
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
