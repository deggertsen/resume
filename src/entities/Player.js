import * as THREE from "three";
import { createPlayer, createSwordHitbox } from "./CharacterModel.js";

export class Player {
	constructor(collisionSystem = null) {
		this.mesh = null;
		this.velocity = new THREE.Vector3(0, 0, 0); // Explicitly set to zero
		this.speed = 15;
		this.acceleration = 50;
		this.friction = 15;
		this.collisionSystem = collisionSystem;
		this.size = { width: 6, height: 8, depth: 6 }; // Player collision box size

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
		// Create our awesome low-poly character
		this.mesh = createPlayer();
		this.mesh.position.set(0, 0, 0); // Start at origin
		
		// Create sword hitbox for future combat system
		this.swordHitbox = createSwordHitbox(this.mesh);
		
		console.log("🧙‍♂️ Low-poly player character created at position:", this.mesh.position);
	}

	update(deltaTime, inputManager) {
		this.handleMovement(deltaTime, inputManager);
		this.updateInvincibility(deltaTime);

		// Clear input frame states
		inputManager.clearFrameStates();
	}

	handleMovement(deltaTime, inputManager) {
		const moveInput = inputManager.getMovementVector();
		
		// Move when there's input
		if (moveInput.x !== 0 || moveInput.z !== 0) {
			const moveSpeed = 20; // units per second
			const moveDistance = moveSpeed * deltaTime;
			
			// Calculate potential new position
			const newPosition = this.mesh.position.clone();
			newPosition.x += moveInput.x * moveDistance;
			newPosition.z += moveInput.z * moveDistance;
			
			// Check collision if collision system is available
			if (this.collisionSystem) {
				const collision = this.collisionSystem.checkCollision(newPosition, this.size);
				
				if (!collision.collision) {
					// Safe to move
					this.mesh.position.copy(newPosition);
				} else {
					// Try moving on just one axis at a time (sliding)
					const xOnlyPosition = this.mesh.position.clone();
					xOnlyPosition.x += moveInput.x * moveDistance;
					
					const zOnlyPosition = this.mesh.position.clone();
					zOnlyPosition.z += moveInput.z * moveDistance;
					
					const xCollision = this.collisionSystem.checkCollision(xOnlyPosition, this.size);
					const zCollision = this.collisionSystem.checkCollision(zOnlyPosition, this.size);
					
					// Allow movement on axes that don't collide
					if (!xCollision.collision) {
						this.mesh.position.x = xOnlyPosition.x;
					}
					if (!zCollision.collision) {
						this.mesh.position.z = zOnlyPosition.z;
					}
				}
			} else {
				// No collision system, move freely
				this.mesh.position.copy(newPosition);
			}
			
			// Face movement direction
			const targetRotation = Math.atan2(moveInput.x, moveInput.z);
			this.mesh.rotation.y = targetRotation;
		}
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
