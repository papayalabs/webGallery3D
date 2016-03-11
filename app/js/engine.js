define(["blocker", "hud", "tools", "sprites", "sky", "three", "PointerLockControls", "AssimpJSONLoader"],
	function (blocker, hud, tools, sprites, sky, THREE, PointerLockControls, AssimpJSONLoader) {

		var camera, scene, renderer, controls, raycaster,
			labelConfiguration,
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
			showLabels = true,
			speed = 400.0,
			prevTime = performance.now(),
			velocity = new THREE.Vector3(),
			manager = new THREE.LoadingManager(),
			loader1 = new AssimpJSONLoader(manager),




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


		showRoom = function () {

			//sky.loadSkyBox(0, scene);
			blocker.setMessageReady();

			if (showLabels && !sprites.spritesLoaded()) {
				sprites.addSprites(scene, blocker.getCulture(), labelConfiguration);
			}
		   
			isLoadingComplete = true;
			if (!isLockInitialized) {
				initializeLock();
			} else if (isLocked) {
				controlsEnabled = true;
				controls.enabled = true;
				blocker.hide();
			}
		},

		onKeyDown = function (event) {
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
							hud.show();
						} else {
							hud.hide();
						}

						break;

					case 81:
						showLabels = !showLabels;
						if (showLabels) {
							sprites.addSprites(scene, blocker.getCulture(), labelConfiguration);
						} else {
							sprites.removeAllSprites(scene);
						}
						break;

				}
			}
		},

		onKeyUp = function (event) {


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

		animate = function () {

			var time, moveDirection, delta, camObject, 
				isCollision = false;

			if (showStats) {
				hud.beginMeasure();
			}

			time = performance.now();
			if (controlsEnabled) {
				moveDirection = new THREE.Vector3();

				// Limit delta to the max of 1 to avoid jumping on low framerates.
				// Better move slower on low framerates than to jump large steps and run into walls
				delta = Math.min(1, (time - prevTime) / 1000);
				
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
					
			
				camObject = controls.getObject();
				
				if (moveDirection.length() > 0) {

					// rotate the move-direction by the camera-angle		           
					moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), camObject.rotation.y);

					// Set the length of the collision-detection. Get the length of the current movement-vector
					raycaster.far = Math.max(speed / 20, velocity.length() * delta);

					// set origin and direction of the raycaster
					raycaster.set(camObject.position, moveDirection);

					// detect collisions. Note: Only one ray is used to detect the collision, but this ray always points in the direction of the movement		         
					isCollision = raycaster.intersectObjects(collisionObjects, true).length > 0;
				}


				// Do not move on collision. Changing the moving direction or stopping moving resets the collision
				if (isCollision) {
					velocity.x = 0;
					velocity.z = 0;
				} else {
					camObject.translateX(velocity.x * delta);
					camObject.translateZ(velocity.z * delta);
					sky.setPosition(camObject.position);
				}
				
				if (showStats) {
					hud.setMessage(
						'X:' + Math.floor(camObject.position.x) +
						' Y:' + Math.floor(camObject.position.y) +
						' Z:' + Math.floor(camObject.position.z) +
						' Dir:' + Math.abs(Math.floor(tools.rad2deg(camObject.rotation.y) % 360)) +
						' Spd:' + Math.floor(velocity.length()) +
						' Ray1:' + Math.floor(raycaster.far));
				}
		
				renderCallbacks.forEach(function (c) {
					c(scene, camObject, delta);
				});
			}
			prevTime = time;
			renderer.render(scene, camera);

			if (showStats) {
				hud.endMeasure();
			}

			requestAnimationFrame(animate);
		},

		onWindowResize = function () {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(window.innerWidth, window.innerHeight);

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
			showRoom();
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
				showRoom();
			};

			manager.onError = function () {
				console.log('there has been an error during the loading');
			};

			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 11000);

			scene = new THREE.Scene();

		
			var light = new THREE.AmbientLight(0x404040); // soft white light
			scene.add(light);

			controls = new PointerLockControls(camera);
			scene.add(controls.getObject());

			
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


				// Remove all labels for this room
				sprites.removeAllSprites(scene);
				
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

		

		configure: function (speedInc, labelConfig, skyBox) {

			// Sets the speed of movement and the length of the collision detection
			if (typeof speedInc === 'number') {
				speed = speedInc;
			} else {
				speed = 400.0;
			}
		
			// Set the label-configuration for the current room
			labelConfiguration = labelConfig;
		   

			sky.loadSkyBox( skyBox || 0 , scene);		   
		},
		
	};
});