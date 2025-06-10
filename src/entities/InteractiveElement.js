import * as THREE from 'three';

export class InteractiveElement {
	constructor(scene, position, type, content) {
		this.scene = scene;
		this.position = position;
		this.type = type;
		this.content = content;
		this.mesh = null;
		this.isActive = false;
		this.interactionRange = 6;
		
		this.createMesh();
		this.createInteractionIndicator();
	}

	createMesh() {
		// Override in subclasses
		console.log(`📝 Interactive element created: ${this.type}`);
	}

	createInteractionIndicator() {
		// Create a subtle glow effect when player is nearby
		const glowGeometry = new THREE.RingGeometry(2, 3, 16);
		const glowMaterial = new THREE.MeshBasicMaterial({
			color: 0x00ff88,
			transparent: true,
			opacity: 0,
			side: THREE.DoubleSide
		});
		
		this.glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
		this.glowRing.rotation.x = -Math.PI / 2;
		this.glowRing.position.copy(this.position);
		this.glowRing.position.y = 0.1;
		
		this.scene.add(this.glowRing);
	}

	update(deltaTime, playerPosition) {
		const distance = playerPosition.distanceTo(this.position);
		
		if (distance < this.interactionRange) {
			if (!this.isActive) {
				this.activate();
			}
			// Animate glow ring
			const intensity = 1 - (distance / this.interactionRange);
			this.glowRing.material.opacity = intensity * 0.3;
			this.glowRing.rotation.z += deltaTime * 2; // Gentle rotation
		} else {
			if (this.isActive) {
				this.deactivate();
			}
			this.glowRing.material.opacity = 0;
		}
	}

	activate() {
		this.isActive = true;
		this.showContent();
		console.log(`✨ Activated: ${this.type}`);
	}

	deactivate() {
		this.isActive = false;
		this.hideContent();
	}

	showContent() {
		// Show content in UI overlay
		const contentDisplay = document.getElementById('content-display');
		if (contentDisplay) {
			contentDisplay.innerHTML = `
				<div class="info-card">
					<h3>${this.content.title}</h3>
					<p>${this.content.description}</p>
					${this.content.details ? `<div class="details">${this.content.details}</div>` : ''}
				</div>
			`;
			contentDisplay.style.display = 'block';
			contentDisplay.style.opacity = '1';
		}
	}

	hideContent() {
		const contentDisplay = document.getElementById('content-display');
		if (contentDisplay) {
			contentDisplay.style.opacity = '0';
			setTimeout(() => {
				contentDisplay.style.display = 'none';
			}, 300);
		}
	}

	dispose() {
		if (this.mesh) {
			if (this.mesh.geometry) this.mesh.geometry.dispose();
			if (this.mesh.material) this.mesh.material.dispose();
			this.scene.remove(this.mesh);
		}
		if (this.glowRing) {
			this.glowRing.geometry.dispose();
			this.glowRing.material.dispose();
			this.scene.remove(this.glowRing);
		}
	}
}

export class InfoFlower extends InteractiveElement {
	constructor(scene, position, content) {
		super(scene, position, 'flower', content);
	}

	createMesh() {
		// Create a larger, more prominent flower
		const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3);
		const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
		const stem = new THREE.Mesh(stemGeometry, stemMaterial);
		stem.position.y = 1.5;
		
		// Flower petals
		const petalGeometry = new THREE.SphereGeometry(1, 8, 6);
		const petalMaterial = new THREE.MeshLambertMaterial({ 
			color: this.content.color || 0xff69b4 
		});
		const petals = new THREE.Mesh(petalGeometry, petalMaterial);
		petals.position.y = 3;
		petals.scale.y = 0.3; // Flatten for petal look
		petals.castShadow = true;
		
		// Group together
		this.mesh = new THREE.Group();
		this.mesh.add(stem);
		this.mesh.add(petals);
		this.mesh.position.copy(this.position);
		
		this.scene.add(this.mesh);
	}
}

export class InfoRock extends InteractiveElement {
	constructor(scene, position, content) {
		super(scene, position, 'rock', content);
	}

	createMesh() {
		// Create an interesting rock formation
		const rockGeometry = new THREE.DodecahedronGeometry(2);
		const rockMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x696969,
			flatShading: true 
		});
		
		this.mesh = new THREE.Mesh(rockGeometry, rockMaterial);
		this.mesh.position.copy(this.position);
		this.mesh.position.y = 1;
		this.mesh.rotation.x = Math.random() * Math.PI;
		this.mesh.rotation.z = Math.random() * Math.PI;
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		
		this.scene.add(this.mesh);
	}
}

export class InfoCrystal extends InteractiveElement {
	constructor(scene, position, content) {
		super(scene, position, 'crystal', content);
	}

	createMesh() {
		// Create a magical crystal
		const crystalGeometry = new THREE.OctahedronGeometry(1.5);
		const crystalMaterial = new THREE.MeshLambertMaterial({ 
			color: this.content.color || 0x88ccff,
			transparent: true,
			opacity: 0.8,
			emissive: this.content.color || 0x004488,
			emissiveIntensity: 0.2
		});
		
		this.mesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
		this.mesh.position.copy(this.position);
		this.mesh.position.y = 2;
		this.mesh.castShadow = true;
		
		this.scene.add(this.mesh);
	}

	update(deltaTime, playerPosition) {
		super.update(deltaTime, playerPosition);
		
		// Crystal rotates and bobs gently
		if (this.mesh) {
			this.mesh.rotation.y += deltaTime * 0.5;
			this.mesh.position.y = this.position.y + 2 + Math.sin(Date.now() * 0.002) * 0.3;
		}
	}
} 