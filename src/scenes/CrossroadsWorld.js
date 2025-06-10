import * as THREE from 'three';

export class CrossroadsWorld {
	constructor(scene, collisionSystem) {
		this.scene = scene;
		this.collisionSystem = collisionSystem;
		this.worldObjects = [];
		this.areaTransitions = [];
		
		this.createTerrain();
		this.createSignposts();
		this.createWorldBoundaries();
		this.createAreaTransitions();
		
		console.log("🌍 Crossroads world created!");
	}

	createTerrain() {
		// Main crossroads ground - larger circular area
		const groundGeometry = new THREE.CircleGeometry(60, 32);
		const groundMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x4a7c59, // Forest green
			side: THREE.DoubleSide 
		});
		
		const ground = new THREE.Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
		ground.position.y = -0.1; // Slightly below player level
		ground.receiveShadow = true;
		
		this.scene.add(ground);
		this.worldObjects.push(ground);

		// Four paths extending from the center
		this.createPath(0, 0, 30, 8, 0); // North path
		this.createPath(0, 0, -30, 8, Math.PI); // South path  
		this.createPath(30, 0, 0, 8, Math.PI / 2); // East path
		this.createPath(-30, 0, 0, 8, -Math.PI / 2); // West path

		console.log("🌱 Terrain created");
	}

	createPath(x, y, z, width, rotation) {
		const pathGeometry = new THREE.PlaneGeometry(width, 40);
		const pathMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x8B7355, // Dirt brown
			side: THREE.DoubleSide 
		});
		
		const path = new THREE.Mesh(pathGeometry, pathMaterial);
		path.rotation.x = -Math.PI / 2;
		path.rotation.z = rotation;
		path.position.set(x, y - 0.05, z);
		path.receiveShadow = true;
		
		this.scene.add(path);
		this.worldObjects.push(path);
	}

	createSignposts() {
		const signposts = [
			{ 
				position: { x: 0, y: 0, z: 45 }, 
				text: "About Me\nMeadow", 
				color: 0x90EE90,
				area: "about" 
			},
			{ 
				position: { x: 45, y: 0, z: 0 }, 
				text: "Experience\nVillage", 
				color: 0x8B4513,
				area: "experience" 
			},
			{ 
				position: { x: 0, y: 0, z: -45 }, 
				text: "Projects\nPortal", 
				color: 0x9932CC,
				area: "projects" 
			},
			{ 
				position: { x: -45, y: 0, z: 0 }, 
				text: "Danger\nDungeon", 
				color: 0x8B0000,
				area: "danger" 
			}
		];

		for (const signpost of signposts) {
			this.createSignpost(signpost.position, signpost.text, signpost.color, signpost.area);
		}
	}

	createSignpost(position, text, color, area) {
		// Signpost pole
		const poleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8);
		const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
		const pole = new THREE.Mesh(poleGeometry, poleMaterial);
		pole.position.set(position.x, position.y + 4, position.z);
		pole.castShadow = true;
		
		// Sign board
		const signGeometry = new THREE.BoxGeometry(8, 3, 0.5);
		const signMaterial = new THREE.MeshLambertMaterial({ color: color });
		const sign = new THREE.Mesh(signGeometry, signMaterial);
		sign.position.set(position.x, position.y + 6, position.z);
		sign.castShadow = true;
		
		// Add collider for the signpost
		this.collisionSystem.addCollider(pole, { width: 2, height: 8, depth: 2 }, `signpost-${area}`);
		
		this.scene.add(pole);
		this.scene.add(sign);
		this.worldObjects.push(pole, sign);
		
		console.log(`📋 Created signpost for ${area} area`);
	}

	createWorldBoundaries() {
		const worldSize = 80;
		const wallHeight = 20;
		const wallThickness = 2;
		
		// Create invisible boundaries at world edges
		this.collisionSystem.addBoundary(
			{ x: -worldSize, y: 0, z: -worldSize },
			{ x: -worldSize + wallThickness, y: wallHeight, z: worldSize },
			'west-wall'
		);
		
		this.collisionSystem.addBoundary(
			{ x: worldSize - wallThickness, y: 0, z: -worldSize },
			{ x: worldSize, y: wallHeight, z: worldSize },
			'east-wall'
		);
		
		this.collisionSystem.addBoundary(
			{ x: -worldSize, y: 0, z: -worldSize },
			{ x: worldSize, y: wallHeight, z: -worldSize + wallThickness },
			'south-wall'
		);
		
		this.collisionSystem.addBoundary(
			{ x: -worldSize, y: 0, z: worldSize - wallThickness },
			{ x: worldSize, y: wallHeight, z: worldSize },
			'north-wall'
		);
		
		console.log("🚧 World boundaries created");
	}

	createAreaTransitions() {
		const transitions = [
			{ 
				position: { x: 0, z: 55 }, 
				size: { width: 12, depth: 8 },
				area: "about",
				name: "About Me Meadow"
			},
			{ 
				position: { x: 55, z: 0 }, 
				size: { width: 8, depth: 12 },
				area: "experience",
				name: "Experience Village"
			},
			{ 
				position: { x: 0, z: -55 }, 
				size: { width: 12, depth: 8 },
				area: "projects",
				name: "Projects Portal"
			},
			{ 
				position: { x: -55, z: 0 }, 
				size: { width: 8, depth: 12 },
				area: "danger",
				name: "Danger Dungeon"
			}
		];

		for (const transition of transitions) {
			// Create visual indicators for transition zones
			const geometry = new THREE.PlaneGeometry(transition.size.width, transition.size.depth);
			const material = new THREE.MeshBasicMaterial({ 
				color: 0xFFFFFF,
				transparent: true,
				opacity: 0.2,
				side: THREE.DoubleSide
			});
			
			const transitionZone = new THREE.Mesh(geometry, material);
			transitionZone.rotation.x = -Math.PI / 2;
			transitionZone.position.set(transition.position.x, 0.1, transition.position.z);
			
			this.scene.add(transitionZone);
			this.worldObjects.push(transitionZone);
			
			// Store transition data
			this.areaTransitions.push({
				position: transition.position,
				size: transition.size,
				area: transition.area,
				name: transition.name,
				mesh: transitionZone
			});
		}
		
		console.log("🚪 Area transitions created");
	}

	checkAreaTransition(playerPosition) {
		for (const transition of this.areaTransitions) {
			const distance = Math.sqrt(
				(playerPosition.x - transition.position.x) ** 2 +
				(playerPosition.z - transition.position.z) ** 2
			);
			
			// Check if player is within transition zone
			const maxDistance = Math.max(transition.size.width, transition.size.depth) / 2;
			if (distance < maxDistance) {
				return {
					area: transition.area,
					name: transition.name,
					distance: distance
				};
			}
		}
		return null;
	}

	getWorldObjects() {
		return this.worldObjects;
	}

	dispose() {
		for (const obj of this.worldObjects) {
			if (obj.geometry) obj.geometry.dispose();
			if (obj.material) obj.material.dispose();
			this.scene.remove(obj);
		}
		this.worldObjects = [];
		console.log("🧹 Crossroads world disposed");
	}
} 