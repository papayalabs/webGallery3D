define(["tools", "three"], function (tools) {

  
    var spriteList = [],

        spriteConfig = {
            fontsize: 14,
            borderColor: { r: 118, g: 118, b: 162, a: 1.0 },
            backgroundColor: { r: 209, g: 209, b: 224, a: 0.8 }
        },

        

        makeTextSprite = function (message, parameters) {

            /*
                Three.js "tutorials by example"
                Author: Lee Stemkoski
                Date: July 2013 (three.js v59dev)
            */


            if (parameters === undefined) parameters = {};


            var margin = parameters.hasOwnProperty("margin") ?
                parameters["margin"] : 2;

            var fontface = parameters.hasOwnProperty("fontface") ?
                parameters["fontface"] : "Arial";

            var fontsize = parameters.hasOwnProperty("fontsize") ?
                parameters["fontsize"] : 18;

            var borderThickness = parameters.hasOwnProperty("borderThickness") ?
                parameters["borderThickness"] : 1;

            var borderColor = parameters.hasOwnProperty("borderColor") ?
                parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

            var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
                parameters["backgroundColor"] : { r: 255, g: 255, b: 255, a: 1.0 };

            
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            context.font = fontsize + "px " + fontface;


            var messages = message.split('|');

            var width = 0;
            var height = borderThickness + margin * 2 + (fontsize + borderThickness) * messages.length;
            messages.forEach(function (m) {
                // get size data (height depends only on font size)
                var metrics = context.measureText(m);
                if (metrics.width > width) {
                    width = metrics.width;
                }
            });

            width += borderThickness * 2 + margin * 2;

            canvas.width = width;
            canvas.height = height;
           
            // background color
            context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                                          + backgroundColor.b + "," + backgroundColor.a + ")";
            // border color
            context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                                          + borderColor.b + "," + borderColor.a + ")";

            context.lineWidth = borderThickness;
            roundRect(context, borderThickness / 2, borderThickness / 2, width - borderThickness, height - borderThickness, 0);
           
            // text color
            context.fillStyle = "rgba(0, 0, 0, 1.0)";

            messages.forEach(function (m, i) {

                var metrics = context.measureText(m);

                var x = (width / 2 - metrics.width / 2);
                var y = borderThickness + margin + (i + 1) * fontsize;
                context.fillText(m, x, y);
            });

           
            // canvas contents will be used for a texture
            var texture = new THREE.Texture(canvas)
            texture.needsUpdate = true;
            texture.minFilter = THREE.LinearMipMapNearestFilter;
            texture.magFilter = THREE.LinearMipMapNearestFilter;

            var mmm = new THREE.MeshBasicMaterial(
                {
                    map: texture
                });

            var geometry = new THREE.PlaneGeometry(width / 4, height / 4);

            var plane = new THREE.Mesh(geometry, mmm);

            return plane;
            //var spriteMaterial = new THREE.SpriteMaterial(
            //    {
            //        map: texture
            //    });

            //var sprite = new THREE.Sprite(spriteMaterial);
            //sprite.scale.set(100, 50, 1.0);
            //return sprite;
        },

        // function for drawing rounded rectangles
        roundRect = function (ctx, x, y, w, h, r) {

            /*
                Three.js "tutorials by example"
                Author: Lee Stemkoski
                Date: July 2013 (three.js v59dev)
            */

            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        };



    return {
        addSprites: function (scene, culture, config) {

            var sprite;

            if (tools.isArray(config)) {
                config.forEach(function (label) {

                    if (label.text !== undefined && label.position != undefined) {

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