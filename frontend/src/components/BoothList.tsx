import { useEffect, useState } from "react";

interface Booth {
	id: string;
	label: string;
	shape_type: string;
	category: string;
}

interface BoothListProps {
	onBoothSelect: (path: string[]) => void;
}

export const BoothList = ({ onBoothSelect }: BoothListProps) => {
	const [booths, setBooths] = useState<Booth[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedBooth, setSelectedBooth] = useState<string | null>(null);

	useEffect(() => {
		fetch("/api/booths")
			.then((response) => response.json())
			.then(setBooths)
			.catch(console.error);
	}, []);

	const handleBoothClick = async (boothLabel: string) => {
		setSelectedBooth(boothLabel); // Update selected state
		try {
			const response = await fetch(`/shortest-path/GAS/${boothLabel}`);
			const data = await response.json();
			onBoothSelect(data.path);
		} catch (error) {
			console.error("Error fetching path:", error);
			setSelectedBooth(null); // Reset on error
		}
	};

	const categories = [
		"All",
		...new Set(booths.map((booth) => booth.category)),
	].filter(Boolean);

	const filteredBooths = booths.filter(
		(booth) =>
			booth.shape_type !== "diamond" &&
			booth.shape_type !== "ellipse" &&
			(selectedCategory === "All" || booth.category === selectedCategory) &&
			booth.label.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className="h-full flex flex-col">
			{/* Search Input */}
			<div className="p-4 border-b border-gray-200">
				<input
					type="search"
					placeholder="Search booths..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:border-transparent"
				/>
			</div>

			{/* Category Tabs */}
			<div className="border-b border-gray-200">
				<nav className="flex overflow-x-auto py-2 px-4">
					{categories.map((category) => (
						<button
							key={category}
							onClick={() => setSelectedCategory(category)}
							className={`whitespace-nowrap px-3 py-2 text-sm font-medium rounded-md
                         mr-2 last:mr-0 transition-colors duration-150
                         ${
														selectedCategory === category
															? "bg-blue-100 text-blue-700"
															: "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
													}`}
						>
							{category}
						</button>
					))}
				</nav>
			</div>

			{/* Booth List */}
			<div className="flex-1 overflow-y-auto">
				{filteredBooths.length === 0 ? (
					<div className="text-center p-4 text-gray-500">No booths found</div>
				) : (
					<ul className="divide-y divide-gray-200">
						{filteredBooths.map((booth) => (
							<li
								key={booth.id}
								className={`transition-colors duration-150 ${
									selectedBooth === booth.label
										? "bg-blue-50"
										: "hover:bg-gray-50"
								}`}
							>
								<button
									onClick={() => handleBoothClick(booth.label)}
									className={`w-full px-4 py-3 text-left
                           focus:outline-none focus:bg-blue-50
                           active:bg-blue-100 transition-colors duration-150
                           ${
															selectedBooth === booth.label
																? "text-blue-700"
																: "text-gray-700"
														}`}
								>
									<div className="font-medium">{booth.label}</div>
									<div
										className={`text-sm ${
											selectedBooth === booth.label
												? "text-blue-500"
												: "text-gray-500"
										}`}
									>
										{booth.category}
									</div>
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};
