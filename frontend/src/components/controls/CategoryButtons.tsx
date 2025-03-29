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
		<div className="flex flex-wrap justify-center gap-2">
			{categories.map((category) => (
				<button
					key={category}
					type="button"
					onClick={() => onCategoryChange(category)}
					className={`rounded-xl px-2 py-0 text-sm font-semibold capitalize shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2${
						selectedCategory.toLowerCase() === category.toLowerCase()
							? "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500"
							: "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-500"
					}`}
				>
					{category}
				</button>
			))}
		</div>
	);
};
