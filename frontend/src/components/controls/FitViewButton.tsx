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
        absolute bottom-4 right-4
        flex items-center justify-center
        min-w-[2.5rem] h-10
        px-3 py-2
        bg-white/90 backdrop-blur-sm
        hover:bg-white/100
        text-gray-600 hover:text-gray-800
        border border-gray-200
        rounded-lg shadow-lg
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
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
