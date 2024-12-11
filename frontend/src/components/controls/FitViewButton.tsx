import { faExpandArrowsAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface FitViewButtonProps {
	onFitView: () => void;
}

export const FitViewButton = ({ onFitView }: FitViewButtonProps) => {
	const fitIcon = faExpandArrowsAlt;
	return (
		<button
			type="button"
			onClick={onFitView}
			className="absolute bottom-4 right-4 p-2.5
            bg-white/90 backdrop-blur-sm
            hover:bg-white/100
            transition-all duration-200 ease-in-out
            rounded-lg shadow-lg
            text-gray-600 hover:text-gray-800
            border border-gray-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
		>
			<FontAwesomeIcon icon={fitIcon} size="lg" />
		</button>
	);
};
