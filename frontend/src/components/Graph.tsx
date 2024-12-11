import cytoscape from "cytoscape";
import { useEffect, useRef } from "react";
import "../styles/Graph.css";

interface GraphProps {
	onGraphReady: (cy: cytoscape.Core) => void;
}

export const Graph = ({ onGraphReady }: GraphProps) => {
	const containerRef = useRef<HTMLDivElement>(null);

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
		});

		onGraphReady(cy);

		return () => {
			cy.destroy();
		};
	}, [onGraphReady]);

	return <div ref={containerRef} className="h-full relative graph-container" />;
};
