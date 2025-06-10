import * as THREE from "three";
import { createPlayer, createSwordHitbox } from "./CharacterModel.js";

export class Player {
	constructor(collisionSystem = null, world = null) {
		this.mesh = null;
		this.velocity = new THREE.Vector3(0, 0, 0); // Explicitly set to zero
		this.speed = 15;
		this.acceleration = 50;
		this.friction = 15;
		this.collisionSystem = collisionSystem;
		this.world = world; // Reference to world for destructible objects
		this.size = { width: 6, height: 8, depth: 6 }; // Player collision box size

		// Player stats
		this.maxHealth = 100;
		this.currentHealth = 100;
		this.isInvincible = false;
		this.invincibilityTimer = 0;
		this.invincibilityDuration = 1500; // 1.5 seconds in ms

		// Attack system
		this.isAttacking = false;
		this.attackTimer = 0;
		this.attackDuration = 500; // Attack animation duration in ms
		this.attackCooldown = 800; // Time between attacks in ms
		this.lastAttackTime = 0;
	}

	async init() {
		this.createMesh();
		this.updateHealthUI();
		console.log("🧙‍♂️ Player initialized");
	}

	createMesh() {
		// Create our awesome low-poly character
		this.mesh = createPlayer();
		this.mesh.position.set(0, 0, -10); // Start slightly south of center signpost
		
		// Create sword hitbox for future combat system
		this.swordHitbox = createSwordHitbox(this.mesh);
		
		// Get reference to the sword for animation
		this.sword = this.mesh.getObjectByName('sword');
		this.swordRestPosition = this.sword.position.clone();
		this.swordRestRotation = this.sword.rotation.clone();
		
		console.log("🧙‍♂️ Low-poly player character created at position:", this.mesh.position);
	}

	update(deltaTime, inputManager) {
		this.handleMovement(deltaTime, inputManager);
		this.handleAttack(deltaTime, inputManager);
		this.updateInvincibility(deltaTime);
		this.updateAttackAnimation(deltaTime);

		// Clear input frame states
		inputManager.clearFrameStates();
	}

