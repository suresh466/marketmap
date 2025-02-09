import { useEffect, useState } from "react";
import { BoothList } from "./components/BoothList";
import { Graph } from "./components/Graph";
import { useGraph } from "./hooks/useGraph";
import "./styles/Graph.css";

import { FitViewButton } from "./components/controls/FitViewButton";
import { PathResetButton } from "./components/controls/ResetGraphButton";

interface Booth {
	id: string;
	label: string;
	shape_type: string;
	category: string;
}

function App() {
	const { cy, setCy, highlightPath } = useGraph();
	const [booths, setBooths] = useState<Booth[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string>("All");
	const [originSearchTerm, setOriginSearchTerm] = useState("");
	const [destSearchTerm, setDestSearchTerm] = useState("");
	const [activeSearchBox, setActiveSearchBox] = useState<"origin" | "dest">(
		"origin",
	);
	const [selectedOriginBooth, setSelectedOriginBooth] = useState<string | null>(
		null,
	);
	const [selectedDestBooth, setSelectedDestBooth] = useState<string | null>(
		null,
	);
	function handleImHere(booth: string) {
		setOriginSearchTerm(booth);
		setSelectedOriginBooth(booth);
	}

	function handleGetHere(booth: string) {
		setDestSearchTerm(booth);
		setSelectedDestBooth(booth);
	}

	const categories = [
		"All",
		...new Set(booths.map((booth) => booth.category)),
	].filter(Boolean);

	const filteredBooths =
		selectedCategory.toLowerCase() === "all"
			? booths
			: booths.filter((booth) => booth.category === selectedCategory);

	const handlePathReset = () => {
		setOriginSearchTerm("");
		setDestSearchTerm("");
		setActiveSearchBox("origin");
	};

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

	useEffect(() => {
		fetch("/api/booths")
			.then((response) => response.json())
			.then(setBooths)
			.catch(console.error);
	}, []);

	return (
		<main className="h-screen overflow-hidden relative">
			<div className="absolute z-20 inset-x-4 top-2 md:inset-auto md:left-6 md:top-6 md:w-1/4">
				{/* Search controls overlay */}
				<BoothList
					booths={filteredBooths}
					originSearchTerm={originSearchTerm}
					destSearchTerm={destSearchTerm}
					activeSearchBox={activeSearchBox}
					selectedOriginBooth={selectedOriginBooth}
					selectedDestBooth={selectedDestBooth}
					categories={categories}
					selectedCategory={selectedCategory}
					onPathFind={highlightPath}
					onOriginSearchChange={setOriginSearchTerm}
					onDestSearchChange={setDestSearchTerm}
					onSearchBoxChange={setActiveSearchBox}
					onOriginSelect={setSelectedOriginBooth}
					onDestSelect={setSelectedDestBooth}
					setSelectedCategory={setSelectedCategory}
				/>
			</div>
			{/* Action buttons */}
			{/* todo: fix the button not visible with bottom-32 maybe look into safe-area-insets */}
			<div className="absolute right-8 z-10 flex gap-3 md:top-6 bottom-32 md:bottom-auto">
				<PathResetButton onPathReset={handlePathReset} />
				<FitViewButton onFitView={handleFitView} />
			</div>

			{/* Graph */}
			<div className="h-full w-full p-1">
				<Graph
					onImHere={handleImHere}
					onGetHere={handleGetHere}
					onGraphReady={setCy}
				/>
			</div>
		</main>
	);
}

export default App;
