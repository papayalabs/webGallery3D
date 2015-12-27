define(["engine", "three.min"], function (engine) {

    var leaveCallback;

    var house;
   
    var deg90 = Math.PI / 2;

    var loadHouse = function () {
       
        try {

            var addToEngine = function (object) {                
                engine.setShadowFlags(object, true, true);
                engine.addObject(object, undefined, true);               
            };

            if (house === undefined) {
                engine.loader.load('models/room2/gallerybox3.json', function (object) {
                    house = object;                    
                    object.rotation.z = 0;
                    object.rotation.y = 0;
                    object.position.y = 0;
                    addToEngine(object);
                });
                return false;
            }
            else {
                addToEngine(house);
                return true;
            }

        } catch (ex) { }       
    };

   

    var loadLight = function () {


        var boxTarget = new THREE.Mesh(
            new THREE.BoxGeometry(0, 0, 0),
            new THREE.MeshBasicMaterial({
                color: 0x000000
            }));

        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(50, 32, 16),
            new THREE.MeshBasicMaterial({
                color: 0xFFFFFF
            }));

        boxTarget.position.set(0, 0, 0);
        engine.addObject(boxTarget);
        engine.addObject(sphere);


        var speed = 300;
        var wayX = 300;
        var wayZ = 300;
        var angle = 0.8;

        var xPosMin = -wayX;
        var xPosMax = wayX;
        var xPos = xPosMin;
        var zPosMin = -wayZ;
        var zPosMax = wayZ;
        var zPos = zPosMax;
        var frameCounter = 0;

        var triggerPosX = false;
        var triggerNegX = false;
        var triggerPosZ = false;
        var triggerNegZ = false;
        var d = 400;

        var directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight1.position.set(xPos, 350, zPos);
        directionalLight1.target = boxTarget;
        directionalLight1.castShadow = true;
        //directionalLight1.shadowCameraVisible = true;
        directionalLight1.shadowDarkness = 0.7;
        directionalLight1.shadowMapWidth = 4096;
        directionalLight1.shadowMapHeight = 4096;
        directionalLight1.shadowCameraLeft = -d;
        directionalLight1.shadowCameraRight = d;
        directionalLight1.shadowCameraTop = d;
        directionalLight1.shadowCameraBottom = -d;
        directionalLight1.shadowCameraFar = 7000;

        sphere.position.set(directionalLight1.position.x, directionalLight1.position.y, directionalLight1.position.z);

        engine.addObject(directionalLight1,
            // callback which gets executed every rendered frame. Checks if the light must be moved
            function (scene, camObject, delta) {

                frameCounter++;
                if (camObject && (triggerPosX || triggerNegX || triggerPosZ || triggerNegZ || frameCounter % 20 == 0)) {


                    var vector = new THREE.Vector3(0, 0, -1);
                    vector.applyEuler(camObject.rotation, camObject.rotation.order);

                    if (vector.x < -angle && xPos < xPosMax && !triggerNegX) {
                        triggerPosX = true;
                    } else if (xPos >= xPosMax) {
                        triggerPosX = false;
                    }

                    if (vector.x > angle && xPos > xPosMin && !triggerPosX) {
                        triggerNegX = true;
                    } else if (xPos <= xPosMin) {
                        triggerNegX = false;
                    }

                    if (vector.z < -angle && zPos < zPosMax && !triggerNegZ) {
                        triggerPosZ = true;
                    } else if (zPos >= zPosMax) {
                        triggerPosZ = false;
                    }

                    if (vector.z > angle && zPos > zPosMin && !triggerPosZ) {
                        triggerNegZ = true;
                    } else if (zPos <= zPosMin) {
                        triggerNegZ = false;
                    }

                    if (triggerPosX) {
                        // move light to positive x
                        xPos += speed * delta;
                        directionalLight1.position.x = xPos;

                    } else if (triggerNegX) {
                        // move light to negative x
                        xPos -= speed * delta;
                        directionalLight1.position.x = xPos;
                    }

                    if (triggerPosZ) {
                        // move light to positive z
                        zPos += speed * delta;
                        directionalLight1.position.z = zPos;

                    } else if (triggerNegZ) {
                        // move light to negative z
                        zPos -= speed * delta;
                        directionalLight1.position.z = zPos;
                    }

                    sphere.position.set(directionalLight1.position.x, directionalLight1.position.y, directionalLight1.position.z);                   
                }
            });

    };

   

    return {

        setLeaveCallback: function(callback) {
            leaveCallback = callback;
        },
        
        show: function (doorname) {

            if (doorname === undefined) {
                engine.setCamera(0, 70, 0);
            } else {
                engine.setCamera(-80, 70, -250);
            }

           
            engine.addRenderCallback(function (scene, camObject, delta) {
                // This callback will be executed every frame. Check the position to see if a new room must be loaded

                if (camObject.position.z <-350) {

                    if (leaveCallback !== undefined) {

                        // delete all objects and callbacks in the scene execpt the skybox
                        engine.removeAddedObjects();

                        // load the new room
                        leaveCallback();
                    }
                }
            });

            loadLight();
            var isHouseCached = loadHouse();
           
            if (isHouseCached ) {
                engine.hideBlockerOverride();
            }
        },

    };
});