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
}

export const Graph = ({ onGraphReady }: GraphProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [popupData, setPopupData] = useState<NodePopupData | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const cy = cytoscape({
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

			if (x > viewportWidth - 200) {
				transform = "translate(-100%, -50%)";
			} else if (x < 200) {
				transform = "translate(0%, -50%)";
			}
			if (y > viewportHeight - 200) {
				transform = "translate(-50%, -100%)";
			} else if (y < 200) {
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
		<div className="relative h-full">
			<div ref={containerRef} className="h-full relative graph-container" />

			{popupData && (
				<div
					className="absolute z-50 bg-white rounded-lg shadow-xl p-4 border border-gray-200"
					style={{
						left: `${popupData.position.x}px`,
						top: `${popupData.position.y}px`,
						transform: popupData.transform,
					}}
				>
					<button
						type="button"
						onClick={() => setPopupData(null)}
						className="absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1"
						aria-label="Close popup"
					>
						<FontAwesomeIcon icon={faXmark} className="w-4 h-4 text-gray-500" />
					</button>

					<div className="space-y-2">
						<h3 className="font-medium text-gray-900">{popupData.label}</h3>
						<div className="text-sm text-gray-500">
							<p>Type: {popupData.shape_type}</p>
							<p>ID: {popupData.id}</p>
							<p>Dimension: {popupData.dimension}</p>
							<p>CAT: {popupData.category}</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
