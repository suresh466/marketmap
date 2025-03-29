import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

interface PathResetButtonProps {
	onPathReset: () => void;
}

export const PathResetButton = ({ onPathReset }: PathResetButtonProps) => {
	const resetIcon = faRefresh;

	const [timeLeft, setTimeLeft] = useState<number | null>(null);

	// useEffect(() => {
	// 	if (!selectedOriginBooth || !selectedDestBooth) {
	// 		setTimeLeft(null);
	// 		return;
	// 	}
	// 	setTimeLeft(5);
	// }, [selectedOriginBooth, selectedDestBooth]);

	useEffect(() => {
		if (timeLeft === null) return;

		const timer = setInterval(() => {
			setTimeLeft((prev) => (prev as number) - 1); // null check above gurantees it is a number
		}, 1000);

		if (timeLeft <= 0) onPathReset();

		return () => clearInterval(timer);
	}, [timeLeft, onPathReset]);

	return (
		<button
			type="button"
			onClick={onPathReset}
			className="group rounded-lg border border-gray-200 bg-white/90 px-2 py-1 text-gray-600 shadow-lg backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-white/100 hover:text-gray-800 active:ring-2 active:ring-amber-500 active:ring-offset-2"
			aria-label="Reset path"
		>
			<FontAwesomeIcon
				icon={resetIcon}
				className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180"
			/>
			{timeLeft !== null && (
				<span className="ml-2 text-lg font-medium text-amber-500">
					{timeLeft}
				</span>
			)}
		</button>
	);
};
