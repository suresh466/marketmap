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
			className="
        px-2 py-1
        bg-white/90 backdrop-blur-sm
        hover:bg-white/100
        text-gray-600 hover:text-gray-800
        border border-gray-200
        rounded-lg shadow-lg
        transition-all duration-200 ease-in-out
        active:ring-2 active:ring-amber-500 active:ring-offset-2
        group
        "
			aria-label="Reset path"
		>
			<FontAwesomeIcon
				icon={resetIcon}
				className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300"
			/>
			{timeLeft !== null && (
				<span className="ml-2 font-medium text-lg text-amber-500">
					{timeLeft}
				</span>
			)}
		</button>
	);
};
