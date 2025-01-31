import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { CategoryButtons } from "./controls/CategoryButtons";

import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Booth {
	id: string;
	label: string;
	shape_type: string;
	category: string;
}

interface BoothListProps {
	booths: Booth[];
	originSearchTerm: string;
	destSearchTerm: string;
	activeSearchBox: string;
	selectedOriginBooth: string | null;
	selectedDestBooth: string | null;
	categories: string[];
	selectedCategory: string;
	onPathFind: (path: string[]) => void;
	directionBooth: string;
	onDirectionBooth: Dispatch<SetStateAction<string>>;
	onOriginSearchChange: Dispatch<SetStateAction<string>>;
	onDestSearchChange: Dispatch<SetStateAction<string>>;
	onSearchBoxChange: Dispatch<SetStateAction<"origin" | "dest">>;
	onOriginSelect: Dispatch<SetStateAction<string | null>>;
	onDestSelect: Dispatch<SetStateAction<string | null>>;
	setSelectedCategory: Dispatch<SetStateAction<string>>;
}

export const BoothList = ({
	booths,
	originSearchTerm,
	destSearchTerm,
	activeSearchBox,
	selectedOriginBooth,
	selectedDestBooth,
	categories,
	selectedCategory,
	onPathFind,
	directionBooth,
	onDirectionBooth,
	onOriginSearchChange,
	onDestSearchChange,
	onSearchBoxChange,
	onOriginSelect,
	onDestSelect,
	setSelectedCategory,
}: BoothListProps) => {
	const originInputRef = useRef<HTMLInputElement>(null);
	const boothListRef = useRef<HTMLDivElement>(null);

	const [isBoothListExpanded, setIsBoothListExpanded] = useState(false);

	const handleBoothClick = async (boothLabel: string) => {
		if (activeSearchBox === "origin") {
			onOriginSelect(boothLabel);
			onOriginSearchChange(boothLabel);
		} else {
			onDestSelect(boothLabel);
			onDestSearchChange(boothLabel);
		}
	};
	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category);
	};

	// Focus origin input when booth list expands and origin is not selected
	useEffect(() => {
		if (isBoothListExpanded && !selectedOriginBooth) {
			originInputRef.current?.focus();
		}
	}, [isBoothListExpanded, selectedOriginBooth]);

	// Collapse expanded list when clicking outside
	useEffect(() => {
		if (isBoothListExpanded) {
			const handleClickOutside = (event: MouseEvent | TouchEvent) => {
				const target = event.target as Node;
				if (boothListRef.current && !boothListRef.current.contains(target)) {
					setIsBoothListExpanded(false);
				}
			};

			document.addEventListener("click", handleClickOutside);
			document.addEventListener("touchend", handleClickOutside);
			return () => {
				document.removeEventListener("click", handleClickOutside);
				document.removeEventListener("touchend", handleClickOutside);
			};
		}
	}, [isBoothListExpanded]);

	// Enables back button to collapse expanded list
	useEffect(() => {
		if (isBoothListExpanded) {
			// Add history entry when expanded
			window.history.pushState({ expanded: true }, "");

			const handlePopState = () => {
				setIsBoothListExpanded(false);
			};

			window.addEventListener("popstate", handlePopState);
			return () => window.removeEventListener("popstate", handlePopState);
		}
	}, [isBoothListExpanded]);

	// set destination booth when get direction button is clicked in booth pop-up
	useEffect(() => {
		if (directionBooth) {
			onDestSearchChange(directionBooth);
			onDestSelect(directionBooth);
			if (!selectedOriginBooth) {
				setIsBoothListExpanded(true);
			}
			onDirectionBooth("");
		}
	}, [
		directionBooth,
		selectedOriginBooth,
		onDirectionBooth,
		onDestSearchChange,
		onDestSelect,
	]);

	useEffect(() => {
		if (!originSearchTerm || !destSearchTerm) {
			if (!originSearchTerm) onOriginSelect(null);
			if (!destSearchTerm) onDestSelect(null);
			onPathFind([]);
			return;
		}

		if (selectedOriginBooth && selectedDestBooth) {
			const controller = new AbortController();

			fetch(`/shortest-path/${selectedOriginBooth}/${selectedDestBooth}`, {
				signal: controller.signal,
			})
				.then((response) => response.json())
				.then((data) => {
					// Only collapse on mobile screens
					if (window.matchMedia("(max-width: 767px)").matches) {
						setIsBoothListExpanded(false);
					}
					onPathFind(data.path);
				})
				.catch((error) => {
					if (error.name !== "AbortError") {
						console.error("Error fetching path:", error);
						onDestSelect(null);
						onPathFind([]);
					}
				});

			return () => controller.abort();
		}
	}, [
		selectedOriginBooth,
		selectedDestBooth,
		originSearchTerm,
		destSearchTerm,
		onPathFind,
		onOriginSelect,
		onDestSelect,
	]);

	const filteredBooths = booths.filter(
		(booth) =>
			booth.shape_type !== "diamond" &&
			booth.shape_type !== "ellipse" &&
			(selectedCategory === "All" || booth.category === selectedCategory) &&
			booth.label
				.toLowerCase()
				.includes(
					(activeSearchBox === "origin"
						? originSearchTerm
						: destSearchTerm
					).toLowerCase(),
				),
	);

	return (
		<>
			{/* Dummy search input when boothlist collapsed */}
			{!isBoothListExpanded ? (
				<div className="relative">
					<FontAwesomeIcon
						icon={faSearch}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
					/>
					<input
						type="search"
						placeholder="Search for a booth..."
						onFocus={() => setIsBoothListExpanded(true)}
						className="w-full pl-10 px-4 py-3
        bg-gray-50
        border border-gray-200
        rounded-lg
        text-gray-700 placeholder-gray-400
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
        focus:bg-white"
					/>
				</div>
			) : (
				<div
					ref={boothListRef}
					className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col"
				>
					{/* Origin Search Input */}
					<div className="p-4 border-b border-gray-100">
						<input
							ref={originInputRef}
							type="search"
							placeholder="Search Origin"
							value={originSearchTerm}
							onChange={(e) => onOriginSearchChange(e.target.value)}
							onFocus={() => onSearchBoxChange("origin")}
							className="w-full px-4 py-2.5
              bg-gray-50
              border border-gray-200
              rounded-lg
              text-gray-700 placeholder-gray-400
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
              focus:bg-white"
						/>
					</div>

					{/* Destination Search Input */}
					<div className="p-4 border-b border-gray-100">
						<input
							type="search"
							placeholder="Search Destination"
							value={destSearchTerm}
							onChange={(e) => onDestSearchChange(e.target.value)}
							onFocus={() => onSearchBoxChange("dest")}
							className="w-full px-4 py-2.5
              bg-gray-50
              border border-gray-200
              rounded-lg
              text-gray-700 placeholder-gray-400
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
              focus:bg-white"
						/>
					</div>

					{/* Category filters */}
					<div className="px-4 py-3 border-b border-gray-100">
						<CategoryButtons
							categories={categories}
							selectedCategory={selectedCategory}
							onCategoryChange={handleCategoryChange}
						/>
					</div>

					{/* Booth List */}
					<div className="max-h-[60vh] overflow-y-auto scroll-smooth">
						{filteredBooths.length === 0 ? (
							<div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
								<span className="text-lg">No booths found</span>
								<span className="text-sm mt-1">Try adjusting your search</span>
							</div>
						) : (
							<ul className="divide-y divide-gray-100">
								{filteredBooths.map((booth) => (
									<li key={booth.id} className="transition-colors duration-200">
										<button
											type="button"
											onClick={() => handleBoothClick(booth.label)}
											className={`
                      w-full px-4 py-3 text-left
                      transition-all duration-200
                      hover:bg-amber-50
                      ${selectedDestBooth === booth.label ? "bg-amber-50" : "bg-white"}
                    `}
										>
											<div
												className={`
                        font-medium
                        ${selectedDestBooth === booth.label ? "text-amber-900" : "text-gray-900"}
                      `}
											>
												{booth.label}
											</div>
											<div
												className={`
                        text-sm
                        ${selectedDestBooth === booth.label ? "text-amber-700" : "text-gray-500"}
                      `}
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
			)}
		</>
	);
};
