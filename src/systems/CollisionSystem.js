import * as THREE from 'three';

export class CollisionSystem {
	constructor() {
		this.boundaries = [];
		this.colliders = [];
		this.debug = true; // Show collision boxes for debugging
		this.debugMeshes = [];
	}

	addBoundary(min, max, name = 'boundary') {
		const boundary = {
			min: new THREE.Vector3(min.x, min.y, min.z),
			max: new THREE.Vector3(max.x, max.y, max.z),
			name: name
		};
		this.boundaries.push(boundary);
		
		if (this.debug) {
			this.createDebugMesh(boundary);
		}
		
		console.log(`🚧 Added boundary: ${name}`, boundary);
		return boundary;
	}

	addCollider(object, size, name = 'collider') {
		const collider = {
			object: object,
			size: size, // { width, height, depth }
			name: name
		};
		this.colliders.push(collider);
		console.log(`📦 Added collider: ${name}`, collider);
		return collider;
	}

	removeCollider(collider) {
		const index = this.colliders.indexOf(collider);
		if (index > -1) {
			this.colliders.splice(index, 1);
			console.log(`🗑️ Removed collider: ${collider.name}`);
			return true;
		}
		return false;
	}

	checkCollision(position, size) {
		const halfSize = {
			x: size.width / 2,
			y: size.height / 2,
			z: size.depth / 2
		};

		// Create bounding box for the object
		const objectBox = {
			min: {
				x: position.x - halfSize.x,
				y: position.y - halfSize.y,
				z: position.z - halfSize.z
			},
			max: {
				x: position.x + halfSize.x,
				y: position.y + halfSize.y,
				z: position.z + halfSize.z
			}
		};

		// Check against boundaries
		for (const boundary of this.boundaries) {
			if (this.aabbIntersect(objectBox, boundary)) {
				return { collision: true, type: 'boundary', object: boundary };
			}
		}

		// Check against other colliders
		for (const collider of this.colliders) {
			const colliderPos = collider.object.position;
			const colliderHalfSize = {
				x: collider.size.width / 2,
				y: collider.size.height / 2,
				z: collider.size.depth / 2
			};

			const colliderBox = {
				min: {
					x: colliderPos.x - colliderHalfSize.x,
					y: colliderPos.y - colliderHalfSize.y,
					z: colliderPos.z - colliderHalfSize.z
				},
				max: {
					x: colliderPos.x + colliderHalfSize.x,
					y: colliderPos.y + colliderHalfSize.y,
					z: colliderPos.z + colliderHalfSize.z
				}
			};

			if (this.aabbIntersect(objectBox, colliderBox)) {
				return { collision: true, type: 'collider', object: collider };
			}
		}

		return { collision: false };
	}

	// AABB (Axis-Aligned Bounding Box) intersection test
	aabbIntersect(box1, box2) {
		return (
			box1.min.x < box2.max.x &&
			box1.max.x > box2.min.x &&
			box1.min.y < box2.max.y &&
			box1.max.y > box2.min.y &&
			box1.min.z < box2.max.z &&
			box1.max.z > box2.min.z
		);
	}

	createDebugMesh(boundary) {
		const size = {
			x: boundary.max.x - boundary.min.x,
			y: boundary.max.y - boundary.min.y,
			z: boundary.max.z - boundary.min.z
		};

		const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
		const material = new THREE.MeshBasicMaterial({ 
			color: 0xff0000, 
			wireframe: true,
			transparent: true,
			opacity: 0.3
		});
		
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(
			(boundary.min.x + boundary.max.x) / 2,
			(boundary.min.y + boundary.max.y) / 2,
			(boundary.min.z + boundary.max.z) / 2
		);
		
		this.debugMeshes.push(mesh);
		return mesh;
	}

	getDebugMeshes() {
		return this.debugMeshes;
	}

	toggleDebug() {
		this.debug = !this.debug;
		console.log(`🔍 Collision debug: ${this.debug ? 'ON' : 'OFF'}`);
	}
} 