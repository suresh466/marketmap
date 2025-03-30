// Session ID to group logs from the same session
// const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Session and user context
const SESSION_CONTEXT = {
	sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
	screenWidth: window.innerWidth,
	screenHeight: window.innerHeight,
	userAgent: navigator.userAgent,
	timestamp: new Date().toISOString(),
};

// Configure batching parameters
const CONFIG = {
	BATCH_SIZE: 20,
	BATCH_INTERVAL_MS: 30000, // 30 seconds
	ANALYTICS_ENDPOINT: "/api/analytics/batch",
};

// Store logs until ready to send
let logBatch: Array<{
	type: string;
	event: string;
	data: Record<string, unknown>;
	timestamp: string;
}> = [];

// Setup batch sending interval
const batchInterval = setInterval(() => {
	flushLogs();
}, CONFIG.BATCH_INTERVAL_MS);

// Send batched logs to backend
const flushLogs = () => {
	if (logBatch.length === 0) return;

	// Clone and clear the batch immediately to prevent loss if request fails
	const batchToSend = [...logBatch];
	logBatch = [];

	fetch(CONFIG.ANALYTICS_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			events: batchToSend,
			sessionContext: SESSION_CONTEXT,
		}),
	}).catch(() => {
		// Silent fail for analytics
	});
};

// Log event and add to batch
const logEvent = (
	type: string,
	event: string,
	data?: Record<string, unknown>,
) => {
	// Add to batch
	logBatch.push({
		type,
		event,
		data: data || {},
		timestamp: new Date().toISOString(),
	});

	// Send immediately if batch is large enough
	if (logBatch.length >= CONFIG.BATCH_SIZE) {
		flushLogs();
	}
};

// Exposed logging methods
export const logger = {
	// Track user interactions
	userAction: (action: string, details?: Record<string, unknown>) => {
		logEvent("userAction", action, details);
	},

	// Track performance metrics
	performance: (operation: string, timeMs: number) => {
		logEvent("performance", operation, { timeMs });
	},

	// Track errors
	error: (message: string, error?: Error) => {
		logEvent("error", message, {
			message: error?.message,
			stack: error?.stack,
		});
	},

	// Track navigation/pathfinding
	navigation: (event: string, details?: Record<string, unknown>) => {
		logEvent("navigation", event, details);
	},
};

// Send remaining logs when page is closed
if (typeof window !== "undefined") {
	window.addEventListener("beforeunload", () => {
		clearInterval(batchInterval);

		// Use sendBeacon for more reliable delivery during page unload
		if (navigator.sendBeacon && logBatch.length > 0) {
			navigator.sendBeacon(
				CONFIG.ANALYTICS_ENDPOINT,
				JSON.stringify({
					events: logBatch,
					sessionContext: SESSION_CONTEXT,
				}),
			);
		} else {
			flushLogs();
		}
	});
}
