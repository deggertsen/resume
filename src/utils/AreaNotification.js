export class AreaNotification {
	constructor() {
		this.notification = document.getElementById('area-notification');
		this.title = document.getElementById('notification-title');
		this.subtitle = document.getElementById('notification-subtitle');
		this.currentTimeout = null;
		this.isShowing = false;
		this.lastShownArea = null;
		
		console.log("🔔 Area notification system initialized");
	}

	show(areaName, description = "Explore and discover new adventures") {
		// Don't show the same area twice in a row
		if (this.lastShownArea === areaName) {
			return;
		}
		
		this.lastShownArea = areaName;
		
		// Clear any existing timeout
		if (this.currentTimeout) {
			clearTimeout(this.currentTimeout);
			this.currentTimeout = null;
		}

		// Update content
		this.title.textContent = areaName;
		this.subtitle.textContent = description;

		// Show notification with animation
		this.notification.classList.remove('fade-out');
		this.notification.classList.add('show');
		this.isShowing = true;

		console.log(`🌟 Showing area notification: ${areaName}`);

		// Set timeout to fade out after 3 seconds
		this.currentTimeout = setTimeout(() => {
			this.fadeOut();
		}, 3000);
	}

	fadeOut() {
		if (!this.isShowing) return;

		this.notification.classList.remove('show');
		this.notification.classList.add('fade-out');
		this.isShowing = false;

		// Clear the last shown area after fade completes
		setTimeout(() => {
			this.lastShownArea = null;
		}, 500); // Match CSS transition duration

		console.log("✨ Area notification faded out");
	}

	// Force hide immediately (for transitions, etc.)
	hide() {
		if (this.currentTimeout) {
			clearTimeout(this.currentTimeout);
			this.currentTimeout = null;
		}
		
		this.notification.classList.remove('show', 'fade-out');
		this.isShowing = false;
		this.lastShownArea = null;
	}

	// Get area descriptions
	getAreaDescription(areaName) {
		const descriptions = {
			"Portfolio Crossroads": "Where all paths meet",
			"About Me Meadow": "Discover my story and passions", 
			"Experience Village": "Professional journey and skills",
			"Projects Portal": "Creative works and achievements",
			"Danger Dungeon": "Adventure awaits the brave"
		};
		
		return descriptions[areaName] || "Explore and discover new adventures";
	}
} 