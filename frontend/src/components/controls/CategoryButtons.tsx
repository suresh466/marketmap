interface CategoryButtonsProps {
	categories: string[];
	selectedCategory: string;
	onCategoryChange: (category: string) => void;
}

export const CategoryButtons = ({
	categories,
	selectedCategory,
	onCategoryChange,
}: CategoryButtonsProps) => {
	return (
		<div className="absolute top-4 right-4 z-10 flex flex-col gap-4">
			{categories.map((category) => (
				<button
					key={category}
					type="button"
					onClick={() => onCategoryChange(category)}
					className={`text-gray-700 text-xs font-medium py-1.5 px-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 ease-in-out ${
						selectedCategory === category
							? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
							: "bg-white hover:bg-gray-50 hover:border-gray-300"
					}`}
				>
					{category}
				</button>
			))}
		</div>
	);
};
