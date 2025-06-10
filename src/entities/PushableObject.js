import * as THREE from 'three';

export class PushableObject {
	constructor(scene, position, type, collisionSystem) {
		this.scene = scene;
		this.position = position;
		this.type = type;
		this.collisionSystem = collisionSystem;
		this.mesh = null;
		this.velocity = new THREE.Vector3(0, 0, 0);
		this.friction = 0.9;
		this.pushForce = 15;
		this.mass = 1;
		
		this.createMesh();
		this.setupCollision();
	}

	createMesh() {
		// Override in subclasses
		console.log(`📦 Pushable object created: ${this.type}`);
	}

	setupCollision() {
		if (this.mesh && this.collisionSystem) {
			// Add to collision system as a movable collider
			this.collider = this.collisionSystem.addCollider(
				this.mesh, 
				this.getCollisionSize(), 
				`pushable-${this.type}-${Math.random()}`
			);
		}
	}

	getCollisionSize() {
		// Override in subclasses
		return { width: 2, height: 2, depth: 2 };
	}

	update(deltaTime) {
		// Apply friction
		this.velocity.multiplyScalar(this.friction);
		
		// Apply velocity to position
		if (this.velocity.length() > 0.01) {
			const newPosition = this.mesh.position.clone();
			newPosition.add(this.velocity.clone().multiplyScalar(deltaTime));
			
			// Check collision before moving
			if (this.collisionSystem) {
				const collision = this.collisionSystem.checkCollision(newPosition, this.getCollisionSize());
				if (!collision.collision) {
					this.mesh.position.copy(newPosition);
				} else {
					// Stop if we hit something
					this.velocity.set(0, 0, 0);
				}
			} else {
				this.mesh.position.copy(newPosition);
			}
		}
	}

	push(direction, force = 1) {
		// Apply push force
		const pushVector = direction.clone().normalize();
		pushVector.multiplyScalar(this.pushForce * force / this.mass);
		this.velocity.add(pushVector);
		
		// Cap maximum velocity
		const maxVel = 10;
		if (this.velocity.length() > maxVel) {
			this.velocity.normalize().multiplyScalar(maxVel);
		}
		
		console.log(`🤏 Pushed ${this.type}`);
	}

	checkPlayerCollision(playerPosition, playerSize) {
		if (!this.mesh) return false;
		
		const distance = this.mesh.position.distanceTo(playerPosition);
		const collisionDistance = (playerSize.width + this.getCollisionSize().width) / 2;
		
		return distance < collisionDistance;
	}

	dispose() {
		if (this.mesh) {
			if (this.mesh.geometry) this.mesh.geometry.dispose();
			if (this.mesh.material) this.mesh.material.dispose();
			this.scene.remove(this.mesh);
		}
	}
}

export class PushableLog extends PushableObject {
	constructor(scene, position, collisionSystem) {
		super(scene, position, 'log', collisionSystem);
		this.mass = 2; // Heavier than default
	}

	createMesh() {
		// Create a fallen log
		const logGeometry = new THREE.CylinderGeometry(0.5, 0.6, 4);
		const logMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
		
		this.mesh = new THREE.Mesh(logGeometry, logMaterial);
		this.mesh.position.copy(this.position);
		this.mesh.position.y = 0.6;
		this.mesh.rotation.z = Math.PI / 2; // Lay it down
		this.mesh.rotation.y = Math.random() * Math.PI * 2;
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		
		this.scene.add(this.mesh);
	}

	getCollisionSize() {
		return { width: 4, height: 1.2, depth: 1.2 };
	}
}

export class PushableRock extends PushableObject {
	constructor(scene, position, collisionSystem) {
		super(scene, position, 'rock', collisionSystem);
		this.mass = 1.5;
	}

	createMesh() {
		// Create a round boulder
		const rockGeometry = new THREE.SphereGeometry(1, 8, 6);
		const rockMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x708090,
			flatShading: true 
		});
		
		this.mesh = new THREE.Mesh(rockGeometry, rockMaterial);
		this.mesh.position.copy(this.position);
		this.mesh.position.y = 1;
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		
		this.scene.add(this.mesh);
	}

	getCollisionSize() {
		return { width: 2, height: 2, depth: 2 };
	}
} 