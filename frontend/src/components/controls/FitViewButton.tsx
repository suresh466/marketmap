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
			aria-label="Fit view"
		>
			<FontAwesomeIcon
				icon={fitIcon}
				className="w-4 h-4 group-hover:scale-110 transition-transform duration-300"
			/>
		</button>
	);
};
