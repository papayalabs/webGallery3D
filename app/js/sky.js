define(["three"], function (THREE) {


    var loadedSkyBoxIndex = -1,
        skyBox,


        config = [
            // Skybox 0: Space
            {            
                'prefix': 'images/skybox/purplenebula_',
                'directions': ["ft", "bk", "up", "dn", "rt", "lf"],
                'suffix': '.png'
            }
    ];

    
  
   

    return {
      
        // Set the position of the skybox
        setPosition: function(position) {
            if (!!skyBox) {
                skyBox.position.set(position.x || 0, position.y || 0, position.z || 0);
            }
        },

        // load a new skybox, if required
        loadSkyBox: function (index, scene) {

            var imagePrefix, directions, imageSuffix,
                skyGeometry, skyMaterial,
                materialArray = [];


            if (loadedSkyBoxIndex === index) {
                // No changes made...
                return;
            }

            if (scene === undefined) {
                return;
            }


            if (!!skyBox) {
                //Remove Skybox.
                scene.remove(skyBox);
            }

           

            if (index >= 0 && index < config.length) {

                imagePrefix = config[index].prefix || '';
                directions = config[index].directions || [];
                imageSuffix = config[index].suffix || '';

                skyGeometry = new THREE.BoxGeometry(5000, 5000, 5000);
               
                for (var i = 0; i < 6; i++)
                    materialArray.push(new THREE.MeshBasicMaterial({
                        map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
                        side: THREE.BackSide
                    }));

                skyMaterial = new THREE.MeshFaceMaterial(materialArray);
                skyBox = new THREE.Mesh(skyGeometry, skyMaterial);

                scene.add(skyBox);                
            }

            loadedSkyBoxIndex = index;

            
        }
    };
});