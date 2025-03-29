import { useEffect, useState } from "react";
import { BoothList } from "./components/BoothList";
import { Graph } from "./components/Graph";
import { useGraph } from "./hooks/useGraph";
import type { Booth } from "./types";
import "./styles/Graph.css";

import type { ElementsDefinition } from "cytoscape";
import { FitViewButton } from "./components/controls/FitViewButton";
import { PathResetButton } from "./components/controls/ResetGraphButton";
import { ShareButton } from "./components/controls/ShareButton";

// interface NodePopupData {
// 	label: string;
// 	name: string;
// 	category: string;
// }

// interface Booth {
// 	data: {
// 		id: string;
// 		label: string;
// 		name: string;
// 		category: string;
// 		shape_type: string;
// 	};
// }

function App() {
	const [isBoothListExpanded, setIsBoothListExpanded] = useState(false);
	const [graphReady, setGraphReady] = useState(false);
	const [graphData, setGraphData] = useState<ElementsDefinition | null>(null);
	const { cy, initCyRef, highlightPath, setLocationMarkers, getNodeIdByLabel } =
		useGraph();
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

	function handleImHere(booth: Booth) {
		setOriginSearchTerm(booth.data.name);
		setSelectedOriginBooth(booth.data.label);

		// Update markers
		setLocationMarkers(
			booth.data.id, // The current node becomes the origin
			selectedDestBooth ? getNodeIdByLabel(selectedDestBooth) : null, // Use hook's method directly
		);

		console.log(`Set origin to:${booth.data.name}(${booth.data.label})`);
	}

	function handleGetHere(booth: Booth) {
		setDestSearchTerm(booth.data.name);
		setSelectedDestBooth(booth.data.label);

		// Update markers
		setLocationMarkers(
			selectedOriginBooth ? getNodeIdByLabel(selectedOriginBooth) : null, // Use hook's method directly
			booth.data.id, // The current node becomes the destination
		);

		console.log(`Set destination to:${booth.data.name}(${booth.data.label})`);
	}

	// cleanup url parameters after selected booth initialization
	useEffect(() => {
		if (window.location.search) {
			window.history.replaceState({}, "", window.location.pathname);
		}
	}, []);

	useEffect(() => {
		fetch("/api/graph")
			.then((response) => response.json())
			.then((data) => {
				setGraphData(data);
			})
			.catch((error) => console.error("Error loading graph Data:", error));
	}, []);

	useEffect(() => {
		const handlePopState = () => {
			if (isBoothListExpanded) setIsBoothListExpanded(false);
		};
		window.addEventListener("popstate", handlePopState);
		return () => removeEventListener("popstate", handlePopState);
	}, [isBoothListExpanded]);

	const handlePathReset = () => {
		setOriginSearchTerm("");
		setDestSearchTerm("");
		setSelectedOriginBooth(null);
		setSelectedDestBooth(null);
		setActiveSearchBox("origin");
		setLocationMarkers(null, null);
	};

	const handleFitView = () => {
		cy.current?.fit();
	};

	useEffect(() => {
		if (!graphReady || !cy.current) return;

		// Restore markers if needed
		if (selectedOriginBooth || selectedDestBooth) {
			setLocationMarkers(
				selectedOriginBooth ? getNodeIdByLabel(selectedOriginBooth) : null,
				selectedDestBooth ? getNodeIdByLabel(selectedDestBooth) : null,
			);
		}
	}, [
		graphReady,
		cy,
		selectedOriginBooth,
		selectedDestBooth,
		getNodeIdByLabel,
		setLocationMarkers,
	]);

	return (
		<main className="relative h-screen overflow-hidden">
			{/* Search controls overlay */}
			<div className="absolute inset-x-4 top-2 z-20 md:inset-auto md:left-6 md:top-6 md:w-1/4">
				<BoothList
					graphReady={graphReady}
					isBoothListExpanded={isBoothListExpanded}
					booths={
						(graphData?.nodes.filter(
							(node) => node.data?.name && node.data.name !== "booth",
						) as Booth[]) ?? null
					}
					originSearchTerm={originSearchTerm}
					destSearchTerm={destSearchTerm}
					activeSearchBox={activeSearchBox}
					selectedOriginBooth={selectedOriginBooth}
					selectedDestBooth={selectedDestBooth}
					onBoothListToggle={setIsBoothListExpanded}
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
			<div className="absolute bottom-32 right-8 z-10 flex gap-3 md:bottom-auto md:top-6">
				<ShareButton
					selectedOriginBooth={selectedOriginBooth}
					selectedDestBooth={selectedDestBooth}
				/>

				<PathResetButton onPathReset={handlePathReset} />
				<FitViewButton onFitView={handleFitView} />
			</div>

			{/* Graph */}
			<div className="h-full w-full p-1">
				<Graph
					onGraphReady={setGraphReady}
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
