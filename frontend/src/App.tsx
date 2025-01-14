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
	const [shouldReset, setShouldReset] = useState<boolean>(false);
	const [directionBooth, setDirectionBooth] = useState<string | "">("");
	const [pathTimeout, setPathTimeout] = useState<number | null>(null);

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
		setPathTimeout(null);
		setShouldReset(true);
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
		<main className="h-screen flex flex-1 overflow-hidden">
			{/* Sidebar - Booth list */}
			<aside className="w-[20%] border-r border-amber-100 shadow-inner">
				<BoothList
					booths={filteredBooths}
					onPathFind={highlightPath}
					shouldReset={shouldReset}
					onReset={setShouldReset}
					directionBooth={directionBooth}
					onDirectionBooth={setDirectionBooth}
					onPathTimeout={setPathTimeout}
				/>
			</aside>
			{/* Graph section */}
			<div className="w-[80%] relative">
				{/* Category filters */}
				<div className="absolute top-6 left-6 z-10">
					<div className="flex justify-between items-center gap-4">
						<div className="flex-1">
							<CategoryButtons
								categories={categories}
								selectedCategory={selectedCategory}
								onCategoryChange={handleCategoryChange}
							/>
						</div>
					</div>
				</div>
				{/* Action buttons */}
				<div className="absolute top-6 right-6 z-10">
					<div className="flex justify-between items-center gap-4">
						<div className="flex gap-3">
							<PathResetButton
								onPathReset={handlePathReset}
								pathTimeout={pathTimeout}
							/>
							<FitViewButton onFitView={handleFitView} />
						</div>
					</div>
				</div>
				<div className="h-full p-4">
					<Graph onGraphReady={setCy} onGetDirection={handleGetDirection} />
				</div>
			</div>
		</main>
	);
}

export default App;
