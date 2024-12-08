interface ControlsProps {
	onFit: () => void;
}

export const Controls = ({ onFit, onReset }: ControlsProps) => (
	<div className="controls">
		<button onClick={onFit}>Fit View</button>
	</div>
);
