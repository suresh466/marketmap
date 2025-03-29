/**
 * Represents data for a node popup in the graph
 */
export interface NodePopupData {
	label: string;
	name: string;
	category: string;
}

/**
 * Represents a booth with its associated data
 */
export interface Booth {
	data: {
		id: string;
		label: string;
		name: string;
		category: string;
		shape_type: string;
		width?: number;
		height?: number;
	};
}
