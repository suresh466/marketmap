import cytoscape from "cytoscape";
import { useEffect, useRef, useState } from "react";
import "../styles/Graph.css";

interface GraphProps {
	onGraphReady: (cy: cytoscape.Core) => void;
}

interface PopupInfo {
	name: string;
	x: number;
	y: number;
}

export const Graph = ({ onGraphReady }: GraphProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [popup, setPopup] = useState<PopupInfo | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const cy = cytoscape({
			container: containerRef.current,
			autoungrabify: true,
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
							ele.data("shape_type") === "diamond"
								? "hidden"
								: "visible",
					},
				},
				{
					selector: "edge",
					style: {
						width: 2,
						"line-color": "#999",
						"curve-style": "bezier",
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
			// wheelSensitivity: 0.2,
		});

		// Add click handler for nodes
		cy.on("click", "node", (evt) => {
			const node = evt.target;
			console.log("Node data:", node.data()); // This will show all data properties
			const name = node.data("name");
			if (name) {
				const position = evt.renderedPosition;
				setPopup({
					name,
					x: position.x,
					y: position.y,
				});
			}
		});

		// Click anywhere else to close popup
		cy.on("click", (evt) => {
			if (evt.target === cy) {
				setPopup(null);
			}
		});

		onGraphReady(cy);

		return () => {
			cy.destroy();
		};
	}, [onGraphReady]);

	return (
		<div ref={containerRef} className="graph-container">
			{popup && (
				<div
					className="node-popup"
					style={{
						position: "absolute",
						left: popup.x,
						top: popup.y,
						backgroundColor: "white",
						padding: "8px",
						borderRadius: "4px",
						boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
						zIndex: 1000,
					}}
				>
					{popup.name}
				</div>
			)}
		</div>
	);
};