	handleMovement(deltaTime, inputManager) {
		const moveInput = inputManager.getMovementVector();
		
		// Move when there's input
		if (moveInput.x !== 0 || moveInput.z !== 0) {
			const moveSpeed = 20; // units per second
			const moveDistance = moveSpeed * deltaTime;
			const moveVector = new THREE.Vector3(moveInput.x, 0, moveInput.z);
			
			// Calculate potential new position
			const newPosition = this.mesh.position.clone();
			newPosition.x += moveInput.x * moveDistance;
			newPosition.z += moveInput.z * moveDistance;
			
			// Check collision with pushable objects first
			let canMove = true;
			const pushableObjects = this.world ? this.world.pushableObjects : [];
			
			for (const pushable of pushableObjects) {
				if (pushable.checkPlayerCollision(newPosition, this.size)) {
					// Try to push the object
					pushable.push(moveVector, 1);
					
					// Check if object can move (not blocked by static objects)
					const futureObjectPos = pushable.mesh.position.clone();
					futureObjectPos.add(moveVector.clone().multiplyScalar(3));
					const objectCollision = this.collisionSystem.checkCollision(futureObjectPos, pushable.getCollisionSize());
					
					if (objectCollision.collision) {
						// Object is blocked, player can't move through it
						canMove = false;
						break;
					}
					// If object can move, player can push through
				}
			}
			
			// Check collision with static objects if collision system is available
			if (canMove && this.collisionSystem) {
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
			} else if (canMove) {
				// No collision system or no static collision, move freely
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
		const direction = new THREE.Vector3(0, 0, 1); // Changed to positive Z (forward)
		direction.applyQuaternion(this.mesh.quaternion);
		return direction;
	}

	handleAttack(deltaTime, inputManager) {
		const currentTime = Date.now();
		
		// Check if player pressed attack and can attack
		if (inputManager.isAttackPressed() && !this.isAttacking && 
			(currentTime - this.lastAttackTime) > this.attackCooldown) {
			
			this.startAttack();
			this.lastAttackTime = currentTime;
		}
	}

	startAttack() {
		this.isAttacking = true;
		this.attackTimer = 0;
		
		console.log("⚔️ Player attacks!");
		
		// Check for destructible objects in range
		this.checkDestructibleHits();
		
		// TODO: Add damage dealing to enemies in range
		// TODO: Add screen shake effect
	}

	checkDestructibleHits() {
		if (!this.world) return;
		
		const destructibles = this.world.getDestructibles();
		const playerPosition = this.mesh.position;
		const facingDirection = this.getFacingDirection();
		
		const attackRange = 8; // Sword reach distance
		const attackAngle = Math.PI / 3; // 60-degree cone (30 degrees each side) - back to normal
		
		for (const destructible of destructibles) {
			// Check if target is within range first
			const distance = playerPosition.distanceTo(destructible.mesh.position);
			if (distance > attackRange) continue;
			
			// Calculate direction from player to target
			const directionToTarget = new THREE.Vector3()
				.subVectors(destructible.mesh.position, playerPosition);
			
			// Only check Y=0 plane for 2D-style cone detection
			directionToTarget.y = 0;
			directionToTarget.normalize();
			
			// Check if target is in front of player (cone detection)
			const dotProduct = facingDirection.dot(directionToTarget);
			const angleToTarget = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
			
			// Only hit if target is within the attack cone
			if (angleToTarget <= attackAngle / 2) {
				destructible.destroy();
				console.log(`💥 Destroyed ${destructible.type} with sword swing! (${(angleToTarget * 180 / Math.PI).toFixed(1)}° from center)`);
			}
		}
	}

	updateAttackAnimation(deltaTime) {
		if (this.isAttacking && this.sword) {
			this.attackTimer += deltaTime * 1000; // Convert to ms
			
			// Calculate attack animation progress (0 to 1)
			const progress = Math.min(this.attackTimer / this.attackDuration, 1);
			
			// Smooth attack curve - slow start, fast middle, slow end
			const easeProgress = 0.5 * (1 - Math.cos(progress * Math.PI));
			
			// Sword swing animation phases
			if (progress < 0.3) {
				// Phase 1: Draw sword from back to ready position
				const drawProgress = progress / 0.3;
				this.animateSwordDraw(drawProgress);
			} else if (progress < 0.8) {
				// Phase 2: Swing sword forward
				const swingProgress = (progress - 0.3) / 0.5;
				this.animateSwordSwing(swingProgress);
			} else {
				// Phase 3: Return sword to back
				const returnProgress = (progress - 0.8) / 0.2;
				this.animateSwordReturn(returnProgress);
			}
			
			// Add sword glow effect during attack
			this.updateSwordGlow(easeProgress);
			
			// Character body animation - slight lean into the attack
			const bodyLean = Math.sin(easeProgress * Math.PI) * 0.1;
			this.mesh.rotation.z = bodyLean;
			
			// End attack when animation completes
			if (progress >= 1) {
				this.endAttack();
			}
		}
	}

	animateSwordDraw(progress) {
		// Move sword from back to right hand position
		const startPos = this.swordRestPosition;
		const endPos = new THREE.Vector3(2, 1, 0.5); // Right hand position
		
		this.sword.position.lerpVectors(startPos, endPos, progress);
		
		// Rotate sword to wielding position
		const startRot = this.swordRestRotation;
		const endRot = new THREE.Euler(0, 0, Math.PI / 2); // Horizontal ready position
		
		this.sword.rotation.x = THREE.MathUtils.lerp(startRot.x, endRot.x, progress);
		this.sword.rotation.y = THREE.MathUtils.lerp(startRot.y, endRot.y, progress);
		this.sword.rotation.z = THREE.MathUtils.lerp(startRot.z, endRot.z, progress);
	}

	animateSwordSwing(progress) {
		// Swing sword in an arc from right to left
		const swingAngle = Math.PI * progress; // 180-degree swing
		
		// Position sword in an arc
		const radius = 3;
		const angle = -Math.PI / 4 + swingAngle; // Start from right, swing left
		
		this.sword.position.set(
			Math.cos(angle) * radius,
			1 + Math.sin(angle * 0.5) * 0.5, // Slight vertical arc
			Math.sin(angle) * radius
		);
		
		// Rotate sword to follow the swing
		this.sword.rotation.set(0, angle, Math.PI / 2);
	}

	animateSwordReturn(progress) {
		// Return sword to back position
		const currentPos = this.sword.position;
		const currentRot = this.sword.rotation;
		
		this.sword.position.lerpVectors(currentPos, this.swordRestPosition, progress);
		
		this.sword.rotation.x = THREE.MathUtils.lerp(currentRot.x, this.swordRestRotation.x, progress);
		this.sword.rotation.y = THREE.MathUtils.lerp(currentRot.y, this.swordRestRotation.y, progress);
		this.sword.rotation.z = THREE.MathUtils.lerp(currentRot.z, this.swordRestRotation.z, progress);
	}

	updateSwordGlow(progress) {
		// Make sword glow during attack
		const glowIntensity = Math.sin(progress * Math.PI);
		
		// Find the sword blade and update its emissive property
		this.sword.traverse((child) => {
			if (child.material && child.geometry && child.geometry.type === 'BoxGeometry') {
				// This is likely the blade
				child.material.emissive.setScalar(glowIntensity * 0.3);
			}
		});
	}

	endAttack() {
		this.isAttacking = false;
		this.attackTimer = 0;
		
		// Reset character body rotation
		this.mesh.rotation.z = 0;
		
		// Reset sword to rest position
		if (this.sword) {
			this.sword.position.copy(this.swordRestPosition);
			this.sword.rotation.copy(this.swordRestRotation);
			
			// Remove sword glow
			this.sword.traverse((child) => {
				if (child.material) {
					child.material.emissive.setScalar(0);
				}
			});
		}
		
		console.log("✨ Attack finished!");
	}
}
