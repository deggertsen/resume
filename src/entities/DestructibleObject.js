import * as THREE from 'three';

export class DestructibleObject {
	constructor(scene, position, type = 'grass', collisionSystem = null) {
		this.scene = scene;
		this.position = position;
		this.type = type;
		this.mesh = null;
		this.isDestroyed = false;
		this.boundingBox = null;
		this.collisionSystem = collisionSystem;
		this.collider = null;
		
		this.createMesh();
		this.setupBoundingBox();
		this.setupCollision();
	}

	createMesh() {
		// Override in subclasses
		console.log("🌿 Base destructible object created");
	}

	setupBoundingBox() {
		if (this.mesh) {
			this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
		}
	}

	setupCollision() {
		if (this.mesh && this.collisionSystem) {
			const size = this.getCollisionSize();
			if (size.width > 0) { // Only add collision for objects that should have it
				this.collider = this.collisionSystem.addCollider(
					this.mesh, 
					size, 
					`destructible-${this.type}-${Math.random()}`
				);
			}
		}
	}

	getCollisionSize() {
		// Override in subclasses - return {width: 0, height: 0, depth: 0} for no collision
		return { width: 2, height: 2, depth: 2 };
	}

	update(deltaTime) {
		// Override for any animated destructibles
	}

	checkSwordHit(swordPosition, swordRadius = 3) {
		if (this.isDestroyed || !this.boundingBox) return false;

		// More generous hit detection - check distance to object
		const distance = this.mesh.position.distanceTo(swordPosition);
		
		// Different hit ranges for different object types
		let hitRange = swordRadius;
		if (this.type === 'grass') {
			hitRange = swordRadius + 2; // Grass is easier to hit
		} else if (this.type === 'crate') {
			hitRange = swordRadius + 1; // Crates are a bit easier too
		}
		
		return distance < hitRange;
	}

	destroy() {
		if (this.isDestroyed) return;

		this.isDestroyed = true;
		this.createDestructionEffect();
		
		// Remove collision first
		if (this.collider && this.collisionSystem) {
			this.collisionSystem.removeCollider(this.collider);
			this.collider = null;
		}
		
		// Remove from scene
		if (this.mesh) {
			this.scene.remove(this.mesh);
		}
		
		console.log(`💥 ${this.type} destroyed!`);
	}

	createDestructionEffect() {
		// Create simple particle effect
		const particleCount = 8;
		
		for (let i = 0; i < particleCount; i++) {
			const particle = this.createParticle();
			this.scene.add(particle);
			
			// Animate particle
			this.animateParticle(particle);
		}
	}

	createParticle() {
		const geometry = new THREE.SphereGeometry(0.1, 6, 4);
		const material = new THREE.MeshBasicMaterial({ 
			color: this.getParticleColor(),
			transparent: true,
			opacity: 0.8
		});
		
		const particle = new THREE.Mesh(geometry, material);
		particle.position.copy(this.mesh.position);
		particle.position.y += Math.random() * 2;
		
		return particle;
	}

	animateParticle(particle) {
		const startPos = particle.position.clone();
		const velocity = new THREE.Vector3(
			(Math.random() - 0.5) * 8,
			Math.random() * 6 + 2,
			(Math.random() - 0.5) * 8
		);
		
		const animate = () => {
			velocity.y -= 20 * 0.016; // Gravity
			particle.position.add(velocity.clone().multiplyScalar(0.016));
			
			// Fade out
			particle.material.opacity -= 0.02;
			
			if (particle.material.opacity <= 0 || particle.position.y < -5) {
				this.scene.remove(particle);
				particle.geometry.dispose();
				particle.material.dispose();
			} else {
				requestAnimationFrame(animate);
			}
		};
		
		animate();
	}

	getParticleColor() {
		// Override in subclasses
		return 0x00ff00;
	}

	dispose() {
		if (this.mesh) {
			if (this.mesh.geometry) this.mesh.geometry.dispose();
			if (this.mesh.material) this.mesh.material.dispose();
			this.scene.remove(this.mesh);
		}
	}
}

export class GrassPatch extends DestructibleObject {
	constructor(scene, position, collisionSystem = null) {
		super(scene, position, 'grass', collisionSystem);
	}

	getCollisionSize() {
		// Grass has no collision - you can walk through it
		return { width: 0, height: 0, depth: 0 };
	}

	createMesh() {
		// Create multiple grass blades - more and taller!
		const grassGroup = new THREE.Group();
		
		// Create a cluster of 8-12 grass blades
		const bladeCount = 8 + Math.floor(Math.random() * 5);
		
		for (let i = 0; i < bladeCount; i++) {
			const blade = this.createGrassBlade();
			blade.position.set(
				(Math.random() - 0.5) * 3, // Wider spread
				0,
				(Math.random() - 0.5) * 3
			);
			blade.rotation.y = Math.random() * Math.PI * 2;
			// Add some random tilt for natural look
			blade.rotation.z = (Math.random() - 0.5) * 0.3;
			grassGroup.add(blade);
		}
		
		grassGroup.position.copy(this.position);
		this.scene.add(grassGroup);
		this.mesh = grassGroup;
	}

	createGrassBlade() {
		// Make grass tall and majestic!
		const height = 5 + Math.random() * 3; // 5-8 units tall - much more impressive!
		const geometry = new THREE.ConeGeometry(0.2, height, 4); // Slightly thicker too
		const material = new THREE.MeshLambertMaterial({ 
			color: 0x4a7c59,
			side: THREE.DoubleSide 
		});
		
		const blade = new THREE.Mesh(geometry, material);
		blade.position.y = height / 2; // Half height to sit on ground
		blade.castShadow = true;
		
		return blade;
	}

	getParticleColor() {
		return 0x4a7c59; // Green grass particles
	}
}

export class WoodenCrate extends DestructibleObject {
	constructor(scene, position, collisionSystem = null) {
		super(scene, position, 'crate', collisionSystem);
	}

	getCollisionSize() {
		// Crates are solid - you can't walk through them!
		return { width: 3, height: 3, depth: 3 };
	}

	createMesh() {
		const geometry = new THREE.BoxGeometry(3, 3, 3);
		const material = new THREE.MeshLambertMaterial({ 
			color: 0x8b4513 // Brown wood color
		});
		
		const crate = new THREE.Mesh(geometry, material);
		crate.position.copy(this.position);
		crate.position.y = 1.5; // Half height to sit on ground
		crate.castShadow = true;
		crate.receiveShadow = true;
		
		this.scene.add(crate);
		this.mesh = crate;
	}

	getParticleColor() {
		return 0x8b4513; // Brown wood particles
	}
} 