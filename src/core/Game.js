import * as THREE from "three";
import { Player } from "../entities/Player.js";
import { InputManager } from "./InputManager.js";

export class Game {
	constructor() {
		this.scene = new THREE.Scene();
		this.camera = null;
		this.renderer = null;
		this.inputManager = new InputManager();
		this.player = null;

		// Game state
		this.isRunning = false;
		this.isPaused = false;
		this.clock = new THREE.Clock();

		// Make game accessible globally for debugging
		window.game = this;
	}

	async init() {
		this.setupRenderer();
		this.setupCamera();
		this.setupLighting();

		// Initialize input handling
		this.inputManager.init();

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
		// Use OrthographicCamera for true Zelda-style top-down view
		const frustumSize = 75;
		const aspect = window.innerWidth / window.innerHeight;

		this.camera = new THREE.OrthographicCamera(
			(frustumSize * aspect) / -2,
			(frustumSize * aspect) / 2,
			frustumSize / 2,
			frustumSize / -2,
			1,
			1000,
		);

		this.camera.position.set(0, 50, 0);
		this.camera.up.set(0, 0, -1); // Important for correct orientation
		this.camera.lookAt(0, 0, 0);
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
		// Create a simple ground plane for now
		this.createTestEnvironment();

		// Create and add player
		this.player = new Player();
		await this.player.init();
		this.scene.add(this.player.mesh);

		console.log("🌍 Initial scene loaded!");
	}

	createTestEnvironment() {
		// Create a simple ground plane
		const groundGeometry = new THREE.PlaneGeometry(200, 200);
		const groundMaterial = new THREE.MeshLambertMaterial({
			color: 0x2d5a27, // Forest green
			flatShading: true,
		});

		const ground = new THREE.Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
		ground.receiveShadow = true;
		this.scene.add(ground);

		// Add some test cubes as obstacles
		for (let i = 0; i < 5; i++) {
			const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
			const cubeMaterial = new THREE.MeshLambertMaterial({
				color: Math.random() * 0xffffff,
				flatShading: true,
			});

			const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
			cube.position.set(
				(Math.random() - 0.5) * 80,
				1.5,
				(Math.random() - 0.5) * 80,
			);
			cube.castShadow = true;
			cube.receiveShadow = true;
			this.scene.add(cube);
		}

		console.log("🏗️ Test environment created");
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

			// Update camera to follow player
			this.updateCamera();
		}
	}

	updateCamera() {
		if (this.player) {
			// Smooth camera following
			const targetPosition = this.player.mesh.position.clone();
			targetPosition.y = 50; // Keep camera height

			this.camera.position.lerp(targetPosition, 0.05);
			this.camera.lookAt(this.player.mesh.position);
		}
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	handleResize() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const aspect = width / height;
		const frustumSize = 75;

		// Update camera
		this.camera.left = (frustumSize * aspect) / -2;
		this.camera.right = (frustumSize * aspect) / 2;
		this.camera.top = frustumSize / 2;
		this.camera.bottom = frustumSize / -2;
		this.camera.updateProjectionMatrix();

		// Update renderer
		this.renderer.setSize(width, height);

		console.log("📏 Game resized to", width, "x", height);
	}

	isMobile() {
		return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
	}
}
