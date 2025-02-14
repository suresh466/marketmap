import { useEffect, useState } from "react";
import { BoothList } from "./components/BoothList";
import { Graph } from "./components/Graph";
import { useGraph } from "./hooks/useGraph";
import "./styles/Graph.css";

import type { ElementsDefinition } from "cytoscape";
import { FitViewButton } from "./components/controls/FitViewButton";
import { PathResetButton } from "./components/controls/ResetGraphButton";
import { ShareButton } from "./components/controls/ShareButton";

function App() {
	const [graphData, setGraphData] = useState<ElementsDefinition | null>(null);
	const { cy, initCyRef, highlightPath } = useGraph();
	const [activeSearchBox, setActiveSearchBox] = useState<"origin" | "dest">(
		"origin",
	);

	const params = new URLSearchParams(window.location.search);
	const from = params.get("from");
	const to = params.get("to");

	// Initialize from URL params
	const [originSearchTerm, setOriginSearchTerm] = useState(from || "");
	const [destSearchTerm, setDestSearchTerm] = useState(to || "");
	const [selectedOriginBooth, setSelectedOriginBooth] = useState<string | null>(
		from,
	);
	const [selectedDestBooth, setSelectedDestBooth] = useState<string | null>(to);

	function handleImHere(booth: string) {
		setOriginSearchTerm(booth);
		setSelectedOriginBooth(booth);
	}

	function handleGetHere(booth: string) {
		setDestSearchTerm(booth);
		setSelectedDestBooth(booth);
	}

	useEffect(() => {
		fetch("/api/graph")
			.then((response) => response.json())
			.then((data) => {
				setGraphData(data);
				// setBooths(data.nodes);
			})
			.catch((error) => console.error("Error loading graph Data:", error));
	}, []);

	// Sync state to URL
	useEffect(() => {
		const params = new URLSearchParams();
		if (selectedOriginBooth) params.set("from", selectedOriginBooth);
		if (selectedDestBooth) params.set("to", selectedDestBooth);

		const newUrl = params.toString()
			? `${window.location.pathname}?${params.toString()}`
			: window.location.pathname;

		window.history.replaceState({}, "", newUrl);
	}, [selectedOriginBooth, selectedDestBooth]);

	const handlePathReset = () => {
		setOriginSearchTerm("");
		setDestSearchTerm("");
		setActiveSearchBox("origin");
	};

	const handleFitView = () => {
		cy.current?.fit();
	};

	return (
		<main className="h-screen overflow-hidden relative">
			{/* Search controls overlay */}
			<div className="absolute z-20 inset-x-4 top-2 md:inset-auto md:left-6 md:top-6 md:w-1/4">
				<BoothList
					// booths={booths}
					originSearchTerm={originSearchTerm}
					destSearchTerm={destSearchTerm}
					activeSearchBox={activeSearchBox}
					selectedOriginBooth={selectedOriginBooth}
					selectedDestBooth={selectedDestBooth}
					onPathFind={highlightPath}
					onOriginSearchChange={setOriginSearchTerm}
					onDestSearchChange={setDestSearchTerm}
					onSearchBoxChange={setActiveSearchBox}
					onOriginSelect={setSelectedOriginBooth}
					onDestSelect={setSelectedDestBooth}
				/>
			</div>
			{/* Action buttons */}
			{/* todo: fix the button not visible with bottom-32 maybe look into safe-area-insets */}
			<div className="absolute right-8 z-10 flex gap-3 md:top-6 bottom-32 md:bottom-auto">
				<ShareButton />
				<PathResetButton onPathReset={handlePathReset} />
				<FitViewButton onFitView={handleFitView} />
			</div>

			{/* Graph */}
			<div className="h-full w-full p-1">
				<Graph
					graphData={graphData}
					initCyRef={initCyRef}
					onImHere={handleImHere}
					onGetHere={handleGetHere}
				/>
			</div>
		</main>
	);
}

export default App;
