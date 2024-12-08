interface LayoutProps {
	children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
	return (
		<div className="h-screen flex flex-col">
			<header className="bg-white border-b border-gray-200">
				<div className="px-4 py-3">
					<h1 className="text-2xl font-bold">Hwy 404 and Steels Flea Market</h1>
				</div>
			</header>
			<main className="flex-1 flex overflow-hidden">{children}</main>
		</div>
	);
};
