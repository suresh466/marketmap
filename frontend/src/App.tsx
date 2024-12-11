import { useEffect } from "react";
import { BoothList } from "./components/BoothList";
import { Graph } from "./components/Graph";
import { Layout } from "./components/layout/Layout";
import { useGraph } from "./hooks/useGraph";
import "./styles/Graph.css";

import { FitViewButton } from "./components/controls/FitViewButton";

function App() {
	const { cy, setCy, highlightPath } = useGraph();

	const handleFitView = () => {
		cy?.fit();
	};

	useEffect(() => {
		if (!cy) return;

		fetch("/api/graph")
			.then((response) => response.json())
			.then((data) => {
				cy.elements().remove();
				cy.add(data);
				cy.fit();
			})
			.catch((error) => console.error("Error loading graph:", error));
	}, [cy]);

	return (
		<Layout>
			<div className="w-[80%] relative">
				<Graph onGraphReady={setCy} />
				<FitViewButton onFitView={handleFitView} />
			</div>
			<div className="w-[20%] border-l border-gray-200">
				<BoothList onBoothSelect={highlightPath} />
			</div>
		</Layout>
	);
}

export default App;
