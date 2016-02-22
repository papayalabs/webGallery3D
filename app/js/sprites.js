define(["tools", "three"], function (tools) {

  
    var spriteList = [],

        spriteConfig = {
            fontsize: 12,            
            backgroundColor: { r: 0, g: 0, b: 0, a: 0.8 }
        },



        makeTextSprite = function (message, parameters) {

            /*
                Three.js "tutorials by example"
                Author: Lee Stemkoski
                Date: July 2013 (three.js v59dev)
            */

            var margin, fontface, fontsize, backgroundColor,
                material, texture, geometry, plane,
                height = 0,
                width = 0,
                messages = [],
                canvas = document.createElement('canvas'),
                context = canvas.getContext('2d');


            if (parameters === undefined) parameters = {};


            margin = parameters.hasOwnProperty("margin") ?
                parameters.margin : 10;

            fontface = parameters.hasOwnProperty("fontface") ?
                parameters.fontface : "Arial";

            fontsize = parameters.hasOwnProperty("fontsize") ?
                parameters.fontsize : 18;

           
            backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
                parameters.backgroundColor : { r: 255, g: 255, b: 255, a: 1.0 };

            if (message !== undefined) {
                messages = message.split('|');
            }

            // Calculate the max width
            context.font = fontsize + "px " + fontface;                     
            height = margin * 2 + fontsize * messages.length;
            messages.forEach(function (m) {               
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
            context.font = fontsize + "px " + fontface;

            messages.forEach(function (m, i) {

                var metrics = context.measureText(m);

                var x = (width / 2 - metrics.width / 2);
                var y = margin + (i + 1) * fontsize;
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
        addSprites: function (scene, culture, config) {

            var sprite;

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

        removeAllSprites: function (scene) {
            spriteList.forEach(function (spriteMesh) {
                scene.remove(spriteMesh);
            });
            spriteList.length = 0;
        },

    };

});