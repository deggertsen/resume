import * as THREE from "three";

export class Player {
	constructor() {
		this.mesh = null;
		this.velocity = new THREE.Vector3(0, 0, 0); // Explicitly set to zero
		this.speed = 15;
		this.acceleration = 50;
		this.friction = 15;

		// Player stats
		this.maxHealth = 100;
		this.currentHealth = 100;
		this.isInvincible = false;
		this.invincibilityTimer = 0;
		this.invincibilityDuration = 1500; // 1.5 seconds in ms
	}

	async init() {
		this.createMesh();
		this.updateHealthUI();
		console.log("🧙‍♂️ Player initialized");
	}

	createMesh() {
		// Create a super simple, super visible player for debugging
		const cubeGeometry = new THREE.BoxGeometry(8, 8, 8);
		const cubeMaterial = new THREE.MeshBasicMaterial({
			color: 0x00ff00, // Bright green
		});
		
		this.mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
		this.mesh.position.set(0, 4, 0); // Raise it above ground so it's clearly visible
		
		console.log("🧙‍♂️ Player mesh (simple cube) created at position:", this.mesh.position);
	}

	update(deltaTime, inputManager) {
		this.handleMovement(deltaTime, inputManager);
		this.updateInvincibility(deltaTime);

		// Clear input frame states
		inputManager.clearFrameStates();
	}

	handleMovement(deltaTime, inputManager) {
		const moveInput = inputManager.getMovementVector();
		
		// Debug raw input only when there's actual input
		if (moveInput.x !== 0 || moveInput.z !== 0) {
			console.log("🏃‍♂️ Raw movement input:", moveInput, "deltaTime:", deltaTime);
			
			// Simple direct movement - no velocity/physics for now
			const moveSpeed = 20; // units per second
			const moveDistance = moveSpeed * deltaTime;
			
			// Move directly based on input
			this.mesh.position.x += moveInput.x * moveDistance;
			this.mesh.position.z += moveInput.z * moveDistance;
			
			console.log("📍 New position:", this.mesh.position);
			
			// Face movement direction
			if (moveInput.x !== 0 || moveInput.z !== 0) {
				const targetRotation = Math.atan2(moveInput.x, moveInput.z);
				this.mesh.rotation.y = targetRotation;
			}
		}

		// Simple boundary checking (keep player in reasonable area)
		const boundary = 90;
		this.mesh.position.x = THREE.MathUtils.clamp(
			this.mesh.position.x,
			-boundary,
			boundary,
		);
		this.mesh.position.z = THREE.MathUtils.clamp(
			this.mesh.position.z,
			-boundary,
			boundary,
		);
	}

	takeDamage(amount) {
		if (this.isInvincible) return false;

		this.currentHealth = Math.max(0, this.currentHealth - amount);
		this.isInvincible = true;
		this.invincibilityTimer = this.invincibilityDuration;

		this.updateHealthUI();

		if (this.currentHealth <= 0) {
			this.handleDeath();
		}

		console.log(
			`💔 Player took ${amount} damage! Health: ${this.currentHealth}/${this.maxHealth}`,
		);
		return true;
	}

	heal(amount) {
		this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
		this.updateHealthUI();
		console.log(
			`💚 Player healed ${amount}! Health: ${this.currentHealth}/${this.maxHealth}`,
		);
	}

	updateInvincibility(deltaTime) {
		if (this.isInvincible) {
			this.invincibilityTimer -= deltaTime * 1000; // Convert to ms

			// Flash effect during invincibility
			const flashRate = 0.1;
			const opacity = Math.sin(Date.now() * flashRate) * 0.3 + 0.7;
			this.mesh.traverse((child) => {
				if (child.material) {
					child.material.opacity = opacity;
					child.material.transparent = true;
				}
			});

			if (this.invincibilityTimer <= 0) {
				this.isInvincible = false;
				// Reset opacity
				this.mesh.traverse((child) => {
					if (child.material) {
						child.material.opacity = 1;
						child.material.transparent = false;
					}
				});
			}
		}
	}

	updateHealthUI() {
		const healthFill = document.getElementById("health-fill");
		if (healthFill) {
			const healthPercent = (this.currentHealth / this.maxHealth) * 100;
			healthFill.style.width = `${healthPercent}%`;
		}
	}

	handleDeath() {
		console.log("💀 Player died!");
		// For now, just respawn with full health
		setTimeout(() => {
			this.respawn();
		}, 2000);
	}

	respawn() {
		this.currentHealth = this.maxHealth;
		this.mesh.position.set(0, 0, 0);
		this.velocity.set(0, 0, 0);
		this.isInvincible = false;
		this.updateHealthUI();
		console.log("✨ Player respawned!");
	}

	// Get player's current position for other systems
	getPosition() {
		return this.mesh.position.clone();
	}

	// Get player's facing direction
	getFacingDirection() {
		const direction = new THREE.Vector3(0, 0, -1);
		direction.applyQuaternion(this.mesh.quaternion);
		return direction;
	}
}
