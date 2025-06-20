import * as THREE from "three";
import { Player } from "../entities/Player.js";
import { InputManager } from "./InputManager.js";
import { CollisionSystem } from "../systems/CollisionSystem.js";
import { UnifiedWorld } from "../scenes/UnifiedWorld.js";
import { AreaNotification } from "../utils/AreaNotification.js";

export class Game {
	constructor() {
		this.scene = new THREE.Scene();
		this.camera = null;
		this.renderer = null;
		this.inputManager = new InputManager();
		this.collisionSystem = new CollisionSystem();
		this.player = null;
		this.world = null;
		this.areaNotification = null;

		// Game state
		this.isRunning = false;
		this.isPaused = false;
		this.clock = new THREE.Clock();
		this.currentAreaName = null;

		// Make game accessible globally for debugging
		window.game = this;
	}

	async init() {
		this.setupRenderer();
		this.setupCamera();
		this.setupLighting();

		// Initialize input handling
		this.inputManager.init();
		
		// Initialize area notification system
		this.areaNotification = new AreaNotification();

		console.log("🎮 Game core initialized successfully!");
	}

	setupRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			antialias: !this.isMobile(),
			powerPreference: "high-performance",
		});

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// Enable shadows
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		// Set background color to dark blue/black
		this.renderer.setClearColor(0x1a1a2e, 1);

		// Add canvas to the game container
		const gameContainer = document.getElementById("game-container");
		gameContainer.appendChild(this.renderer.domElement);
	}

	setupCamera() {
		// Use OrthographicCamera for SNES Zelda-style angled view
		const frustumSize = 50; // Smaller for closer view
		const aspect = window.innerWidth / window.innerHeight;

		this.camera = new THREE.OrthographicCamera(
			(frustumSize * aspect) / -2,
			(frustumSize * aspect) / 2,
			frustumSize / 2,
			frustumSize / -2,
			1,
			1000,
		);

		// Position camera at an angle like SNES Zelda - slightly behind and above
		this.camera.position.set(0, 40, 25); // Y=height, Z=distance back
		this.camera.up.set(0, 1, 0); // Standard up vector for angled view
		this.camera.lookAt(0, 0, 0);
		
		console.log("🎥 Camera setup (SNES-style angled):", this.camera.position);
	}

	setupLighting() {
		// Ambient light for overall illumination
		const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
		this.scene.add(ambientLight);

		// Directional light (like sunlight)
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		directionalLight.position.set(50, 100, 50);
		directionalLight.castShadow = true;

		// Shadow camera settings
		directionalLight.shadow.mapSize.width = 2048;
		directionalLight.shadow.mapSize.height = 2048;
		directionalLight.shadow.camera.near = 0.5;
		directionalLight.shadow.camera.far = 500;
		directionalLight.shadow.camera.left = -100;
		directionalLight.shadow.camera.right = 100;
		directionalLight.shadow.camera.top = 100;
		directionalLight.shadow.camera.bottom = -100;

		this.scene.add(directionalLight);
	}

	async loadInitialScene() {
		// Create the unified world with all areas
		this.world = new UnifiedWorld(this.scene, this.collisionSystem);

		// Add collision debug meshes to scene
		for (const debugMesh of this.collisionSystem.getDebugMeshes()) {
			this.scene.add(debugMesh);
		}

		// Create and add player with collision detection and world reference
		this.player = new Player(this.collisionSystem, this.world);
		await this.player.init();
		this.scene.add(this.player.mesh);

		console.log("🌍 Unified world with all areas loaded!");
	}



	start() {
		this.isRunning = true;
		this.animate();
		console.log("🚀 Game started!");
	}

	pause() {
		this.isPaused = true;
		console.log("⏸️ Game paused");
	}

	resume() {
		this.isPaused = false;
		this.clock.start();
		console.log("▶️ Game resumed");
	}

	animate() {
		if (!this.isRunning) return;

		requestAnimationFrame(() => this.animate());

		if (this.isPaused) return;

		const deltaTime = this.clock.getDelta();
		this.update(deltaTime);
		this.render();
	}

	update(deltaTime) {
		// Update player
		if (this.player) {
			this.player.update(deltaTime, this.inputManager);

			// Update interactive elements
			if (this.world) {
				this.world.updateInteractiveElements(deltaTime, this.player.mesh.position);
				this.world.updatePushableObjects(deltaTime);
			}

			// Check for area zones
			if (this.world) {
				const currentArea = this.world.getCurrentArea(this.player.mesh.position);
				if (currentArea) {
					// Check if we've entered a new area
					if (this.currentAreaName !== currentArea.name) {
						this.currentAreaName = currentArea.name;
						
						// Show area notification with custom description
						if (this.areaNotification) {
							const description = this.areaNotification.getAreaDescription(currentArea.name);
							this.areaNotification.show(currentArea.name, description);
						}
					}
					
					if (currentArea.area === 'danger') {
						// Dungeon requires confirmation for transition to separate scene
						this.updateAreaUI(currentArea.name);
						// TODO: Add ENTER key handling for dungeon scene transition
					}
				} else {
					// Clear current area when leaving all zones
					if (this.currentAreaName !== null) {
						this.currentAreaName = null;
					}
					this.clearAreaUI();
				}
			}

			// Update camera to follow player
			this.updateCamera();
		}
	}

	updateCamera() {
		if (this.player) {
			// Smooth camera following for SNES-style angled view
			const targetPosition = this.player.mesh.position.clone();
			targetPosition.y = 40; // Camera height
			targetPosition.z += 25; // Camera distance back

			this.camera.position.lerp(targetPosition, 0.1);
			this.camera.lookAt(this.player.mesh.position);
		}
	}

	render() {
		this.renderer.render(this.scene, this.camera);
		
		// Debug render info (only log every 60 frames to avoid spam)
		if (this.clock.elapsedTime > 0 && Math.floor(this.clock.elapsedTime * 60) % 60 === 0) {
			console.log("🖼️ Rendering scene with", this.scene.children.length, "objects");
		}
	}

	handleResize() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const aspect = width / height;
		const frustumSize = 50;

		// Update orthographic camera
		this.camera.left = (frustumSize * aspect) / -2;
		this.camera.right = (frustumSize * aspect) / 2;
		this.camera.top = frustumSize / 2;
		this.camera.bottom = frustumSize / -2;
		this.camera.updateProjectionMatrix();

		// Update renderer
		this.renderer.setSize(width, height);

		console.log("📏 Game resized to", width, "x", height);
	}

	updateAreaUI(areaName) {
		const areaIndicator = document.getElementById('area-indicator');
		if (areaIndicator) {
			areaIndicator.textContent = `Press ENTER to enter ${areaName}`;
			areaIndicator.style.display = 'block';
		}
	}

	clearAreaUI() {
		const areaIndicator = document.getElementById('area-indicator');
		if (areaIndicator) {
			areaIndicator.style.display = 'none';
		}
	}

	updateCurrentAreaDisplay(areaName) {
		const areaDisplay = document.getElementById('area-display');
		if (areaDisplay) {
			if (areaDisplay.textContent !== areaName) {
				areaDisplay.textContent = areaName;
				areaDisplay.style.opacity = '1';
				
				// Auto-fade after showing area name briefly
				setTimeout(() => {
					areaDisplay.style.opacity = '0.3';
				}, 2000);
			}
		}
	}

	clearCurrentAreaDisplay() {
		const areaDisplay = document.getElementById('area-display');
		if (areaDisplay) {
			areaDisplay.style.opacity = '0';
		}
	}

	isMobile() {
		return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
	}
}
