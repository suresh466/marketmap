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
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [shouldReset, setShouldReset] = useState<boolean>(false);

	const categories = [
		"All",
		...new Set(booths.map((booth) => booth.category)),
	].filter(Boolean);

	const filteredBooths =
		selectedCategory.toLowerCase() === "all"
			? booths
			: booths.filter((booth) => booth.category === selectedCategory);

	const handlePathReset = () => {
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
			<div className="w-[80%] relative">
				<Graph onGraphReady={setCy} />
				<CategoryButtons
					categories={categories}
					selectedCategory={selectedCategory}
					onCategoryChange={handleCategoryChange}
				/>
				<PathResetButton onPathReset={handlePathReset} />
				<FitViewButton onFitView={handleFitView} />
			</div>
			<div className="w-[20%] border-l border-gray-200">
				<BoothList
					booths={filteredBooths}
					onPathFind={highlightPath}
					shouldReset={shouldReset}
					onReset={setShouldReset}
				/>
			</div>
		</Layout>
	);
}

export default App;
