import { useEffect } from "react";
import { BoothList } from "./components/BoothList";
import { Controls } from "./components/Controls";
import { Graph } from "./components/Graph";
import { useGraph } from "./hooks/useGraph";
import "./styles/Graph.css";

function App() {
	const { cy, setCy, highlightPath } = useGraph();

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
		<div className="app">
			<Controls onFit={() => cy?.fit()} onReset={() => cy?.reset()} />
			<BoothList onBoothSelect={highlightPath} />
			<Graph onGraphReady={setCy} />
		</div>
	);
}

export default App;
