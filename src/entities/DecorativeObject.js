import * as THREE from 'three';

export class DecorativeObject {
	constructor(scene, position, type, collisionSystem) {
		this.scene = scene;
		this.position = position;
		this.type = type;
		this.collisionSystem = collisionSystem;
		this.mesh = null;
		
		this.createMesh();
		this.setupCollision();
	}

	createMesh() {
		// Override in subclasses
		console.log(`🌳 Decorative object created: ${this.type}`);
	}

	setupCollision() {
		if (this.mesh && this.collisionSystem) {
			// Add to collision system as immovable
			this.collider = this.collisionSystem.addCollider(
				this.mesh, 
				this.getCollisionSize(), 
				`decorative-${this.type}-${Math.random()}`
			);
		}
	}

	getCollisionSize() {
		return { width: 2, height: 4, depth: 2 };
	}

	dispose() {
		if (this.mesh) {
			if (this.mesh.geometry) this.mesh.geometry.dispose();
			if (this.mesh.material) this.mesh.material.dispose();
			this.scene.remove(this.mesh);
		}
	}
}

export class Tree extends DecorativeObject {
	constructor(scene, position, collisionSystem, variant = 1) {
		super(scene, position, 'tree', collisionSystem);
		this.variant = variant;
	}

	createMesh() {
		this.mesh = new THREE.Group();
		
		// Tree trunk
		const trunkHeight = 6 + Math.random() * 3;
		const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.6, trunkHeight, 8);
		const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
		const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
		trunk.position.y = trunkHeight / 2;
		trunk.castShadow = true;
		trunk.receiveShadow = true;
		this.mesh.add(trunk);
		
		// Tree canopy
		const canopyGeometry = new THREE.SphereGeometry(3 + Math.random() * 2, 8, 6);
		const canopyColor = this.variant === 1 ? 0x228b22 : 0x32cd32;
		const canopyMaterial = new THREE.MeshLambertMaterial({ 
			color: canopyColor,
			flatShading: true 
		});
		const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
		canopy.position.y = trunkHeight + 1;
		canopy.scale.y = 0.8; // Slightly flatten
		canopy.castShadow = true;
		canopy.receiveShadow = true;
		this.mesh.add(canopy);
		
		// Position and add to scene
		this.mesh.position.copy(this.position);
		this.scene.add(this.mesh);
	}

	getCollisionSize() {
		return { width: 2, height: 8, depth: 2 };
	}
}

export class LargeBoulder extends DecorativeObject {
	constructor(scene, position, collisionSystem) {
		super(scene, position, 'boulder', collisionSystem);
	}

	createMesh() {
		// Create a large, imposing boulder
		const boulderGeometry = new THREE.DodecahedronGeometry(3);
		const boulderMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x696969,
			flatShading: true 
		});
		
		this.mesh = new THREE.Mesh(boulderGeometry, boulderMaterial);
		this.mesh.position.copy(this.position);
		this.mesh.position.y = 2;
		this.mesh.rotation.x = Math.random() * Math.PI;
		this.mesh.rotation.z = Math.random() * Math.PI;
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		
		this.scene.add(this.mesh);
	}

	getCollisionSize() {
		return { width: 4, height: 4, depth: 4 };
	}
}

export class Bush extends DecorativeObject {
	constructor(scene, position, collisionSystem) {
		super(scene, position, 'bush', collisionSystem);
	}

	createMesh() {
		// Create a cluster of bushes
		this.mesh = new THREE.Group();
		
		const bushCount = 2 + Math.floor(Math.random() * 3);
		for (let i = 0; i < bushCount; i++) {
			const bushGeometry = new THREE.SphereGeometry(0.8 + Math.random() * 0.5, 6, 4);
			const bushMaterial = new THREE.MeshLambertMaterial({ 
				color: 0x2e7d32,
				flatShading: true 
			});
			
			const bush = new THREE.Mesh(bushGeometry, bushMaterial);
			bush.position.set(
				(Math.random() - 0.5) * 2,
				0.5,
				(Math.random() - 0.5) * 2
			);
			bush.scale.y = 0.6; // Flatten slightly
			bush.castShadow = true;
			bush.receiveShadow = true;
			
			this.mesh.add(bush);
		}
		
		this.mesh.position.copy(this.position);
		this.scene.add(this.mesh);
	}

	getCollisionSize() {
		return { width: 2.5, height: 1, depth: 2.5 };
	}
}

export class FlowerPatch extends DecorativeObject {
	constructor(scene, position, collisionSystem) {
		super(scene, position, 'flowers', collisionSystem);
	}

	createMesh() {
		// Create a patch of small flowers (decorative, no collision)
		this.mesh = new THREE.Group();
		
		const colors = [0xff69b4, 0xffd700, 0xff6347, 0x9370db, 0x00ced1];
		const flowerCount = 5 + Math.floor(Math.random() * 8);
		
		for (let i = 0; i < flowerCount; i++) {
			// Small flower head
			const flowerGeometry = new THREE.SphereGeometry(0.15, 6, 4);
			const flowerMaterial = new THREE.MeshBasicMaterial({ 
				color: colors[Math.floor(Math.random() * colors.length)]
			});
			
			const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
			flower.position.set(
				(Math.random() - 0.5) * 4,
				0.2,
				(Math.random() - 0.5) * 4
			);
			
			this.mesh.add(flower);
		}
		
		this.mesh.position.copy(this.position);
		this.scene.add(this.mesh);
	}

	setupCollision() {
		// Flower patches don't have collision - purely decorative
	}

	getCollisionSize() {
		return { width: 0, height: 0, depth: 0 };
	}
} 