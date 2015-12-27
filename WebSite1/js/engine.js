define(["three.min", "PointerLockControls", "AssimpJSONLoader"], function () {
    var camera, scene, renderer;
    var skyBox;
    var controls;
    var collisionObjects = [];
    var untouchableObjects = [];
    var raycaster;
    var renderCallbacks = [];
    var controlsEnabled = false;
    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
    var isLocked = false;
    var isLockInitialized = false;
    var isLoadingComplete = false;
    var prevTime = performance.now();
    var velocity = new THREE.Vector3();

    var manager = new THREE.LoadingManager();
    var loader1 = new THREE.AssimpJSONLoader(manager);


    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    };


    var animate = function () {
        requestAnimationFrame(animate);

        if (controlsEnabled) {



            var moveDirection = new THREE.Vector3();
            var time = performance.now();
            var delta = (time - prevTime) / 1000;

            // Set speed and move-direction

            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;

            if (moveForward) {
                velocity.z -= 400.0 * delta;
                moveDirection.z = -1;
            } else if (moveBackward) {
                velocity.z += 400.0 * delta;
                moveDirection.z = 1;
            }

            if (moveLeft) {
                velocity.x -= 400.0 * delta;
                moveDirection.x = -1;
            } else if (moveRight) {
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
                var intersections = raycaster.intersectObjects(collisionObjects, true);
                isCollision = intersections.length > 0;
            }


            // Do not move on collision. Changing the moving direction or stopping moving resets the collision
            if (isCollision) {
                velocity.x = 0;
                velocity.z = 0;
            }

            camObject.translateX(velocity.x * delta);
            camObject.translateZ(velocity.z * delta);

            if (skyBox) {
                skyBox.position.set(camObject.position.x, camObject.position.y, camObject.position.z);
            }

            renderCallbacks.forEach(function (c) {
                c(scene, camObject, delta);
            })

            prevTime = time;

        }
        
        renderer.render(scene, camera);

    };


    var setShadow = function (obj, cast, receive) {

        if (obj === undefined)
            return;

        obj.castShadow = cast;
        obj.receiveShadow = receive;

        if (obj.children != undefined) {
            obj.children.forEach(function (c) {
                setShadow(c, cast, receive)
            });
        }
    };

   

    var setLoadMessage = function (msg) {
        var messageSpan = document.getElementById('messageSpan');
        messageSpan.innerHTML = msg;
    };


    var showBlocker = function () {
        controlsEnabled = false;
        controls.enabled = false;

        var blocker = document.getElementById('blocker');
        var instructions = document.getElementById('instructions');

        blocker.style.display = '-webkit-box';
        blocker.style.display = '-moz-box';
        blocker.style.display = 'box';

        instructions.style.display = '';
    };

    var hideBlocker = function () {
        controlsEnabled = true;
        controls.enabled = true;
        var blocker = document.getElementById('blocker');
        blocker.style.display = 'none';
    };

    // get the lock.
    var initializeLock = function () {

       
        var instructions = document.getElementById('instructions');               
        var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

        if (havePointerLock) {           
            var element = document.body;        
            var pointerlockchange = function (event) {

                isLocked = document.pointerLockElement === element
                    || document.mozPointerLockElement === element
                    || document.webkitPointerLockElement === element;

                if (isLocked) {                   
                    hideBlocker();
                } else {                  
                    showBlocker();
                }

            };

            var pointerlockerror = function (event) {

                instructions.style.display = '';

            };

            var enterLock = function (event) {

               
                instructions.style.display = 'none';

                // Ask the browser to lock the pointer
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

                if (/Firefox/i.test(navigator.userAgent)) {
                    //console.log('it is firefox');
                    var fullscreenchange = function (event) {

                        if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

                            document.removeEventListener('fullscreenchange', fullscreenchange);
                            document.removeEventListener('mozfullscreenchange', fullscreenchange);

                            element.requestPointerLock();
                        }

                    }

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

            var messageSpan = document.getElementById('messageSpan');
            messageSpan.addEventListener('click', function (event) {
                if (isLoadingComplete) {                   
                   enterLock();                   
                }
                
            }, false);

            isLockInitialized = true;
            

        } else {

            instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
        }

    };

  

    var loadSkyBox = function () {
        try {
            var imagePrefix = "images/skybox/purplenebula_";
            var directions = ["ft", "bk", "up", "dn", "rt", "lf"];
            var imageSuffix = ".png";
            var skyGeometry = new THREE.CubeGeometry(5000, 5000, 5000);

            var materialArray = [];
            for (var i = 0; i < 6; i++)
                materialArray.push(new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
                    side: THREE.BackSide
                }));
            var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
            skyBox = new THREE.Mesh(skyGeometry, skyMaterial);

            scene.add(skyBox);

        } catch (ex) {}
    };

    return {

        // Gets the loader which can be used to load models for the rooms
        loader: loader1,

        // Hides the visual blocker. Can be used when all models are already in the cache of the room
        // and no other models need to be loaded
        hideBlockerOverride: function () {
            setLoadMessage('Klicken, um fortzufahren');
            isLoadingComplete = true;
            if (isLocked) {
                hideBlocker();
            }
        },

        // Setup the scene
        init: function () {

            manager.onProgress = function (item, loaded, total) {
                var percentComplete = loaded / total * 100;
                var msg = Math.round(percentComplete, 2) + '% heruntergeladen';
                setLoadMessage(msg);
            };

            manager.onLoad = function () {
                console.log('Loader complete event');
                setLoadMessage('Klicken, um zu Starten');
                isLoadingComplete = true;
                if (!isLockInitialized) {              
                    initializeLock();
                } else if (isLocked) {
                    hideBlocker();
                }
            };

            manager.onError = function () {
                console.log('there has been an error');
            };

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 11000);

            scene = new THREE.Scene();

            loadSkyBox();

            var light = new THREE.AmbientLight(0x404040); // soft white light
            scene.add(light);

            controls = new THREE.PointerLockControls(camera);
            scene.add(controls.getObject());

            var onKeyDown = function (event) {

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

            animate();
        },

        // Sets the shadow flags for the given model
        setShadowFlags: function (obj, cast, receive) {

            setShadow(obj, cast, receive);
        },

        // Sets the camera to a new position
        setCamera: function(x, y, z) {
            var camObject = controls.getObject();
            camObject.position.x = x;
            camObject.position.y = y;
            camObject.position.z = z;

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
        removeAddedObjects: function () {

            isLoadingComplete = false;
            setLoadMessage('Lade neuen Raum. ESC für Mauscursor');
            showBlocker();
           
            collisionObjects.forEach(
                function (mesh) {
                    scene.remove(mesh);
                });

            untouchableObjects.forEach(
                function (mesh) {
                    scene.remove(mesh);
                });


            untouchableObjects.length = 0;
            collisionObjects.length = 0;
            renderCallbacks.length = 0;
        },

    }
});