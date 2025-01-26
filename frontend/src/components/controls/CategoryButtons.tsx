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
	console.log(selectedCategory);
	return (
		<div className="flex flex-wrap gap-2 justify-center">
			{categories.map((category) => (
				<button
					key={category}
					type="button"
					onClick={() => onCategoryChange(category)}
					className={`
                shadow-md capitalize
                px-2 py-0
                text-sm font-semibold
                rounded-xl transition-all
                duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
									selectedCategory.toLowerCase() === category.toLowerCase()
										? "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500"
										: "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300 focus:ring-gray-500"
								}
                `}
				>
					{category}
				</button>
			))}
		</div>
	);
};
