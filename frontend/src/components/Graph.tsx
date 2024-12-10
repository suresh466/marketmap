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

		const fitButton = document.createElement("button");
		fitButton.className =
			"absolute bottom-4 left-4 p-2 bg-white rounded-full shadow-lg " +
			"hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500";
		fitButton.innerHTML = `
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0-4h4m-4 4l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    `;
		fitButton.onclick = () => cy.fit();
		containerRef.current.appendChild(fitButton);

		onGraphReady(cy);

		return () => {
			cy.destroy();
			fitButton.remove();
		};
	}, [onGraphReady]);

	return <div ref={containerRef} className="h-full relative graph-container" />;
};
