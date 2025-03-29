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
			className="group rounded-lg border border-gray-200 bg-white/90 px-2 py-1 text-gray-600 shadow-lg backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-white/100 hover:text-gray-800 active:ring-2 active:ring-amber-500 active:ring-offset-2"
			aria-label="Fit view"
		>
			<FontAwesomeIcon
				icon={fitIcon}
				className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
			/>
		</button>
	);
};
