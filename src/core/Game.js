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
		// Temporarily use perspective camera for debugging
		this.camera = new THREE.PerspectiveCamera(
			75, // field of view
			window.innerWidth / window.innerHeight, // aspect ratio
			0.1, // near plane
			1000 // far plane
		);

		// Position camera at an angle to see the scene better
		this.camera.position.set(20, 30, 20);
		this.camera.lookAt(0, 0, 0);
		
		console.log("🎥 Camera setup (perspective):", this.camera.position, "looking at origin");
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
		ground.position.y = 0; // Make sure it's at ground level
		ground.receiveShadow = true;
		this.scene.add(ground);
		
		console.log("🌍 Ground created at:", ground.position);

		// Add some test cubes as obstacles
		for (let i = 0; i < 5; i++) {
			const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
			const cubeMaterial = new THREE.MeshLambertMaterial({
				color: Math.random() * 0xffffff,
				flatShading: true,
			});

			const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
			cube.position.set(
				(Math.random() - 0.5) * 30, // Smaller spread for testing
				1.5,
				(Math.random() - 0.5) * 30,
			);
			cube.castShadow = true;
			cube.receiveShadow = true;
			this.scene.add(cube);
			console.log(`📦 Cube ${i} created at:`, cube.position);
		}

		// Add a bright test cube at origin for reference
		const testCube = new THREE.Mesh(
			new THREE.BoxGeometry(5, 5, 5),
			new THREE.MeshBasicMaterial({ color: 0xff0000 }) // Bright red, no lighting needed
		);
		testCube.position.set(0, 2.5, 0);
		this.scene.add(testCube);
		console.log("🎯 Red test cube added at origin");

		console.log("🏗️ Test environment created, scene has", this.scene.children.length, "objects");
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

			// Temporarily disable camera following for debugging
			// this.updateCamera();
		}
	}

	updateCamera() {
		// Temporarily disable camera following to debug
		// if (this.player) {
		// 	// Smooth camera following
		// 	const targetPosition = this.player.mesh.position.clone();
		// 	targetPosition.y = 50; // Keep camera height

		// 	this.camera.position.lerp(targetPosition, 0.05);
		// 	this.camera.lookAt(this.player.mesh.position);
		// }
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

		// Update camera aspect ratio for perspective camera
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		// Update renderer
		this.renderer.setSize(width, height);

		console.log("📏 Game resized to", width, "x", height);
	}

	isMobile() {
		return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
	}
}
