import { faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import copy from "clipboard-copy";
import { useState } from "react";

export const ShareButton = () => {
	const [showToast, setShowToast] = useState(false);

	const handleShare = async () => {
		const url = window.location.href;

		try {
			await copy(url);
			setShowToast(true);
			setTimeout(() => setShowToast(false), 2000);
		} catch (err) {
			console.error("Error sharing the route:", err);
		}
	};

	return (
		<>
			<button
				type="button"
				onClick={handleShare}
				className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
				title="Share"
			>
				<FontAwesomeIcon icon={faShare} className="w-6 h-6 text-gray-600" />
			</button>

			{showToast && (
				<div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg z-50">
					Route copied to clipboard!
				</div>
			)}
		</>
	);
};
