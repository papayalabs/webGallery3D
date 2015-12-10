define(["three.min", "AssimpJSONLoader", "engine"], function(a,b, engine)
{
    // Load button model using the AssimpJSONLoader
    var loader1 = new THREE.AssimpJSONLoader();
    var deg90 = Math.PI / 2;
	
  
	
	
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };
	
   
    var setShadowFlags = function (obj, cast, receive) {

        if (obj === undefined)
            return;

        obj.castShadow = cast;
        obj.receiveShadow = receive;

        if (obj.children != undefined) {
            obj.children.forEach(function (c) { setShadowFlags(c, cast, receive) });
        }
    };

	
    var loadHouse = function () {
        try {
            loader1.load('models/galleryv2.json', function (object) {


                object.rotation.x = deg90 * -1;
                object.rotation.z = 0;
                object.rotation.y = 0;
                object.position.y = -20;
               
                setShadowFlags(object, true, true);
                engine.addObject(object, undefined, true);

            }, onProgress, onError);
        }
        catch (ex)
        { }
    };

    var loadimage1 = function () {
        try {
            loader1.load('models/imagecol1.json', function (object) {

                object.scale.multiplyScalar(0.04);
                object.position.set(96, -20, 0);              
                setShadowFlags(object, true, true);
                engine.addObject(object, undefined, true);

            }, onProgress, onError);
        }
        catch (ex)
        { }
    };


    var loadSkyBox = function () {
        try {
            var imagePrefix = "images/purplenebula_";
            //var directions = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
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
            var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
            engine.addObject(skyBox, function (scene) {
                var me = engine.getMe();
                var pos = me.position;
                skyBox.position.set(pos.x, pos.y, pos.z);
                });

        }
        catch (ex)
        { }
    };
	
    var loadLight = function () {

       
        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(2, 16, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff }));

        sphere.position.set(0, 0, 0);
        engine.addObject(sphere);

        var directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);       
        directionalLight1.position.set(-300, 300, -300);
        directionalLight1.target = sphere;
        configureLight(directionalLight1);
        engine.addObject(directionalLight1);


        //var directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
        //directionalLight2.position.set(300, 300, -300);
        //directionalLight2.target = sphere;
        //configureLight(directionalLight2);
        //engine.addObject(directionalLight2);
       
	};

	
    var configureLight = function (directionalLight) {
        var d = 200;

        directionalLight.castShadow = true;
        directionalLight.shadowCameraVisible = true;
        directionalLight.shadowDarkness = 0.8;
        directionalLight.shadowMapWidth = 4096;
        directionalLight.shadowMapHeight = 4096;
        directionalLight.shadowCameraLeft = -d;
        directionalLight.shadowCameraRight = d;
        directionalLight.shadowCameraTop = d;
        directionalLight.shadowCameraBottom = -d;
        directionalLight.shadowCameraFar = 7000;

        
    };

	
	engine.getLock();	
	engine.init();
	
	loadSkyBox();
	loadHouse();
	loadLight();	
	loadimage1();
	
	//engine.addObject(new THREE.AxisHelper(100));
	
	engine.start();
	
				

});