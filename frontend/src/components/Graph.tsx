import cytoscape from "cytoscape";
import { useEffect, useRef, useState } from "react";
import "../styles/Graph.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface NodePopupData {
	id: string;
	label: string;
	category: string;
	position: { x: number; y: number };
	shape_type: string;
	dimension: string;
	transform: string;
}

interface GraphProps {
	onGraphReady: (cy: cytoscape.Core) => void;
	onGetDirection: (booth: string) => void;
}

export const Graph = ({ onGraphReady, onGetDirection }: GraphProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [popupData, setPopupData] = useState<NodePopupData | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const cy = cytoscape({
			// zoom: 0.5,
			container: containerRef.current,
			autoungrabify: true,
			minZoom: 0.2,
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

		const getPopupPosition = (x: number, y: number) => {
			// Get viewport dimensions
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			let transform = "translate(-50%, -120%)";

			if (x > viewportWidth - 250) {
				transform = "translate(-100%, -50%)";
			} else if (x < 250) {
				transform = "translate(0%, -50%)";
			}
			if (y > viewportHeight - 250) {
				transform = "translate(-50%, -100%)";
			} else if (y < 250) {
				transform = "translate(-50%, 0%)";
			}

			return { x, y, transform };
		};

		cy.on("tap", "node", (e) => {
			const node = e.target;
			const position = node.renderedPosition();
			const dimension = `${node.data("width") / 10}'X${node.data("height") / 10}'`;
			const { x, y, transform } = getPopupPosition(position.x, position.y);
			setPopupData({
				id: node.id(),
				label: node.data("label"),
				category: node.data("category"),
				position: { x, y },
				shape_type: node.data("shape_type"),
				dimension: dimension,
				transform: transform,
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
				<div
					className="absolute z-50 bg-white rounded-xl shadow-lg p-5 border border-gray-100 w-64"
					style={{
						left: `${popupData.position.x}px`,
						top: `${popupData.position.y}px`,
						transform: popupData.transform,
					}}
				>
					{/* Close button */}
					<button
						type="button"
						onClick={() => setPopupData(null)}
						className="absolute -top-2 -right-2 bg-white hover:bg-gray-50 rounded-full p-1.5 shadow-sm border border-gray-100 transition-colors"
						aria-label="Close popup"
					>
						<FontAwesomeIcon
							icon={faXmark}
							className="w-3.5 h-3.5 text-gray-400"
						/>
					</button>

					<div className="space-y-3">
						{/* Booth name */}
						<h3 className="font-semibold text-gray-900 text-lg">
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
								className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg
            transition-colors duration-200 font-medium text-sm
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
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
