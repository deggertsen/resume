import { Game } from "./core/Game.js";

class GameLoader {
	constructor() {
		this.loadingScreen = document.getElementById("loading-screen");
		this.loadingProgress = document.getElementById("loading-progress");
		this.loadingText = document.getElementById("loading-text");
		this.game = null;
	}

	async init() {
		try {
			this.updateProgress(10, "Initializing Three.js...");

			// Create and initialize the game
			this.game = new Game();

			this.updateProgress(30, "Setting up renderer...");
			await this.game.init();

			this.updateProgress(60, "Loading assets...");
			// Future: Load initial assets here
			await this.sleep(500); // Simulate asset loading

			this.updateProgress(80, "Preparing world...");
			await this.game.loadInitialScene();

			this.updateProgress(100, "Ready to adventure!");
			await this.sleep(500);

			// Hide loading screen and start game
			this.hideLoadingScreen();
			this.game.start();
		} catch (error) {
			console.error("Failed to initialize game:", error);
			this.loadingText.textContent =
				"Failed to load adventure. Please refresh and try again.";
		}
	}

	updateProgress(percent, text) {
		this.loadingProgress.style.width = `${percent}%`;
		this.loadingText.textContent = text;
	}

	hideLoadingScreen() {
		this.loadingScreen.style.opacity = "0";
		setTimeout(() => {
			this.loadingScreen.style.display = "none";
		}, 500);
	}

	sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

// Initialize the game when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
	const loader = new GameLoader();
	loader.init();
});

// Handle window resize
window.addEventListener("resize", () => {
	window.game?.handleResize?.();
});

// Handle page visibility changes (pause/resume)
document.addEventListener("visibilitychange", () => {
	if (window.game) {
		if (document.hidden) {
			window.game.pause();
		} else {
			window.game.resume();
		}
	}
});
