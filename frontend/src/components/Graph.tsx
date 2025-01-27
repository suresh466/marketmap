import cytoscape from "cytoscape";
import { useEffect, useRef, useState } from "react";
import "../styles/Graph.css";

interface NodePopupData {
	id: string;
	label: string;
	category: string;
	shape_type: string;
	dimension: string;
}

interface GraphProps {
	onGraphReady: (cy: cytoscape.Core) => void;
	onGetDirection: (booth: string) => void;
}

export const Graph = ({ onGraphReady, onGetDirection }: GraphProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [popupData, setPopupData] = useState<NodePopupData | null>(null);

	// Enables back button to close a popup
	useEffect(() => {
		if (popupData) {
			window.history.pushState({ popup: true }, "");

			const handlePopState = () => {
				setPopupData(null);
			};

			window.addEventListener("popstate", handlePopState);
			return () => window.removeEventListener("popstate", handlePopState);
		}
	}, [popupData]);
	useEffect(() => {
		if (!containerRef.current) return;

		const cy = cytoscape({
			// zoom: 0.5,
			container: containerRef.current,
			// autoungrabify: true,
			minZoom: 0.1,
			maxZoom: 2,
			wheelSensitivity: 0.1,
			style: [
				{
					selector: "node",
					style: {
						"background-color": "#808080",
						label: "data(label)",
						"text-valign": "center",
						"text-halign": "center",
						width: "data(width)",
						height: "data(height)",
						shape: (ele) => ele.data("shape_type") || "rectangle",
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
						width: 2,
						"line-color": "#999",
						"curve-style": "round-taxi",
						"source-endpoint": "inside-to-node",
						"target-endpoint": "inside-to-node",
						visibility: "hidden",
					},
				},
				{
					selector: ".highlighted",
					style: {
						"background-color": "#ff0",
						"line-color": "#f00",
						"target-arrow-color": "#f00",
						visibility: "visible",
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
			const dimension = `${node.data("width") / 10}'X${node.data("height") / 10}'`;
			setPopupData({
				id: node.id(),
				label: node.data("label"),
				category: node.data("category"),
				shape_type: node.data("shape_type"),
				dimension: dimension,
			});
		});

		cy.on("tap", (e) => {
			if (e.target === cy) {
				setPopupData(null);
			}
		});

		onGraphReady(cy);

		return () => {
			cy.destroy();
		};
	}, [onGraphReady]);

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
					<div className="space-y-3">
						{/* Booth name */}
						<h3 className="font-semibold text-gray-900 text-xl text-center">
							{popupData.label}
						</h3>

						{/* Booth details */}
						<div className="space-y-2 text-sm">
							<div className="flex items-center justify-between text-gray-600">
								<span>Type:</span>
								<span className="font-medium">{popupData.shape_type}</span>
							</div>
							<div className="flex items-center justify-between text-gray-600">
								<span>ID:</span>
								<span className="font-medium">{popupData.id}</span>
							</div>
							<div className="flex items-center justify-between text-gray-600">
								<span>Dimension:</span>
								<span className="font-medium">{popupData.dimension}</span>
							</div>
							<div className="flex items-center justify-between text-gray-600">
								<span>Category:</span>
								<span className="font-medium">{popupData.category}</span>
							</div>

							{/* Get directions button */}
							<button
								type="button"
								className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
								onClick={() => {
									setPopupData(null);
									onGetDirection(popupData.label);
								}}
							>
								Get Directions
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
