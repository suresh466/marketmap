import { useEffect, useState } from "react";

interface Booth {
	id: string;
	label: string;
}

interface BoothListProps {
	onBoothSelect: (path: string[]) => void;
}

export const BoothList = ({ onBoothSelect }: BoothListProps) => {
	const [booths, setBooths] = useState<Booth[]>([]);

	useEffect(() => {
		fetch("/api/booths")
			.then((response) => response.json())
			.then(setBooths)
			.catch(console.error);
	}, []);

	const handleBoothClick = async (boothId: string) => {
		try {
			const response = await fetch(`/shortest-path/n0/${boothId}`);
			const data = await response.json();
			onBoothSelect(data.path);
		} catch (error) {
			console.error("Error fetching path:", error);
		}
	};

	return (
		<ul className="booth-list">
			{booths.map((booth) => (
				<li key={booth.id}>
					<a href="#" onClick={() => handleBoothClick(booth.id)}>
						{booth.label}
					</a>
				</li>
			))}
		</ul>
	);
};
