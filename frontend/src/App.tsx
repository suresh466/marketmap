import { useEffect, useState } from "react";
import { BoothList } from "./components/BoothList";
import { Graph } from "./components/Graph";
import { CategoryButtons } from "./components/controls/CategoryButtons";
import { Layout } from "./components/layout/Layout";
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
		<Layout>
			{/* Main content area - Graph section */}
			<div className="w-[80%] relative bg-white">
				<div className="h-full p-6">
					<Graph onGraphReady={setCy} onGetDirection={handleGetDirection} />

					{/* Controls container */}
					<div className="absolute bottom-6 left-6 right-6 bg-white/1 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 p-4">
						<div className="flex justify-between items-center">
							{/* Category filters */}
							<div className="flex-1">
								<CategoryButtons
									categories={categories}
									selectedCategory={selectedCategory}
									onCategoryChange={handleCategoryChange}
								/>
							</div>

							{/* Action buttons */}
							<div className="flex space-x-3">
								<PathResetButton
									onPathReset={handlePathReset}
									pathTimeout={pathTimeout}
								/>
								<FitViewButton onFitView={handleFitView} />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Sidebar - Booth list */}
			<div className="w-[20%] border-l border-gray-100 bg-white shadow-inner">
				<BoothList
					booths={filteredBooths}
					onPathFind={highlightPath}
					shouldReset={shouldReset}
					onReset={setShouldReset}
					directionBooth={directionBooth}
					onDirectionBooth={setDirectionBooth}
					onPathTimeout={setPathTimeout}
				/>
			</div>
		</Layout>
	);
}

export default App;
