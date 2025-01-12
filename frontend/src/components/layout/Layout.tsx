interface LayoutProps {
	children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
	return (
		<div className="h-screen flex flex-col bg-amber-50/30">
			<header className="bg-white border-b border-amber-100 px-6 py-4 shadow-sm">
				<h1 className="text-2xl font-semibold text-gray-800 text-center">
					Hwy 404 and Steeles Flea Market
				</h1>
			</header>
			<main className="flex-1 flex overflow-hidden">{children}</main>
		</div>
	);
};
