define(["tools", "three"], function (tools, THREE) {

  
    var spriteList = [],

        spriteConfig = {
            fontsize: 10,
            fontsizeHeader: 18,
            fontStyle: 'normal',
            fontStyleHeader: 'bold',
            backgroundColor: { r: 0, g: 0, b: 0, a: 0.8 }
        },


        buildFontString = function (parameters, isHeader) {

            var fontface, fontsize, fontsizeHeader,
                fontStyle, fontStyleHeader;

            fontface = parameters.hasOwnProperty("fontface") ?
              parameters.fontface : "Arial";

            fontsize = parameters.hasOwnProperty("fontsize") ?
                parameters.fontsize : 10;

            fontsizeHeader = parameters.hasOwnProperty("fontsizeHeader") ?
                parameters.fontsizeHeader : 18;

            fontStyle = parameters.hasOwnProperty("fontStyle") ?
                parameters.fontStyle : 'normal';

            fontStyleHeader = parameters.hasOwnProperty("fontStyleHeader") ?
                parameters.fontStyleHeader : 'bold';

            return (isHeader ? fontStyleHeader : fontStyle) + ' ' + (isHeader ? fontsizeHeader : fontsize) + "px " + fontface;
        },



        makeTextSprite = function (message, parameters) {

            /*
                Three.js "tutorials by example"
                Author: Lee Stemkoski
                Date: July 2013 (three.js v59dev)


                modified by Holger Pfaff Feb 2016
            */

            var margin, fontsize, fontsizeHeader,                
                backgroundColor,
                material, texture, geometry, plane,
                height = 0,
                width = 0,
                messages = [],
                canvas = document.createElement('canvas'),
                context = canvas.getContext('2d');


            if (parameters === undefined) parameters = {};


            margin = parameters.hasOwnProperty("margin") ?
                parameters.margin : 10;

          
            fontsize = parameters.hasOwnProperty("fontsize") ?
                parameters.fontsize : 10;

            fontsizeHeader = parameters.hasOwnProperty("fontsizeHeader") ?
                parameters.fontsizeHeader : 18;
          
            backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
                parameters.backgroundColor : { r: 255, g: 255, b: 255, a: 1.0 };

            if (message !== undefined) {
                messages = message.split('|');
            }

            // Calculate the max width                        
            height = margin * 2 + fontsize * (messages.length - 1) + fontsizeHeader;
            messages.forEach(function (m, i) {

                context.font = buildFontString(parameters, i === 0);

                var metrics = context.measureText(m);
                if (metrics.width > width) {
                    width = metrics.width;
                }
            });

            width += margin * 2;

            canvas.width = width;
            canvas.height = height;

            // background color
            context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
            
            context.fillRect(0, 0, width, height);

            // text color
            context.fillStyle = "rgba(255, 255, 255, 1.0)";
           
            messages.forEach(function (m, i) {

                context.font = buildFontString(parameters, i === 0);
                var metrics = context.measureText(m);

                var x = (width / 2 - metrics.width / 2);
                var y = fontsizeHeader + margin + i * fontsize;
                context.fillText(m, x, y);
            });


            // canvas contents will be used for a texture
            texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            
            material = new THREE.MeshBasicMaterial(
                {
                    map: texture,
                    opacity: 0.7,
                    transparent: true,
                });

            geometry = new THREE.PlaneGeometry(width / 4 , height / 4);
            plane = new THREE.Mesh(geometry, material);
            return plane;            
        };

       


    return {

        // Gets wether there are sprites in the scene
        spritesLoaded: function() {
            return spriteList.length > 0;
        },

        // Create the sprites from the given config, if there are no sprites in the scene
        addSprites: function (scene, culture, config) {

            var sprite;

            // Do not add sprites when there already sprites in the scene
            if (spriteList.length > 0) {
                return;
            }

            if (tools.isArray(config)) {
                config.forEach(function (label) {

                    if (label.text !== undefined && label.position !== undefined) {

                        // Get text to display:
                        var txt = label.text[culture] || '';

                        sprite = makeTextSprite(txt, spriteConfig);
                        sprite.position.set(label.position.x, label.position.y, label.position.z);
                        scene.add(sprite);
                        spriteList.push(sprite);
                    }
                });
            }

        },


        // Remove all sprites from the scene
        removeAllSprites: function (scene) {
            spriteList.forEach(function (spriteMesh) {
                scene.remove(spriteMesh);
            });
            spriteList.length = 0;
        },

    };

});