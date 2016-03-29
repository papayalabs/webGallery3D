define(["QUnit", "sprites"], function (QUnit, sprites) {

	var mockupScene = function()
		{
			var data = [];
			return {
				
				content: function(){
					return data;
				},
				
				add: function(a){					
					data.push(a);
				},
				
				remove: function(a) {
					data = data.filter(function(d) { return d !== a});
				}
			};
		},

		labels = [
			{
				position: {	x: 0, y: 20, z: -200 },
				rotation : 0,
				text: {
					'de': 'America\'s Cupper||2015, Acryl auf Leinwand|Holger Pfaff',
					'en': 'America\'s Cupper||2015, Acrylic on canvas|Holger Pfaff'
				}
			},
			{
				position: { x: 170, y: 140, z: -98 },
				rotation: 270,
				text: {
					'de': 'Winter 1||2012, Acryl auf Leinwand|Holger Pfaff',
					'en': 'Winter 1||2012, Acrylic on canvas|Holger Pfaff'
				}
			},

			{
				position: { x: 170, y: 140, z: -12 },
				rotation: 270,
				text: {
					'de': 'Stadt an der Sonne||2013, Acryl auf Leinwand|Holger Pfaff',
					'en': 'City near the Sun||2013, Acrylic on canvas|Holger Pfaff'
				}
			},

			{
				position: { x: 170, y: 140, z: 78 },
				rotation: 270,
				text: {
					'de': 'Regenwald||2014, Acryl auf Leinwand|Holger Pfaff',
					'en': 'Rainforest||2014, Acrylic on canvas|Holger Pfaff'
				}
			},

			{
				position: { x: -220, y: 70, z: -90 },
				 rotation: 90,
				 text: {
					 'de': 'Felsen und Brandung||2015, Acryl auf Leinwand|Holger Pfaff',
					 'en': 'Rock and Surf||2015, Acrylic on canvas|Holger Pfaff'
				 }
			 },
		];



return {		
		run : function() {
			QUnit.test('Add some labels to the sprite collection', function(assert) {
				var done = assert.async(),
					scene = mockupScene();
				
				assert.strictEqual(scene.content().length, 0, "No labels in the collection");
				
				sprites.addSprites(scene, 'de', labels);
				assert.strictEqual(scene.content().length, 5, "There are 5 labels in the collection");
				
				sprites.addSprites(scene, 'de', labels);
				assert.strictEqual(scene.content().length, 5, "There are still 5 labels in the collection");
				
				sprites.removeAllSprites(scene);
				assert.strictEqual(scene.content().length, 0, "No labels in the collection");
				
				assert.ok(true, 'The labels have all been loaded');
				done();
			});
		}
	}
});