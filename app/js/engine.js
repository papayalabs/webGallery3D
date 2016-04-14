define(["blocker", "hud", "tools", "sprites", "sky", "movement", "three", "PointerLockControls", "AssimpJSONLoader"],
	function (blocker, hud, tools, sprites, sky, movement, THREE, PointerLockControls, AssimpJSONLoader) {

		var camera, scene, renderer, controls, 
		   
			labelConfiguration,
			collisionObjects = [],
			untouchableObjects = [],
			renderCallbacks = [],					
			isLocked = false,
			isLockInitialized = false,
			isLoadingComplete = false,
			showStats = false,
			showLabels = true,												
			prevTime = performance.now(),			
			manager = new THREE.LoadingManager(),
			loader1 = new AssimpJSONLoader(manager),
			

		setShadow = function (obj, cast, receive) {

			if (obj === undefined) {		
				return;
			}
			
			obj.castShadow = cast;
			obj.receiveShadow = receive;

			if (obj.children !== undefined) {
				obj.children.forEach(function (c) {
					setShadow(c, cast, receive);
				});
			}
		},
		

		// get the lock.
		initializeLock = function () {

			var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

			if (havePointerLock) {
				var element = document.body;
				var pointerlockchange = function () {

					isLocked = document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element;

					if (isLocked) {
					    movement.enable();
						controls.enabled = true;
						blocker.hide();
					} else {
					    controls.enabled = false;
					    movement.disable();
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
			    movement.enable();
				controls.enabled = true;
				blocker.hide();
			}
		},

		onKeyDown = function (event) {
			if (movement.isEnabled()) {


				switch (event.keyCode) {
				
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

		

		animate = function () {

			var time, delta, camObject;
				

			if (showStats) {
				hud.beginMeasure();
			}

			time = performance.now();
			if (movement.isEnabled()) {
				

				// Limit delta to the max of 1 to avoid jumping on low framerates.
				// Better move slower on low framerates than to jump large steps and run into walls
				delta = Math.min(1, (time - prevTime) / 1000);
				
				camObject = controls.getObject();
				
				
				if (movement.move(camObject, delta, collisionObjects)) {
				    sky.setPosition(camObject.position);
				}

				
				if (showStats) {
					hud.setMessage(
						'X:' + Math.floor(camObject.position.x) +
						' Y:' + Math.floor(camObject.position.y) +
						' Z:' + Math.floor(camObject.position.z) +
						' Dir:' + Math.abs(Math.floor(tools.rad2deg(camObject.rotation.y) % 360)));
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
			document.addEventListener('keydown', movement.onKeyDown, false);
			document.addEventListener('keyup', movement.onKeyUp, false);
		
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

		    controls.enabled = false;
		    movement.disable();
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
			
			controls.enabled = false;
			movement.disable();
			
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

		

		configure: function (speedInc, cameraHeight, labelConfig, skyBox) {

		    movement.configure(speedInc, cameraHeight);
		
			// Set the label-configuration for the current room
			labelConfiguration = labelConfig;
		   

			sky.loadSkyBox( skyBox || 0 , scene);		   
		},
		
	};
});