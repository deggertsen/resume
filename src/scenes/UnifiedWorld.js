import * as THREE from 'three';
import { GrassPatch, WoodenCrate } from '../entities/DestructibleObject.js';
import { InfoFlower, InfoRock, InfoCrystal } from '../entities/InteractiveElement.js';
import { PushableLog, PushableRock } from '../entities/PushableObject.js';
import { Tree, LargeBoulder, Bush, FlowerPatch } from '../entities/DecorativeObject.js';

export class UnifiedWorld {
	constructor(scene, collisionSystem) {
		this.scene = scene;
		this.collisionSystem = collisionSystem;
		this.worldObjects = [];
		this.areas = [];
		this.destructibles = [];
		this.interactiveElements = [];
		this.pushableObjects = [];
		this.decorativeObjects = [];
		
		this.createMainTerrain();
		this.createCrossroadsHub();
		this.createAboutMeMeadow();
		this.createExperienceVillage();
		this.createProjectsPortalArea();
		this.createDungeonEntrance();
		this.createWorldBoundaries();
		this.setupAreaZones();
		this.createDestructibles();
		this.createPushableObjects();
		this.createDecorativeObjects();
		this.createInteractiveElements();
		
		console.log("🌍 Unified world created with all areas!");
	}

	createMainTerrain() {
		// Large base terrain covering the entire world
		const terrainGeometry = new THREE.PlaneGeometry(400, 400);
		const terrainMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x4a7c59, // Forest green base
			side: THREE.DoubleSide 
		});
		
		const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
		terrain.rotation.x = -Math.PI / 2;
		terrain.position.y = -0.1;
		terrain.receiveShadow = true;
		
		this.scene.add(terrain);
		this.worldObjects.push(terrain);
		console.log("🌱 Main terrain created");
	}

	createCrossroadsHub() {
		// Central crossroads (our starting point)
		const hubGeometry = new THREE.CircleGeometry(30, 32);
		const hubMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x6b8e5a, // Slightly different green
			side: THREE.DoubleSide 
		});
		
		const hub = new THREE.Mesh(hubGeometry, hubMaterial);
		hub.rotation.x = -Math.PI / 2;
		hub.position.y = 0.01; // Slightly above base terrain
		hub.receiveShadow = true;
		
		this.scene.add(hub);
		this.worldObjects.push(hub);

		// Four paths extending from center
		this.createPath(0, 0, 50, 12, 0, 'about'); // North to About Me
		this.createPath(0, 0, -50, 12, Math.PI, 'projects'); // South to Projects  
		this.createPath(50, 0, 0, 12, Math.PI / 2, 'experience'); // East to Experience
		this.createPath(-50, 0, 0, 12, -Math.PI / 2, 'danger'); // West to Danger

		// Central signpost
		this.createSignpost({ x: 0, y: 0, z: 0 }, "Portfolio\nCrossroads", 0xFFD700, "hub");
		
		console.log("🏠 Crossroads hub created");
	}

	createAboutMeMeadow() {
		// Bright, natural area to the north
		const meadowGeometry = new THREE.CircleGeometry(50, 32);
		const meadowMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x90EE90, // Light green
			side: THREE.DoubleSide 
		});
		
		const meadow = new THREE.Mesh(meadowGeometry, meadowMaterial);
		meadow.rotation.x = -Math.PI / 2;
		meadow.position.set(0, 0.05, 100);
		meadow.receiveShadow = true;
		
		this.scene.add(meadow);
		this.worldObjects.push(meadow);

		// Enhanced meadow will get decorations from dedicated methods
		this.createSignpost({ x: 0, y: 0, z: 80 }, "About Me\nMeadow", 0x90EE90, "about");
		
		console.log("🌸 About Me Meadow created");
	}

	createExperienceVillage() {
		// Stone/cobblestone area to the east
		const villageGeometry = new THREE.CircleGeometry(45, 32);
		const villageMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x8B7355, // Brown cobblestone
			side: THREE.DoubleSide 
		});
		
		const village = new THREE.Mesh(villageGeometry, villageMaterial);
		village.rotation.x = -Math.PI / 2;
		village.position.set(100, 0.05, 0);
		village.receiveShadow = true;
		
		this.scene.add(village);
		this.worldObjects.push(village);

		// Add building placeholders
		this.createBuildingPlaceholders(100, 0);
		this.createSignpost({ x: 80, y: 0, z: 0 }, "Experience\nVillage", 0x8B4513, "experience");
		
		console.log("🏘️ Experience Village created");
	}

	createProjectsPortalArea() {
		// Mystical purple area to the south
		const portalGeometry = new THREE.CircleGeometry(40, 32);
		const portalMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x663399, // Purple
			side: THREE.DoubleSide 
		});
		
		const portalArea = new THREE.Mesh(portalGeometry, portalMaterial);
		portalArea.rotation.x = -Math.PI / 2;
		portalArea.position.set(0, 0.05, -100);
		portalArea.receiveShadow = true;
		
		this.scene.add(portalArea);
		this.worldObjects.push(portalArea);

		// Add portal placeholders
		this.createPortalPlaceholders(0, -100);
		this.createSignpost({ x: 0, y: 0, z: -80 }, "Projects\nPortal", 0x9932CC, "projects");
		
		console.log("🌀 Projects Portal Area created");
	}

	createDungeonEntrance() {
		// Dark, ominous area to the west (transition point only)
		const dungeonGeometry = new THREE.CircleGeometry(25, 32);
		const dungeonMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x4a0e0e, // Dark red
			side: THREE.DoubleSide 
		});
		
		const dungeonEntrance = new THREE.Mesh(dungeonGeometry, dungeonMaterial);
		dungeonEntrance.rotation.x = -Math.PI / 2;
		dungeonEntrance.position.set(-100, 0.05, 0);
		dungeonEntrance.receiveShadow = true;
		
		this.scene.add(dungeonEntrance);
		this.worldObjects.push(dungeonEntrance);

		// Ominous entrance portal
		this.createDungeonPortal(-100, 0);
		this.createSignpost({ x: -80, y: 0, z: 0 }, "Danger\nDungeon", 0x8B0000, "danger");
		
		console.log("🗡️ Dungeon Entrance created");
	}

	createPath(x, y, z, width, rotation, areaType) {
		const pathGeometry = new THREE.PlaneGeometry(width, 60);
		const pathMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x8B7355, // Dirt brown
			side: THREE.DoubleSide 
		});
		
		const path = new THREE.Mesh(pathGeometry, pathMaterial);
		path.rotation.x = -Math.PI / 2;
		path.rotation.z = rotation;
		path.position.set(x, y + 0.005, z); // Slightly below hub but above terrain
		path.receiveShadow = true;
		
		this.scene.add(path);
		this.worldObjects.push(path);
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
		
		// Add collider
		this.collisionSystem.addCollider(pole, { width: 2, height: 8, depth: 2 }, `signpost-${area}`);
		
		this.scene.add(pole);
		this.scene.add(sign);
		this.worldObjects.push(pole, sign);
	}



	createBuildingPlaceholders(centerX, centerZ) {
		// Simple building shapes for the village
		for (let i = 0; i < 5; i++) {
			const buildingGeometry = new THREE.BoxGeometry(8, 12, 8);
			const buildingMaterial = new THREE.MeshLambertMaterial({ 
				color: [0x8B4513, 0x654321, 0xA0522D][Math.floor(Math.random() * 3)]
			});
			
			const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
			building.position.set(
				centerX + (Math.random() - 0.5) * 60,
				6,
				centerZ + (Math.random() - 0.5) * 60
			);
			building.castShadow = true;
			
			// Add collision
			this.collisionSystem.addCollider(building, { width: 8, height: 12, depth: 8 }, `building-${i}`);
			
			this.scene.add(building);
			this.worldObjects.push(building);
		}
	}

	createPortalPlaceholders(centerX, centerZ) {
		// Mystical portal effects for projects area
		for (let i = 0; i < 3; i++) {
			const portalGeometry = new THREE.RingGeometry(3, 5, 16);
			const portalMaterial = new THREE.MeshBasicMaterial({ 
				color: 0x9932CC,
				transparent: true,
				opacity: 0.7,
				side: THREE.DoubleSide
			});
			
			const portal = new THREE.Mesh(portalGeometry, portalMaterial);
			portal.position.set(
				centerX + (Math.random() - 0.5) * 50,
				4,
				centerZ + (Math.random() - 0.5) * 50
			);
			portal.rotation.x = -Math.PI / 2;
			
			this.scene.add(portal);
			this.worldObjects.push(portal);
		}
	}

	createDungeonPortal(centerX, centerZ) {
		// Dark portal entrance to dungeon
		const portalGeometry = new THREE.CylinderGeometry(6, 8, 2, 8);
		const portalMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x000000,
			transparent: true,
			opacity: 0.8
		});
		
		const portal = new THREE.Mesh(portalGeometry, portalMaterial);
		portal.position.set(centerX, 1, centerZ);
		
		this.scene.add(portal);
		this.worldObjects.push(portal);
	}

	createWorldBoundaries() {
		const worldSize = 180;
		const wallHeight = 20;
		const wallThickness = 2;
		
		// Create invisible boundaries
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

	setupAreaZones() {
		this.areas = [
			{
				name: "Portfolio Crossroads",
				area: "hub",
				bounds: { x: 0, z: 0, radius: 35 }
			},
			{
				name: "About Me Meadow",
				area: "about",
				bounds: { x: 0, z: 100, radius: 45 }
			},
			{
				name: "Experience Village",
				area: "experience", 
				bounds: { x: 100, z: 0, radius: 40 }
			},
			{
				name: "Projects Portal",
				area: "projects",
				bounds: { x: 0, z: -100, radius: 35 }
			},
			{
				name: "Danger Dungeon",
				area: "danger",
				bounds: { x: -100, z: 0, radius: 20 }
			}
		];
	}

	createDestructibles() {
		// Scatter grass patches around all areas
		this.scatterGrassPatches();
		
		// Add wooden crates strategically
		this.placeCrates();
		
		console.log(`🌿 Created ${this.destructibles.length} destructible objects`);
	}

	scatterGrassPatches() {
		const areas = [
			{ center: { x: 0, z: 0 }, radius: 25, count: 12 }, // Crossroads
			{ center: { x: 0, z: 100 }, radius: 40, count: 20 }, // About Me Meadow (most grass!)
			{ center: { x: 100, z: 0 }, radius: 35, count: 8 }, // Experience Village
			{ center: { x: 0, z: -100 }, radius: 30, count: 8 }, // Projects Portal
		];

		for (const area of areas) {
			for (let i = 0; i < area.count; i++) {
				// Random position within area radius
				const angle = Math.random() * Math.PI * 2;
				const distance = Math.random() * area.radius;
				
				const position = new THREE.Vector3(
					area.center.x + Math.cos(angle) * distance,
					0,
					area.center.z + Math.sin(angle) * distance
				);

				// Don't place grass too close to signposts or buildings
				if (this.isPositionClear(position, 8)) { // Increased clearance
					const grass = new GrassPatch(this.scene, position);
					this.destructibles.push(grass);
				}
			}
		}
	}

	placeCrates() {
		const cratePositions = [
			// Around crossroads
			{ x: 15, z: 15 },
			{ x: -15, z: 15 },
			{ x: 15, z: -15 },
			{ x: -20, z: -10 },
			
			// In About Me Meadow
			{ x: -25, z: 120 },
			{ x: 20, z: 115 },
			{ x: -10, z: 80 },
			
			// In Experience Village (near buildings)
			{ x: 120, z: 15 },
			{ x: 85, z: -20 },
			
			// Near Projects Portal
			{ x: -15, z: -120 },
			{ x: 25, z: -85 },
		];

		for (const pos of cratePositions) {
			const position = new THREE.Vector3(pos.x, 0, pos.z);
			if (this.isPositionClear(position, 3)) {
				const crate = new WoodenCrate(this.scene, position);
				this.destructibles.push(crate);
			}
		}
	}

	isPositionClear(position, minDistance) {
		// Check if position is too close to signposts or other important objects
		// Simple check - avoid positions too close to area centers
		const importantPositions = [
			{ x: 0, z: 0 }, // Center signpost
			{ x: 0, z: 80 }, // About Me signpost
			{ x: 80, z: 0 }, // Experience signpost
			{ x: 0, z: -80 }, // Projects signpost
			{ x: -80, z: 0 }, // Danger signpost
		];

		for (const important of importantPositions) {
			const distance = Math.sqrt(
				(position.x - important.x) ** 2 + 
				(position.z - important.z) ** 2
			);
			if (distance < minDistance) {
				return false;
			}
		}
		return true;
	}

	getCurrentArea(playerPosition) {
		for (const area of this.areas) {
			const distance = Math.sqrt(
				(playerPosition.x - area.bounds.x) ** 2 +
				(playerPosition.z - area.bounds.z) ** 2
			);
			
			if (distance < area.bounds.radius) {
				return area;
			}
		}
		return null;
	}

	createPushableObjects() {
		// Pushable logs scattered around the meadow and crossroads
		const logPositions = [
			{ x: -30, z: 105 }, // About Me Meadow
			{ x: 35, z: 125 },
			{ x: -15, z: 90 },
			{ x: 20, z: 85 },
			{ x: -25, z: 25 }, // Crossroads area
			{ x: 15, z: -20 },
		];

		for (const pos of logPositions) {
			const position = new THREE.Vector3(pos.x, 0, pos.z);
			if (this.isPositionClear(position, 6)) {
				const log = new PushableLog(this.scene, position, this.collisionSystem);
				this.pushableObjects.push(log);
			}
		}

		// Pushable rocks
		const rockPositions = [
			{ x: 25, z: 110 }, // About Me Meadow
			{ x: -40, z: 115 },
			{ x: 10, z: 75 },
			{ x: -35, z: 0 }, // Crossroads
			{ x: 30, z: -10 },
		];

		for (const pos of rockPositions) {
			const position = new THREE.Vector3(pos.x, 0, pos.z);
			if (this.isPositionClear(position, 5)) {
				const rock = new PushableRock(this.scene, position, this.collisionSystem);
				this.pushableObjects.push(rock);
			}
		}

		console.log(`🪨 Created ${this.pushableObjects.length} pushable objects`);
	}

	createDecorativeObjects() {
		// Trees around the meadow perimeter for natural borders
		const treePositions = [
			{ x: -45, z: 135, variant: 1 }, // About Me Meadow border
			{ x: -35, z: 140, variant: 2 },
			{ x: 40, z: 140, variant: 1 },
			{ x: 45, z: 125, variant: 2 },
			{ x: -50, z: 95, variant: 1 },
			{ x: 50, z: 100, variant: 2 },
			{ x: -50, z: 75, variant: 2 }, // Near path to crossroads
			{ x: 50, z: 80, variant: 1 },
			{ x: -35, z: 35 }, // Around crossroads
			{ x: 40, z: 40 },
			{ x: -30, z: -30 },
			{ x: 35, z: -35 },
		];

		for (const pos of treePositions) {
			const position = new THREE.Vector3(pos.x, 0, pos.z);
			const tree = new Tree(this.scene, position, this.collisionSystem, pos.variant || 1);
			this.decorativeObjects.push(tree);
		}

		// Large immovable boulders as natural obstacles
		const boulderPositions = [
			{ x: -20, z: 140 }, // About Me Meadow
			{ x: 30, z: 130 },
			{ x: -45, z: 110 },
			{ x: 45, z: 90 },
			{ x: -40, z: 45 }, // Near crossroads
			{ x: 40, z: -25 },
		];

		for (const pos of boulderPositions) {
			const position = new THREE.Vector3(pos.x, 0, pos.z);
			const boulder = new LargeBoulder(this.scene, position, this.collisionSystem);
			this.decorativeObjects.push(boulder);
		}

		// Bushes for mid-level detail
		const bushPositions = [
			{ x: -25, z: 115 }, // About Me Meadow
			{ x: 15, z: 125 },
			{ x: -35, z: 95 },
			{ x: 40, z: 105 },
			{ x: -15, z: 75 },
			{ x: 20, z: 70 },
			{ x: -20, z: 20 }, // Crossroads area
			{ x: 25, z: 15 },
			{ x: -15, z: -15 },
			{ x: 20, z: -25 },
		];

		for (const pos of bushPositions) {
			const position = new THREE.Vector3(pos.x, 0, pos.z);
			if (this.isPositionClear(position, 4)) {
				const bush = new Bush(this.scene, position, this.collisionSystem);
				this.decorativeObjects.push(bush);
			}
		}

		// Beautiful flower patches (purely decorative)
		const flowerPatchPositions = [
			{ x: -10, z: 120 }, // About Me Meadow
			{ x: 30, z: 115 },
			{ x: -30, z: 100 },
			{ x: 35, z: 95 },
			{ x: -20, z: 80 },
			{ x: 15, z: 85 },
			{ x: -10, z: 10 }, // Around crossroads
			{ x: 25, z: 5 },
			{ x: -25, z: -5 },
			{ x: 15, z: -20 },
		];

		for (const pos of flowerPatchPositions) {
			const position = new THREE.Vector3(pos.x, 0, pos.z);
			if (this.isPositionClear(position, 3)) {
				const flowerPatch = new FlowerPatch(this.scene, position, this.collisionSystem);
				this.decorativeObjects.push(flowerPatch);
			}
		}

		console.log(`🌳 Created ${this.decorativeObjects.length} decorative objects`);
	}

	updatePushableObjects(deltaTime) {
		for (const pushable of this.pushableObjects) {
			pushable.update(deltaTime);
		}
	}

	createInteractiveElements() {
		// About Me Meadow interactive elements - you can customize these!
		const aboutMeElements = [
			{
				type: 'flower',
				position: { x: -20, z: 120 },
				content: {
					title: "Welcome to David's World! 🌸",
					description: "This meadow contains little pieces of my story. Explore and discover!",
					details: "Each interactive element reveals something about who I am, what I love, and where I'm going.",
					color: 0xff69b4
				}
			},
			{
				type: 'crystal',
				position: { x: 15, z: 110 },
				content: {
					title: "My Background 💎",
					description: "Software engineer with a passion for creating amazing experiences.",
					details: "I love working with modern technologies and building things that make people's lives better. Always learning, always growing!",
					color: 0x4169e1
				}
			},
			{
				type: 'rock',
				position: { x: -10, z: 85 },
				content: {
					title: "Hobbies & Interests 🎮",
					description: "When I'm not coding, you'll find me...",
					details: "Gaming (obviously!), exploring new tech, hiking, and probably building something cool in my spare time. I believe the best work comes from passionate people who love what they do."
				}
			},
			{
				type: 'flower',
				position: { x: 25, z: 95 },
				content: {
					title: "Family & Values 👨‍👩‍👧‍👦",
					description: "The people and principles that drive me.",
					details: "Family comes first, integrity guides everything, and I believe technology should bring people together, not divide them.",
					color: 0x32cd32
				}
			},
			{
				type: 'crystal',
				position: { x: -25, z: 105 },
				content: {
					title: "Goals & Dreams 🚀",
					description: "Where I'm headed and what excites me.",
					details: "Building impactful software, growing as a technical leader, and maybe creating the next game that brings joy to millions!",
					color: 0xff6347
				}
			}
		];

		for (const element of aboutMeElements) {
			let interactive;
			const position = new THREE.Vector3(element.position.x, 0, element.position.z);
			
			switch (element.type) {
				case 'flower':
					interactive = new InfoFlower(this.scene, position, element.content);
					break;
				case 'rock':
					interactive = new InfoRock(this.scene, position, element.content);
					break;
				case 'crystal':
					interactive = new InfoCrystal(this.scene, position, element.content);
					break;
			}
			
			if (interactive) {
				this.interactiveElements.push(interactive);
			}
		}
		
		console.log(`✨ Created ${this.interactiveElements.length} interactive elements`);
	}

	updateInteractiveElements(deltaTime, playerPosition) {
		for (const element of this.interactiveElements) {
			element.update(deltaTime, playerPosition);
		}
	}

	getDestructibles() {
		return this.destructibles.filter(obj => !obj.isDestroyed);
	}

	getWorldObjects() {
		return this.worldObjects;
	}

	dispose() {
		// Dispose world objects
		for (const obj of this.worldObjects) {
			if (obj.geometry) obj.geometry.dispose();
			if (obj.material) obj.material.dispose();
			this.scene.remove(obj);
		}
		this.worldObjects = [];
		
		// Dispose destructible objects
		for (const destructible of this.destructibles) {
			destructible.dispose();
		}
		this.destructibles = [];
		
		// Dispose pushable objects
		for (const pushable of this.pushableObjects) {
			pushable.dispose();
		}
		this.pushableObjects = [];
		
		// Dispose decorative objects
		for (const decorative of this.decorativeObjects) {
			decorative.dispose();
		}
		this.decorativeObjects = [];
		
		// Dispose interactive elements
		for (const element of this.interactiveElements) {
			element.dispose();
		}
		this.interactiveElements = [];
		
		console.log("🧹 Unified world disposed");
	}
} 