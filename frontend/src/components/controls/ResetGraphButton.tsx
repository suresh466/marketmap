import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

interface PathResetButtonProps {
	onPathReset: () => void;
	pathTimeout: number | null;
}

export const PathResetButton = ({
	onPathReset,
	pathTimeout,
}: PathResetButtonProps) => {
	const resetIcon = faRefresh;

	const [timeLeft, setTimeLeft] = useState<number | null>(null);

	useEffect(() => {
		// Effect for handling timer
		if (pathTimeout === null) {
			setTimeLeft(null);
			return;
		}

		setTimeLeft(pathTimeout);
		const timer = setInterval(() => {
			setTimeLeft((prev) => (prev === null || prev <= 0 ? null : prev - 1));
		}, 1000);

		return () => clearInterval(timer);
	}, [pathTimeout]);

	useEffect(() => {
		// Separate effect for handling reset
		if (timeLeft === 0) {
			onPathReset();
		}
	}, [timeLeft, onPathReset]);

	return (
		<button
			type="button"
			onClick={onPathReset}
			className="absolute bottom-4 right-16 p-2.5
            bg-white/90 backdrop-blur-sm
            hover:bg-white/100
            transition-all duration-200 ease-in-out
            rounded-lg shadow-lg
            text-gray-600 hover:text-gray-800
            border border-gray-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
		>
			<FontAwesomeIcon icon={resetIcon} />
			{timeLeft !== null && <span className="ml-2">{timeLeft}</span>}
		</button>
	);
};
