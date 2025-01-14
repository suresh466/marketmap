import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

interface Booth {
	id: string;
	label: string;
	shape_type: string;
	category: string;
}

interface BoothListProps {
	booths: Booth[];
	onPathFind: (path: string[]) => void;
	shouldReset: boolean;
	onReset: Dispatch<SetStateAction<boolean>>;
	directionBooth: string;
	onDirectionBooth: Dispatch<SetStateAction<string>>;
	onPathTimeout: Dispatch<SetStateAction<number | null>>;
}

export const BoothList = ({
	booths,
	onPathFind,
	shouldReset,
	onReset,
	directionBooth,
	onDirectionBooth,
	onPathTimeout,
}: BoothListProps) => {
	const [originSearchTerm, setOriginSearchTerm] = useState("");
	const [destSearchTerm, setDestSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedOriginBooth, setSelectedOriginBooth] = useState<string | null>(
		null,
	);
	const [selectedDestBooth, setSelectedDestBooth] = useState<string | null>(
		null,
	);
	const [activeSearchBox, setActiveSearchBox] = useState<"origin" | "dest">(
		"origin",
	);

	const originInputRef = useRef<HTMLInputElement>(null);

	const handleBoothClick = async (boothLabel: string) => {
		if (activeSearchBox === "origin") {
			setSelectedOriginBooth(boothLabel);
			setOriginSearchTerm(boothLabel);
		} else {
			setSelectedDestBooth(boothLabel);
			setDestSearchTerm(boothLabel);
		}
	};

	useEffect(() => {
		if (selectedOriginBooth && selectedDestBooth) {
			onPathTimeout(3);
		}
	}, [onPathTimeout, selectedOriginBooth, selectedDestBooth]);

	useEffect(() => {
		if (directionBooth) {
			setSelectedDestBooth(directionBooth);
			setDestSearchTerm(directionBooth);
			if (!selectedOriginBooth) {
				originInputRef.current?.focus();
			}
			onDirectionBooth("");
		}
	}, [directionBooth, onDirectionBooth, selectedOriginBooth]);

	useEffect(() => {
		if (shouldReset) {
			setOriginSearchTerm("");
			setDestSearchTerm("");
			setActiveSearchBox("origin");
			onReset(false);
		}
	}, [shouldReset, onReset]);

	useEffect(() => {
		if (!originSearchTerm || !destSearchTerm) {
			if (!originSearchTerm) setSelectedOriginBooth(null);
			if (!destSearchTerm) setSelectedDestBooth(null);
			onPathFind([]);
			return;
		}

		if (selectedOriginBooth && selectedDestBooth) {
			const controller = new AbortController();

			fetch(`/shortest-path/${selectedOriginBooth}/${selectedDestBooth}`, {
				signal: controller.signal,
			})
				.then((response) => response.json())
				.then((data) => onPathFind(data.path))
				.catch((error) => {
					if (error.name !== "AbortError") {
						console.error("Error fetching path:", error);
						setSelectedDestBooth(null);
						onPathFind([]);
					}
				});

			return () => controller.abort();
		}
	}, [
		selectedOriginBooth,
		selectedDestBooth,
		onPathFind,
		originSearchTerm,
		destSearchTerm,
	]);

	const categories = [
		"All",
		...new Set(booths.map((booth) => booth.category)),
	].filter(Boolean);

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
		<div className="h-full flex flex-col bg-white">
			{/* Origin Search Input */}
			<div className="p-4 border-b border-gray-100">
				<input
					ref={originInputRef}
					type="search"
					placeholder="Search Origin"
					value={originSearchTerm}
					onChange={(e) => setOriginSearchTerm(e.target.value)}
					onFocus={() => setActiveSearchBox("origin")}
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
					onChange={(e) => setDestSearchTerm(e.target.value)}
					onFocus={() => setActiveSearchBox("dest")}
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

			{/* Category Tabs */}
			<div className="border-b border-gray-100">
				<nav className="flex overflow-x-auto py-2 px-4 gap-2">
					{categories.map((category) => (
						<button
							type="button"
							key={category}
							onClick={() => setSelectedCategory(category)}
							className={`
                    whitespace-nowrap px-3 py-1.5
                    text-sm font-medium rounded-full
                    transition-all duration-200
                    ${
											selectedCategory === category
												? "bg-amber-500 text-white"
												: "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
										}
                    `}
						>
							{category}
						</button>
					))}
				</nav>
			</div>

			{/* Booth List */}
			<div className="flex-1 overflow-y-auto scroll-smooth">
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
                    ${
											selectedDestBooth === booth.label
												? "bg-amber-50"
												: "bg-white"
										}
                    `}
								>
									<div
										className={`
                        font-medium
                        ${
													selectedDestBooth === booth.label
														? "text-amber-900"
														: "text-gray-900"
												}
                        `}
									>
										{booth.label}
									</div>
									<div
										className={`
                            text-sm
                            ${
															selectedDestBooth === booth.label
																? "text-amber-700"
																: "text-gray-500"
														}
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
	);
};
