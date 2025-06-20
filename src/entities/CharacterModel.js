import * as THREE from 'three';

export function createPlayer() {
		const group = new THREE.Group();
		
		// Character color scheme - classic adventurer
		const skinColor = 0xfdbcb4;
		const hairColor = 0x8b4513;
		const shirtColor = 0x228b22;
		const pantsColor = 0x4169e1;
		const bootColor = 0x654321;
		
		// Body (torso)
		const bodyGeometry = new THREE.BoxGeometry(3, 4, 2);
		const bodyMaterial = new THREE.MeshLambertMaterial({ color: shirtColor });
		const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
		body.position.y = 1;
		body.castShadow = true;
		group.add(body);
		
		// Head
		const headGeometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
		const headMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
		const head = new THREE.Mesh(headGeometry, headMaterial);
		head.position.y = 4.25;
		head.castShadow = true;
		group.add(head);
		
		// Hair
		const hairGeometry = new THREE.BoxGeometry(2.8, 1.5, 2.8);
		const hairMaterial = new THREE.MeshLambertMaterial({ color: hairColor });
		const hair = new THREE.Mesh(hairGeometry, hairMaterial);
		hair.position.y = 5.2;
		hair.castShadow = true;
		group.add(hair);
		
		// Eyes (simple white dots)
		const eyeGeometry = new THREE.SphereGeometry(0.2, 8, 6);
		const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		
		const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
		leftEye.position.set(-0.5, 4.3, 1.3);
		group.add(leftEye);
		
		const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
		rightEye.position.set(0.5, 4.3, 1.3);
		group.add(rightEye);
		
		// Eye pupils
		const pupilGeometry = new THREE.SphereGeometry(0.1, 8, 6);
		const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
		
		const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
		leftPupil.position.set(-0.5, 4.3, 1.4);
		group.add(leftPupil);
		
		const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
		rightPupil.position.set(0.5, 4.3, 1.4);
		group.add(rightPupil);
		
		// Arms
		const armGeometry = new THREE.BoxGeometry(1, 3, 1);
		const armMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
		
		const leftArm = new THREE.Mesh(armGeometry, armMaterial);
		leftArm.position.set(-2.5, 1, 0);
		leftArm.castShadow = true;
		group.add(leftArm);
		
		const rightArm = new THREE.Mesh(armGeometry, armMaterial);
		rightArm.position.set(2.5, 1, 0);
		rightArm.castShadow = true;
		group.add(rightArm);
		
		// Legs
		const legGeometry = new THREE.BoxGeometry(1.2, 3, 1.2);
		const legMaterial = new THREE.MeshLambertMaterial({ color: pantsColor });
		
		const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
		leftLeg.position.set(-0.8, -2.5, 0);
		leftLeg.castShadow = true;
		group.add(leftLeg);
		
		const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
		rightLeg.position.set(0.8, -2.5, 0);
		rightLeg.castShadow = true;
		group.add(rightLeg);
		
		// Boots
		const bootGeometry = new THREE.BoxGeometry(1.4, 1, 2);
		const bootMaterial = new THREE.MeshLambertMaterial({ color: bootColor });
		
		const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
		leftBoot.position.set(-0.8, -4.5, 0.3);
		leftBoot.castShadow = true;
		group.add(leftBoot);
		
		const rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
		rightBoot.position.set(0.8, -4.5, 0.3);
		rightBoot.castShadow = true;
		group.add(rightBoot);
		
		// Create a prominent sword (starts on back, animates during attacks)
		const swordGroup = new THREE.Group();
		swordGroup.name = 'sword'; // Name it so we can find it later
		
		// Sword handle (bigger and more visible)
		const swordHandleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2);
		const swordHandleMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
		const swordHandle = new THREE.Mesh(swordHandleGeometry, swordHandleMaterial);
		swordHandle.position.set(0, -1, 0);
		swordHandle.castShadow = true;
		swordGroup.add(swordHandle);
		
		// Sword blade (bigger and shinier)
		const swordBladeGeometry = new THREE.BoxGeometry(0.4, 6, 0.2);
		const swordBladeMaterial = new THREE.MeshLambertMaterial({ 
			color: 0xe6e6e6, // Brighter silver
			emissive: 0x222222 // Slight glow
		});
		const swordBlade = new THREE.Mesh(swordBladeGeometry, swordBladeMaterial);
		swordBlade.position.set(0, 2, 0);
		swordBlade.castShadow = true;
		swordGroup.add(swordBlade);
		
		// Sword crossguard
		const crossguardGeometry = new THREE.BoxGeometry(1.5, 0.3, 0.3);
		const crossguardMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
		const crossguard = new THREE.Mesh(crossguardGeometry, crossguardMaterial);
		crossguard.position.set(0, 0, 0);
		crossguard.castShadow = true;
		swordGroup.add(crossguard);
		
		// Position sword hilt in character's right hand, angled forward
		swordGroup.position.set(2.5, 1, 0.7); // Right hand position (same as right arm)
		swordGroup.rotation.z = 0; // Level horizontally  
		swordGroup.rotation.y = 0; // Pointing straight forward
		swordGroup.rotation.x = Math.PI / 6; // Angled forward (30 degrees - REVERSED!)
		
		group.add(swordGroup);
		
		// Position the entire character properly
		group.position.y = 4; // Lift character so feet are on ground
		
		console.log("🧙‍♂️ Low-poly character model created!");
		return group;
	}
	
export function createSwordHitbox(character) {
		// Create an invisible hitbox for sword attacks
		const hitboxGeometry = new THREE.BoxGeometry(6, 3, 6);
		const hitboxMaterial = new THREE.MeshBasicMaterial({ 
			color: 0xff0000, 
			transparent: true, 
			opacity: 0 
		});
		
		const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
		hitbox.position.set(0, 0, 3); // In front of character
		hitbox.visible = false; // Hide by default
		
		character.add(hitbox);
		return hitbox;
	} 