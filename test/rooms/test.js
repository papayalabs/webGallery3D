

// simulate require-js
define = function(dependencies, callback)
{

	console.log(dependencies);

	var camera = new THREE.Vector3(-1, -1, -1);
	
	
	var renderCallbacks = [],      
				
		// Create the mockup which simulates the engine
		engineMockup = {
						
			// Sets the camera to a new position
			setCamera: function (pos) {	
				console.log("mockup-engine: Setting camera to " + pos.x + ", "+ pos.y + ", "+ pos.z  );
				camera = pos;
			},
	
			// Add a callback which gets executed every frame
			addRenderCallback : function(renderCallback) {
				if (renderCallback !== undefined) {
					renderCallbacks.push(renderCallback);
					console.log("mockup-engine: adding render-callback");
				}
			},

			// Removes all objects from the scene exept the skybox.
			removeAddedObjects: function () {							
				renderCallbacks.length = 0;
				console.log("mockup-engine: all render-callbacks deleted");
			},

			
		};
	
	// execute the callback from the require-'define'-function
	var roomFactory = callback(engineMockup);
	
	QUnit.start();

	QUnit.test("Create an empty room", function(assert) {
		
		var emptyRoom = roomFactory.createRoom();
		
		assert.ok(emptyRoom.enter !== undefined, "An empty room was created");
		
		camera = new THREE.Vector3(-1, -1, -1);
		emptyRoom.enter();
		assert.strictEqual(camera.x, 0, "The X-Position of the camerta was set correct");
		assert.strictEqual(camera.y, 0, "The Y-Position of the camerta was set correct");
		assert.strictEqual(camera.z, 0, "The Z-Position of the camerta was set correct");
		
	});
	
	
	
	QUnit.test("Create an empty room", function(assert) {
		
		var enterCnt = 0, preenterCnt = 0;		
		var room = roomFactory.createRoom();
		
		room.configure({
			// Define the callback which gets executed before the room is loaded
			onPreenter : function() {
				preenterCnt++;
				console.log("room: 'onPreenter' was called");
			},
			
			// Define the callback which gets executed after the room was loaded
			onEnter : function() {
				enterCnt++;
				console.log("room: 'onEnter' was called");
			},
			
			// Set the start-position which is used when no door-number was provided
			start : new THREE.Vector3(0, 70, -100),
			
			// Set the array of doors.
			// Each door must have a 'entryPosition' which is used on entering the room and
			// an function 'isLeaving' which is used to check if the room should be left.
			// The return value must be an boolean.
			doors : [
				{
					entryPosition: new THREE.Vector3(90, 70, 250),
					isLeaving: function (position) {
						return position.z > 260;
					}
				}
			],
		});
		
		// Delete all stored render callbacks
		renderCallbacks.length = 0;
		
		camera = new THREE.Vector3(-1, -1, -1);
		
		console.log("Enter without door");
		room.enter();
		assert.strictEqual(camera.x, 0, "The X-Position of the camerta was set correct");
		assert.strictEqual(camera.y, 70, "The Y-Position of the camerta was set correct");
		assert.strictEqual(camera.z, -100, "The Z-Position of the camerta was set correct");
		
		camera = new THREE.Vector3(-1, -1, -1);
		
		console.log("Enter on door 0");
		room.enter(0);
		assert.strictEqual(renderCallbacks.length, 2, "Two render-callbacks were added.");
		assert.strictEqual(enterCnt, 2, "The enter-event was fired twice");
		assert.strictEqual(preenterCnt, 2, "The pre-enter-event was fired twice");
		
		assert.strictEqual(camera.x, 90, "The X-Position of the camerta was set correct");
		assert.strictEqual(camera.y, 70, "The Y-Position of the camerta was set correct");
		assert.strictEqual(camera.z, 250, "The Z-Position of the camerta was set correct");
	});
	
};