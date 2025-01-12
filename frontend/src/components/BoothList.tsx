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
}

export const BoothList = ({
	booths,
	onPathFind,
	shouldReset,
	onReset,
	directionBooth,
	onDirectionBooth,
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
		<div className="h-full flex flex-col">
			{/* Origin Search Input */}
			<div className="p-4 border-b border-gray-200">
				<input
					ref={originInputRef}
					type="search"
					placeholder="Search Origin"
					value={originSearchTerm}
					onChange={(e) => setOriginSearchTerm(e.target.value)}
					onFocus={() => setActiveSearchBox("origin")}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            focus:border-transparent"
				/>
			</div>

			{/* Destination Search Input */}
			<div className="p-4 border-b border-gray-200">
				<input
					type="search"
					placeholder="Search Destination"
					value={destSearchTerm}
					onChange={(e) => setDestSearchTerm(e.target.value)}
					onFocus={() => setActiveSearchBox("dest")}
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
							type="button"
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
									selectedDestBooth === booth.label
										? "bg-blue-50"
										: "hover:bg-gray-50"
								}`}
							>
								<button
									type="button"
									onClick={() => handleBoothClick(booth.label)}
									className={`w-full px-4 py-3 text-left
                    focus:outline-none focus:bg-blue-50
                    active:bg-blue-100 transition-colors duration-150
                    ${
											selectedDestBooth === booth.label
												? "text-blue-700"
												: "text-gray-700"
										}`}
								>
									<div className="font-medium">{booth.label}</div>
									<div
										className={`text-sm ${
											selectedDestBooth === booth.label
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
