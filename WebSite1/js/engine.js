define(["three.min", "PointerLockControls"], function()
{
	var camera, scene, renderer;
	
	var controls;
	var objects = [];
	var raycaster;
	var animationFrameCallback;
	var renderCallbacks = [];		
	var controlsEnabled = false;
	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var prevTime = performance.now();
	var velocity = new THREE.Vector3();
	
    
	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	};
			
			
	var animate = function() {
		requestAnimationFrame( animate );

		if (controlsEnabled) {


		  
		    var moveDirection = new THREE.Vector3();
			var time = performance.now();
			var delta = ( time - prevTime ) / 1000;

		    // Set speed and move-direction

			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;
			
			if (moveForward) {
			    velocity.z -= 400.0 * delta;
			    moveDirection.z = -1;
			}
			else if (moveBackward) {
			    velocity.z += 400.0 * delta;
			    moveDirection.z = 1;
			}
			
			if (moveLeft) {
			    velocity.x -= 400.0 * delta;
			    moveDirection.x = -1;
			}
			else if (moveRight) {
			    velocity.x += 400.0 * delta;
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
			    var intersections = raycaster.intersectObjects(objects, true);
			    isCollision = intersections.length > 0;
			}

		
            // Do not move on collision. Changing the moving direction or stopping moving resets the collision
			if (isCollision) {
			    velocity.x = 0;
			    velocity.z = 0;
			}
		
			camObject.translateX(velocity.x * delta);
			camObject.translateZ(velocity.z * delta);

		
			prevTime = time;

		}

		if(animationFrameCallback !== undefined)
		{
			animationFrameCallback(scene);
		}
		
		renderCallbacks.forEach(function(c){
			c(scene, camObject, delta);
		})
		
		renderer.render( scene, camera );

	};
		
			
	return {

	  
	    setLoadMessage : function(msg) {
	        var messageSpan = document.getElementById('messageSpan');
	        messageSpan.innerHTML = msg;
	    },
		
		// get the lock.
		getLock : function() {
			
			var blocker = document.getElementById( 'blocker' );
			var instructions = document.getElementById( 'instructions' );
			var messageSpan = document.getElementById('messageSpan');
			messageSpan.innerHTML = 'Click to play';

			var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

			if ( havePointerLock ) {

				var element = document.body;

				var pointerlockchange = function ( event ) {

					if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

						controlsEnabled = true;
						controls.enabled = true;

						blocker.style.display = 'none';

					} else {

						controls.enabled = false;

						blocker.style.display = '-webkit-box';
						blocker.style.display = '-moz-box';
						blocker.style.display = 'box';

						instructions.style.display = '';

					}

				}

				var pointerlockerror = function ( event ) {

					instructions.style.display = '';

				}

				// Hook pointer lock state change events
				document.addEventListener( 'pointerlockchange', pointerlockchange, false );
				document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

				document.addEventListener( 'pointerlockerror', pointerlockerror, false );
				document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
				document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

				instructions.addEventListener( 'click', function ( event ) {

					instructions.style.display = 'none';

					// Ask the browser to lock the pointer
					element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

					if ( /Firefox/i.test( navigator.userAgent ) ) {

						var fullscreenchange = function ( event ) {

							if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

								document.removeEventListener( 'fullscreenchange', fullscreenchange );
								document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

								element.requestPointerLock();
							}

						}

						document.addEventListener( 'fullscreenchange', fullscreenchange, false );
						document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

						element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

						element.requestFullscreen();

					} else {

						element.requestPointerLock();

					}

				}, false );

			} else {

				instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

				//instructions.style.display = 'none';
				//controlsEnabled = true;
				//controls.enabled = true;

				//blocker.style.display = 'none';
			}

		},
		
		// Setup the scene
		init : function() {
			camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 11000 );
			
			scene = new THREE.Scene();

			var light = new THREE.AmbientLight(0x404040); // soft white light
			scene.add(light);

			controls = new THREE.PointerLockControls( camera );
			scene.add( controls.getObject() );

			var onKeyDown = function ( event ) {

				switch ( event.keyCode ) {

					case 38: // up
					case 87: // w
						moveForward = true;
						break;

					case 37: // left
					case 65: // a
						moveLeft = true; break;

					case 40: // down
					case 83: // s
						moveBackward = true;
						break;

					case 39: // right
					case 68: // d
						moveRight = true;
						break;
				
				}

			};

			var onKeyUp = function ( event ) {

				switch( event.keyCode ) {

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

			document.addEventListener( 'keydown', onKeyDown, false );
			document.addEventListener( 'keyup', onKeyUp, false );

			raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
					
			renderer = new THREE.WebGLRenderer({ antialias: true });
			renderer.setClearColor( 0xffffff );
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.shadowMapEnabled = true;
			renderer.shadowMapType = THREE.PCFSoftShadowMap;
			renderer.shadowMapSoft = true;

			document.body.appendChild( renderer.domElement );

		
			window.addEventListener( 'resize', onWindowResize, false );
			
		},
		
		// Add a new object into the scene and to the collision detection
		addObject : function(mesh, renderCallback, doRegisterForCollision) {
			
		    if (doRegisterForCollision === true) {
		        objects.push(mesh);
		    }

			scene.add( mesh );
			if(renderCallback !== undefined)
			{
				renderCallbacks.push(renderCallback);
			}
		},

	
		start : function(callback) {
			animationFrameCallback = callback;
			animate();
		}				
	}		
});