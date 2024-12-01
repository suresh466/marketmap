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
					},
				},
				{
					selector: "edge",
					style: {
						width: 2,
						"line-color": "#999",
						"curve-style": "bezier",
					},
				},
				{
					selector: ".highlighted",
					style: {
						"background-color": "#ff0",
						"line-color": "#f00",
						"target-arrow-color": "#f00",
					},
				},
			],
			layout: {
				name: "preset",
				fit: true,
			},
			wheelSensitivity: 0.2,
		});

		onGraphReady(cy);

		return () => {
			cy.destroy();
		};
	}, [onGraphReady]);

	return <div ref={containerRef} className="graph-container" />;
};
