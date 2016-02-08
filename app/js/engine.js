define(["blocker", "tools", "three", "PointerLockControls", "AssimpJSONLoader"], function (blocker, tools) {

	var camera, scene, renderer, skyBox, controls, raycaster,
		collisionObjects = [],
		untouchableObjects = [],
		renderCallbacks = [],
		controlsEnabled = false,
		moveForward = false,
		moveBackward = false,
		moveLeft = false,
		moveRight = false,
		isLocked = false,
		isLockInitialized = false,
		isLoadingComplete = false,
		showStats = false,
		speed = 400.0,
		prevTime = performance.now(),
		velocity = new THREE.Vector3(),
		manager = new THREE.LoadingManager(),
		loader1 = new THREE.AssimpJSONLoader(manager),
		

	onWindowResize = function () {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	},


	animate = function () {
	    requestAnimationFrame(animate);


	    if (showStats) {
	        blocker.beginMeasure();
	    }

		var time = performance.now();
		if (controlsEnabled) {



			var moveDirection = new THREE.Vector3();

			var delta = (time - prevTime) / 1000;

			// Set speed and move-direction

			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;

			if (moveForward) {
				velocity.z -= speed * delta;
				moveDirection.z = -1;
			} else if (moveBackward) {
				velocity.z += speed * delta;
				moveDirection.z = 1;
			}

			if (moveLeft) {
				velocity.x -= speed * delta;
				moveDirection.x = -1;
			} else if (moveRight) {
				velocity.x += speed * delta;
				moveDirection.x = 1;
			}


			var camObject = controls.getObject();

			var isCollision = false;
			if (moveDirection.length() > 0) {

				// rotate the move-direction by the camera-angle
				var axis = new THREE.Vector3(0, 1, 0);
				moveDirection.applyAxisAngle(axis, camObject.rotation.y);

				// set origin and direction of the raycaster
				raycaster.set(camObject.position, moveDirection);

				// detect collisions. Note: Only one ray is used to detect the collision, but this ray always points in the direction of the movement
				var intersections = raycaster.intersectObjects(collisionObjects, true);
				isCollision = intersections.length > 0;
			}


			// Do not move on collision. Changing the moving direction or stopping moving resets the collision
			if (isCollision) {
				velocity.x = 0;
				velocity.z = 0;
			}

			var len = velocity.length() * delta;
			if (len > raycaster.far) {
				console.log('Raycasting error: The moving-distance is bigger than the raycasting-length: ' + len);
				velocity.x = 0;
				velocity.z = 0;
			}

			camObject.translateX(velocity.x * delta);
			camObject.translateZ(velocity.z * delta);

			if (showStats) {
				blocker.setHUDMessage(
					'X:' + Math.floor(camObject.position.x) +
					' Y:' + Math.floor(camObject.position.y) +
					' Z:' + Math.floor(camObject.position.z) +
					' Dir:' + Math.abs(Math.floor(tools.rad2deg(camObject.rotation.y) % 360)));
			}

			if (skyBox) {
				skyBox.position.set(camObject.position.x, camObject.position.y, camObject.position.z);
			}

			renderCallbacks.forEach(function (c) {
				c(scene, camObject, delta);
			});
		}
		prevTime = time;
		renderer.render(scene, camera);

		if (showStats) {
		    blocker.endMeasure();
		}
	},


	setShadow = function (obj, cast, receive) {

		if (obj === undefined)
			return;

		obj.castShadow = cast;
		obj.receiveShadow = receive;

		if (obj.children !== undefined) {
			obj.children.forEach(function (c) {
				setShadow(c, cast, receive);
			});
		}
	},



	stopMovement = function () {
		controlsEnabled = false;
		controls.enabled = false;
		velocity.x = 0;
		velocity.z = 0;
		moveForward = false;
		moveBackward = false;
		moveLeft = false;
		moveRight = false;
	},




	// get the lock.
	initializeLock = function () {



		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

		if (havePointerLock) {
			var element = document.body;
			var pointerlockchange = function () {

				isLocked = document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element;

				if (isLocked) {
					controlsEnabled = true;
					controls.enabled = true;
					blocker.hide();
				} else {
					stopMovement();
					blocker.show();
				}

			};

			var pointerlockerror = function () {
				blocker.setErrorMessageLocking();
			};

			var enterLock = function () {


				blocker.hideContent();

				// Ask the browser to lock the pointer
				element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

				if (/Firefox/i.test(navigator.userAgent)) {
					//console.log('it is firefox');
					var fullscreenchange = function () {

						if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

							document.removeEventListener('fullscreenchange', fullscreenchange);
							document.removeEventListener('mozfullscreenchange', fullscreenchange);

							element.requestPointerLock();
						}

					};

					document.addEventListener('fullscreenchange', fullscreenchange, false);
					document.addEventListener('mozfullscreenchange', fullscreenchange, false);

					element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

					element.requestFullscreen();

				} else {
					element.requestPointerLock();
				}
			};

			// Hook pointer lock state change events
			document.addEventListener('pointerlockchange', pointerlockchange, false);
			document.addEventListener('mozpointerlockchange', pointerlockchange, false);
			document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

			document.addEventListener('pointerlockerror', pointerlockerror, false);
			document.addEventListener('mozpointerlockerror', pointerlockerror, false);
			document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

			blocker.setCallbacks({

				start: function () {
					if (isLoadingComplete) {
						enterLock();
					}
				},

				loadRequest: function (room) {
					// TODO
					console.log(room);
				}
			});

			isLockInitialized = true;


		} else {
			blocker.setErrorMessageNoAPI();
		}

	},



	loadSkyBox = function () {

		var imagePrefix = "images/skybox/purplenebula_",
		directions = ["ft", "bk", "up", "dn", "rt", "lf"],
		imageSuffix = ".png",
		skyGeometry = new THREE.CubeGeometry(5000, 5000, 5000),
		materialArray = [];

		for (var i = 0; i < 6; i++)
			materialArray.push(new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
				side: THREE.BackSide
			}));
		var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
		skyBox = new THREE.Mesh(skyGeometry, skyMaterial);

		scene.add(skyBox);
	};

	return {


		run: function () {
			if (scene === undefined) {
				throw new Error('The engine was not initialized. Call "init" first');
			}
			animate();
		},

		// Gets the loader which can be used to load models for the rooms
		loader: loader1,

		// Hides the visual blocker. Can be used when all models are already in the cache of the room
		// and no other models need to be loaded
		hideBlockerOverride: function () {
			blocker.setMessageReady();
			isLoadingComplete = true;
			if (isLocked) {
				controlsEnabled = true;
				controls.enabled = true;
				blocker.hide();
			}
		},

		// Setup the scene
		init: function () {

		   
			blocker.setMessageInit();

			manager.onProgress = function (item, loaded, total) {
				var percentComplete = loaded / total * 100;               
				blocker.setMessageProgress( Math.round(percentComplete, 2));
			};

			manager.onLoad = function () {
				console.log('Loader complete event');
				blocker.setMessageReady();
				isLoadingComplete = true;
				if (!isLockInitialized) {              
					initializeLock();
				} else if (isLocked) {
					controlsEnabled = true;
					controls.enabled = true;
					blocker.hide();
				}
			};

			manager.onError = function () {
				console.log('there has been an error during the loading');
			};

			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 11000);

			scene = new THREE.Scene();

			loadSkyBox();

			var light = new THREE.AmbientLight(0x404040); // soft white light
			scene.add(light);

			controls = new THREE.PointerLockControls(camera);
			scene.add(controls.getObject());

			var onKeyDown = function (event) {
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

						case 80: // p

							showStats = !showStats;

							if (showStats) {
								blocker.showHUD();
							} else {
								blocker.hideHUD();
							}
							
							break;

					}
				}
			};

			var onKeyUp = function (event) {

			  
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

			};

			document.addEventListener('keydown', onKeyDown, false);
			document.addEventListener('keyup', onKeyUp, false);

			raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

			renderer = new THREE.WebGLRenderer({
				antialias: true
			});

			renderer.setClearColor(0xffffff);
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.shadowMapEnabled = true;
			renderer.shadowMapType = THREE.PCFSoftShadowMap;
			renderer.shadowMapSoft = true;

			document.body.appendChild(renderer.domElement);

			window.addEventListener('resize', onWindowResize, false);
		   
		},

		// Sets the shadow flags for the given model
		setShadowFlags: function (obj, cast, receive) {

			setShadow(obj, cast, receive);
		},

		// Sets the camera to a new position, if required rotates the camera into a new direction
		setCamera: function (pos, angle) {

			stopMovement();
			var camObject = controls.getObject();
			
			if(pos instanceof THREE.Vector3) {					
				
				camObject.position.x = pos.x;
				camObject.position.y = pos.y;
				camObject.position.z = pos.z;
			} else {
				camObject.position.x = 0;
				camObject.position.y = 0;
				camObject.position.z = 0;
			}

			if (angle !== undefined) {
				camObject.rotation.y += angle;
			}
		},

		// Add a new object into the scene and to the collision detection
		addObject: function (mesh, renderCallback, doRegisterForCollision) {

			if (doRegisterForCollision === true) {
				collisionObjects.push(mesh);
			} else {
				untouchableObjects.push(mesh);
			}

			scene.add(mesh);
			if (renderCallback !== undefined) {
				renderCallbacks.push(renderCallback);
			}
		},

		// Add a callback which gets executed every frame
		addRenderCallback : function(renderCallback) {
			if (renderCallback !== undefined) {
				renderCallbacks.push(renderCallback);
			}
		},

		// Removes all objects from the scene exept the skybox.
		removeAddedObjects: function (doneCallback) {

			isLoadingComplete = false;
			blocker.setMessageProgress(0);
			
			stopMovement();
			
			blocker.show(function() {
				collisionObjects.forEach( function (mesh) {
					scene.remove(mesh);
				});

				untouchableObjects.forEach( function (mesh) {
					scene.remove(mesh);
				});


				untouchableObjects.length = 0;
				collisionObjects.length = 0;
				renderCallbacks.length = 0;
				
				if(doneCallback !== undefined) {
					doneCallback();
				}
			});                                
		},
		
		// Gets wether the world is empty and a new room can be loaded
		isEmptyWorld: function() {
			return untouchableObjects.length + collisionObjects.length === 0;
		},

		// Sets the speed of movement and the length of the collision detection
		configureMovement: function (speedInc) {

			if (typeof speedInc === 'number') {
				speed = speedInc;
			} else {
				speed = 400.0;
			}

			raycaster.far = speed / 20;          
		},
	};
});