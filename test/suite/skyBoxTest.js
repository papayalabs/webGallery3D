define(["QUnit", "sky", "three"], function(QUnit, sky, THREE) {


	var skybox,
		testScene = {
			add : function(object) {		
				skybox = object;
				console.log("Skybox was loaded");
			},	
			remove : function(object) {
				skybox = undefined;
				console.log("Skybox was removed");
			}
		};

	
	return {	
		run : function() {
		
			QUnit.test("Load the skybox and set a position", function(assert) {
						
				var done = assert.async();
				
				sky.loadSkyBox(0, testScene);				
				sky.setPosition(new THREE.Vector3(20,30,40));
				
				assert.ok(skybox !== undefined, "The skybox was loaded");
				assert.strictEqual(skybox.position.x, 20, "Setting the X-position of the skybox");
				assert.strictEqual(skybox.position.y, 30, "Setting the X-position of the skybox");
				assert.strictEqual(skybox.position.z, 40, "Setting the X-position of the skybox");
				
				done();
			});	
			
			
			
			QUnit.test("Load the skybox and remove it", function(assert) {
				
				skybox = undefined;
				
				var done = assert.async();				
				
				// Remove skybox
				sky.loadSkyBox(-1, testScene);			
				
				sky.loadSkyBox(0, testScene);								
				assert.ok(skybox !== undefined, "The skybox was loaded");
				sky.loadSkyBox(-1, testScene);			
				assert.ok(skybox === undefined, "The skybox was removed");
				
				done();
			});	
			
			
		}
	}
});