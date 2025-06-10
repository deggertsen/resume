import * as THREE from "three";

export class Player {
	constructor() {
		this.mesh = null;
		this.velocity = new THREE.Vector3();
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
		// For now, create a simple capsule-like character
		const group = new THREE.Group();

		// Body (cylinder)
		const bodyGeometry = new THREE.CylinderGeometry(0.8, 1, 2.5, 8);
		const bodyMaterial = new THREE.MeshLambertMaterial({
			color: 0x4a9eff, // Blue tunic
			flatShading: true,
		});
		const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
		body.position.y = 1.25;
		body.castShadow = true;
		group.add(body);

		// Head (sphere)
		const headGeometry = new THREE.SphereGeometry(0.6, 8, 6);
		const headMaterial = new THREE.MeshLambertMaterial({
			color: 0xffdbac, // Skin tone
			flatShading: true,
		});
		const head = new THREE.Mesh(headGeometry, headMaterial);
		head.position.y = 3;
		head.castShadow = true;
		group.add(head);

		// Simple sword (will be replaced with proper model later)
		const swordGeometry = new THREE.BoxGeometry(0.1, 0.1, 1.5);
		const swordMaterial = new THREE.MeshLambertMaterial({
			color: 0xc0c0c0, // Silver
			flatShading: true,
		});
		const sword = new THREE.Mesh(swordGeometry, swordMaterial);
		sword.position.set(1.2, 1.5, 0);
		sword.castShadow = true;
		group.add(sword);

		// Store sword reference for future attack animations
		this.sword = sword;

		this.mesh = group;
		this.mesh.position.set(0, 0, 0);
	}

	update(deltaTime, inputManager) {
		this.handleMovement(deltaTime, inputManager);
		this.updateInvincibility(deltaTime);

		// Clear input frame states
		inputManager.clearFrameStates();
	}

	handleMovement(deltaTime, inputManager) {
		const moveInput = inputManager.getMovementVector();
		const moveVector = new THREE.Vector3(moveInput.x, 0, moveInput.z);

		// Normalize diagonal movement
		if (moveVector.length() > 0) {
			moveVector.normalize();

			// Apply acceleration
			this.velocity.addScaledVector(moveVector, this.acceleration * deltaTime);

			// Limit max speed
			if (this.velocity.length() > this.speed) {
				this.velocity.setLength(this.speed);
			}

			// Face movement direction
			if (moveVector.length() > 0.1) {
				const targetRotation = Math.atan2(moveVector.x, moveVector.z);
				this.mesh.rotation.y = THREE.MathUtils.lerp(
					this.mesh.rotation.y,
					targetRotation,
					8 * deltaTime,
				);
			}
		} else {
			// Apply friction when not moving
			this.velocity.multiplyScalar((1 - this.friction) ** deltaTime);
		}

		// Apply movement
		this.mesh.position.addScaledVector(this.velocity, deltaTime);

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
