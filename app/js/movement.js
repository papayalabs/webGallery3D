define(["three", "tools"], function (THREE, tools) {
   
	/*
	*   Module for collision detection and camera-movement
	*/

	var moveForward = false,
		moveBackward = false,
		moveLeft = false,
		moveRight = false,
		isCollision = false,
		controlsEnabled = false,
		speed = 400,
		moveDirection = new THREE.Vector3(),
		rayAngle1 = tools.deg2rad(20),
		rayAngle2 = tools.deg2rad(40),
		zVector = new THREE.Vector3(0, 1, 0),		
		velocity = new THREE.Vector3(),
		raycaster;


	(function () {			
		raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
		raycaster.near = 0;
	})();


	return {

		// Event-handler for key-pressed-events. 
		onKeyDown: function (event) {
			if (controlsEnabled) {


				switch (event.keyCode) {

					case 38: // up
					case 87: // w
						moveForward = true;
						break;

					case 37: // left
					case 65: // a
						moveLeft = true;
						break;

					case 40: // down
					case 83: // s
						moveBackward = true;
						break;

					case 39: // right
					case 68: // d
						moveRight = true;
						break;


				}
			}
		},


		// Event-handler for key-released-events. 
		onKeyUp: function (event) {


			switch (event.keyCode) {

				case 38: // up
				case 87: // w
					moveForward = false;
					break;

				case 37: // left
				case 65: // a
					moveLeft = false;
					break;

				case 40: // down
				case 83: // s
					moveBackward = false;
					break;

				case 39: // right
				case 68: // d
					moveRight = false;
					break;
			}
		},

		// Sets the speed of the movement
		setSpeed: function (spd) {			
			if (typeof spd === 'number') {
				speed = spd;
			} else {
				speed = 400.0;
			}
		},

		// Moves the given camObject and returns TRUE if no collision occured
		move: function (camObject, delta, collisionObjects) {
			var cnt = 0;
			// Set speed and move-direction

			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;

			if (moveForward) {
				velocity.z -= speed * delta;
			} else if (moveBackward) {
				velocity.z += speed * delta;
			}

			if (moveLeft) {
				velocity.x -= speed * delta;
			} else if (moveRight) {
				velocity.x += speed * delta;
			}

			if (velocity.x > 0) {
				moveDirection.x = 1;
			} else if (velocity.x < 0) {
				moveDirection.x = -1;
			} else {
				moveDirection.x = 0;
			}

			if (velocity.z > 0) {
				moveDirection.z = 1;
			} else if (velocity.z < 0) {
				moveDirection.z = -1;
			} else {
				moveDirection.z = 0;
			}


			if (moveDirection.length() > 0) {

				// Set the length of the collision-detection. Ensure that the ray is not shorter than the travel-distance
				raycaster.far = Math.max(speed / 20, velocity.length() * delta);

				cnt = 0;

				// The ray is used twice in each frame. After the first scanning, it is rotated for the second scan.

				// rotate the move-direction by the camera-angle minus the half angle (20 deg)		           
				moveDirection.applyAxisAngle(zVector, camObject.rotation.y - rayAngle1);


				// set origin and direction of the raycaster
				raycaster.set(camObject.position, moveDirection);

				// detect collisions. 	         
				cnt += raycaster.intersectObjects(collisionObjects, true).length;


				// rotate the move-direction by the full angle (40 deg)
				moveDirection.applyAxisAngle(zVector, rayAngle2);


				// set origin and direction of the raycaster
				raycaster.set(camObject.position, moveDirection);

				// detect collisions.		         
				cnt += raycaster.intersectObjects(collisionObjects, true).length;


				isCollision = cnt > 0;
			}


			// Do not move on collision.
			if (isCollision) {
				velocity.x = 0;
				velocity.z = 0;
			} else {
				camObject.translateX(velocity.x * delta);
				camObject.translateZ(velocity.z * delta);
			}

			return !isCollision;
		},

		// Gets wether the movement is enabled or not
		isEnabled: function () {
			return controlsEnabled;
		},

		// Enables the movement
		enable: function () {
			controlsEnabled = true;
		},

		// Disables the movement and sets the velocity to zero.
		disable: function () {
			controlsEnabled = false;
			velocity.x = 0;
			velocity.z = 0;
			moveForward = false;
			moveBackward = false;
			moveLeft = false;
			moveRight = false;
		}
	};


});