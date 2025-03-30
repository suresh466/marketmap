import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Booth } from "../types";
import { logger } from "../utils/logger";
import { CategoryButtons } from "./controls/CategoryButtons";

import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

interface BoothListProps {
	isBoothListExpanded: boolean;
	booths: Booth[] | null;
	graphReady: boolean;
	originSearchTerm: string;
	destSearchTerm: string;
	activeSearchBox: string;
	selectedOriginBooth: string | null;
	selectedDestBooth: string | null;
	onBoothListToggle: Dispatch<SetStateAction<boolean>>;
	onPathFind: (path: string[]) => void;
	onOriginSearchChange: Dispatch<SetStateAction<string>>;
	onDestSearchChange: Dispatch<SetStateAction<string>>;
	onSearchBoxChange: Dispatch<SetStateAction<"origin" | "dest">>;
	onOriginSelect: Dispatch<SetStateAction<string | null>>;
	onDestSelect: Dispatch<SetStateAction<string | null>>;
}

export const BoothList = ({
	isBoothListExpanded,
	booths,
	graphReady,
	originSearchTerm,
	destSearchTerm,
	activeSearchBox,
	selectedOriginBooth,
	selectedDestBooth,
	onBoothListToggle,
	onPathFind,
	onOriginSearchChange,
	onDestSearchChange,
	onSearchBoxChange,
	onOriginSelect,
	onDestSelect,
}: BoothListProps) => {
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const originInputRef = useRef<HTMLInputElement>(null);
	const boothListRef = useRef<HTMLDivElement>(null);

	const handleBoothClick = async (boothLabel: string) => {
		if (activeSearchBox === "origin") {
			logger.userAction("selectOriginFromSearch", { boothLabel });
			onOriginSelect(boothLabel);
			onOriginSearchChange(boothLabel);
		} else {
			logger.userAction("selectDestinationFromSearch", { boothLabel });
			onDestSelect(boothLabel);
			onDestSearchChange(boothLabel);
		}
	};

	const isSelected = (boothLabel: string) => {
		return (
			(activeSearchBox === "origin" && selectedOriginBooth === boothLabel) ||
			(activeSearchBox === "dest" && selectedDestBooth === boothLabel)
		);
	};

	const uniqueCategories = useMemo(
		() =>
			booths
				? [
						"all",
						...new Set(booths.map((booth) => booth.data.category)),
					].filter(Boolean)
				: [],
		[booths],
	);

	const filteredBooths =
		booths?.filter((booth) => {
			const isValidShape = ["rectangle", "hexagon"].includes(
				booth.data.shape_type,
			);

			const matchesCategory =
				selectedCategory === "all" || booth.data.category === selectedCategory;

			const searchTerm = (
				activeSearchBox === "origin" ? originSearchTerm : destSearchTerm
			).toLowerCase();

			const matchesSearch =
				booth.data.label?.toLowerCase().includes(searchTerm) ||
				booth.data.name.toLowerCase().includes(searchTerm);

			return isValidShape && matchesCategory && matchesSearch;
		}) ?? [];

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
					window.history.back();
				}
			};

			document.addEventListener("pointerdown", handleClickOutside);
			return () => {
				document.removeEventListener("pointerdown", handleClickOutside);
			};
		}
	}, [isBoothListExpanded]);

	useEffect(() => {
		if (!graphReady) return;

		if (selectedOriginBooth && selectedDestBooth) {
			const controller = new AbortController();

			fetch(
				`/api/shortest-path/-/${encodeURIComponent(selectedOriginBooth)}/-/${encodeURIComponent(selectedDestBooth)}`,
				{
					signal: controller.signal,
				},
			)
				.then((response) => response.json())
				.then((data) => {
					logger.navigation("pathFound", {
						origin: selectedOriginBooth,
						destination: selectedDestBooth,
						pathLength: data.path.length,
					});

					// Only collapse on mobile screens
					onPathFind(data.path);
					if (window.matchMedia("(max-width: 767px)").matches) {
						if (isBoothListExpanded) window.history.back();
					}
				})
				.catch((error) => {
					if (error.name !== "AbortError") {
						console.error("Error fetching path:", error);
						logger.error("pathFindingError", error);
						onPathFind([]);
					}
				});

			return () => controller.abort();
		}
		onPathFind([]);
	}, [graphReady, selectedOriginBooth, selectedDestBooth, onPathFind]);

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
						onFocus={() => {
							window.history.pushState({}, "", "");
							onBoothListToggle(true);
						}}
						className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pl-10 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
					/>
				</div>
			) : (
				<div
					ref={boothListRef}
					className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
				>
					{/* Origin Search Input */}
					<div className="border-b border-gray-100 p-4">
						<input
							ref={originInputRef}
							type="search"
							placeholder="Search Origin"
							value={originSearchTerm}
							onChange={(e) => {
								if (e.target.value === "") onOriginSelect(null);
								onOriginSearchChange(e.target.value);

								// Simple debounce using closure and DOM value
								const currentValue = e.target.value;
								const inputElement = e.target;
								if (currentValue && currentValue.length > 2) {
									setTimeout(() => {
										// Compare with the actual DOM element value
										if (currentValue === inputElement.value) {
											logger.userAction("searchOrigin", { term: currentValue });
										}
									}, 500);
								}
							}}
							onFocus={() => {
								onSearchBoxChange("origin");
								logger.userAction("focusOriginSearch");
							}}
							className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
						/>
					</div>

					{/* Destination Search Input */}
					<div className="border-b border-gray-100 p-4">
						<input
							type="search"
							placeholder="Search Destination"
							value={destSearchTerm}
							onChange={(e) => {
								if (e.target.value === "") onDestSelect(null);
								onDestSearchChange(e.target.value);

								// Simple debounce using closure and DOM value
								const currentValue = e.target.value;
								const inputElement = e.target;
								if (currentValue && currentValue.length >= 2) {
									setTimeout(() => {
										// Compare with the actual DOM element value
										if (currentValue === inputElement.value) {
											logger.userAction("searchDest", { term: currentValue });
										}
									}, 500);
								}
							}}
							onFocus={() => {
								onSearchBoxChange("dest");
								logger.userAction("focusDestinationSearch");
							}}
							className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
						/>
					</div>

					{/* Category filters */}
					<div className="border-b border-gray-100 px-4 py-3">
						<CategoryButtons
							categories={uniqueCategories}
							selectedCategory={selectedCategory}
							onCategoryChange={(category) => {
								setSelectedCategory(category);
								logger.userAction("selectCategory", { category });
							}}
						/>
					</div>

					{/* Booth List */}
					<div className="max-h-[60vh] overflow-y-auto scroll-smooth">
						{filteredBooths.length === 0 ? (
							<div className="flex h-full flex-col items-center justify-center p-8 text-gray-500">
								<span className="text-lg">No booths found</span>
								<span className="mt-1 text-sm">Try adjusting your search</span>
							</div>
						) : (
							<ul className="divide-y divide-gray-100">
								{filteredBooths.map((booth) => (
									<li
										key={booth.data.id}
										className="transition-colors duration-200"
									>
										<button
											type="button"
											onClick={() => handleBoothClick(booth.data.label)}
											className={`w-full px-4 py-3 text-left transition-all duration-200 hover:bg-amber-50${isSelected(booth.data.label) ? "bg-amber-50" : "bg-white"}`}
										>
											<div
												className={`font-medium${
													isSelected(booth.data.label)
														? "text-amber-900"
														: "text-gray-900"
												}`}
											>
												{booth.data.name}
											</div>
											<div
												className={`text-sm${
													isSelected(booth.data.label)
														? "text-amber-700"
														: "text-gray-500"
												}`}
											>
												{booth.data.label}
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
