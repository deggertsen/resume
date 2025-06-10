export class InputManager {
	constructor() {
		this.keys = new Map();
		this.keysPressed = new Map();
		this.keysReleased = new Map();
	}

	init() {
		// Bind event listeners
		document.addEventListener("keydown", (event) => this.handleKeyDown(event));
		document.addEventListener("keyup", (event) => this.handleKeyUp(event));

		// Prevent context menu on right click (for future mouse controls)
		document.addEventListener("contextmenu", (event) => event.preventDefault());

		console.log("⌨️ Input manager initialized");
	}

	handleKeyDown(event) {
		const keyCode = event.code;

		// Mark as pressed this frame if it wasn't already down
		if (!this.keys.get(keyCode)) {
			this.keysPressed.set(keyCode, true);
		}

		this.keys.set(keyCode, true);

		// Prevent default browser behavior for game keys
		if (this.isGameKey(keyCode)) {
			event.preventDefault();
		}
	}

	handleKeyUp(event) {
		const keyCode = event.code;

		this.keys.set(keyCode, false);
		this.keysReleased.set(keyCode, true);

		if (this.isGameKey(keyCode)) {
			event.preventDefault();
		}
	}

	isGameKey(keyCode) {
		const gameKeys = [
			"KeyW",
			"KeyA",
			"KeyS",
			"KeyD",
			"ArrowUp",
			"ArrowDown",
			"ArrowLeft",
			"ArrowRight",
			"Space",
			"Escape",
		];
		return gameKeys.includes(keyCode);
	}

	// Check if key is currently held down
	isPressed(keyCode) {
		return this.keys.get(keyCode) || false;
	}

	// Check if key was just pressed this frame
	wasPressed(keyCode) {
		return this.keysPressed.get(keyCode) || false;
	}

	// Check if key was just released this frame
	wasReleased(keyCode) {
		return this.keysReleased.get(keyCode) || false;
	}

	// Get movement vector from input
	getMovementVector() {
		const moveVector = { x: 0, z: 0 };

		// Horizontal movement
		if (this.isPressed("KeyA") || this.isPressed("ArrowLeft")) {
			moveVector.x -= 1;
		}
		if (this.isPressed("KeyD") || this.isPressed("ArrowRight")) {
			moveVector.x += 1;
		}

		// Vertical movement
		if (this.isPressed("KeyW") || this.isPressed("ArrowUp")) {
			moveVector.z -= 1;
		}
		if (this.isPressed("KeyS") || this.isPressed("ArrowDown")) {
			moveVector.z += 1;
		}

		return moveVector;
	}

	// Check if attack button was pressed
	isAttackPressed() {
		return this.wasPressed("Space");
	}

	// Check if menu button was pressed
	isMenuPressed() {
		return this.wasPressed("Escape");
	}

	// Clear frame-specific input states (call at end of each frame)
	clearFrameStates() {
		this.keysPressed.clear();
		this.keysReleased.clear();
	}
}
