import { useEffect, useState } from "react";
import { BoothList } from "./components/BoothList";
import { Graph } from "./components/Graph";
import { CategoryButtons } from "./components/controls/CategoryButtons";
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
	const [directionBooth, setDirectionBooth] = useState<string | "">("");
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

	const categories = [
		"All",
		...new Set(booths.map((booth) => booth.category)),
	].filter(Boolean);

	const filteredBooths =
		selectedCategory.toLowerCase() === "all"
			? booths
			: booths.filter((booth) => booth.category === selectedCategory);

	const handleGetDirection = (booth: string) => {
		setDirectionBooth(booth);
	};
	const handlePathReset = () => {
		setOriginSearchTerm("");
		setDestSearchTerm("");
		setActiveSearchBox("origin");
	};
	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category);
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
			<div className="absolute top-6 left-6 z-10 flex flex-col md:flex-row md:gap-8 gap-4">
				{/* Search controls overlay */}
				<BoothList
					booths={filteredBooths}
					originSearchTerm={originSearchTerm}
					destSearchTerm={destSearchTerm}
					activeSearchBox={activeSearchBox}
					selectedOriginBooth={selectedOriginBooth}
					selectedDestBooth={selectedDestBooth}
					selectedCategory={selectedCategory}
					onPathFind={highlightPath}
					directionBooth={directionBooth}
					onDirectionBooth={setDirectionBooth}
					onOriginSearchChange={setOriginSearchTerm}
					onDestSearchChange={setDestSearchTerm}
					onSearchBoxChange={setActiveSearchBox}
					onOriginSelect={setSelectedOriginBooth}
					onDestSelect={setSelectedDestBooth}
				/>
				{/* Category filters */}
				<CategoryButtons
					categories={categories}
					selectedCategory={selectedCategory}
					onCategoryChange={handleCategoryChange}
				/>
			</div>
			{/* Action buttons */}
			<div className="absolute top-6 right-6 z-10 flex gap-3">
				<PathResetButton
					selectedOriginBooth={selectedOriginBooth}
					selectedDestBooth={selectedDestBooth}
					onPathReset={handlePathReset}
				/>
				<FitViewButton onFitView={handleFitView} />
			</div>

			{/* Graph */}
			<div className="h-full w-full p-1">
				<Graph onGraphReady={setCy} onGetDirection={handleGetDirection} />
			</div>
		</main>
	);
}

export default App;
