interface ControlsProps {
	onFit: () => void;
	onReset: () => void;
}

export const Controls = ({ onFit, onReset }: ControlsProps) => (
	<div className="controls">
		<button onClick={onFit}>Fit View</button>
		<button onClick={onReset}>Reset View</button>
	</div>
);
