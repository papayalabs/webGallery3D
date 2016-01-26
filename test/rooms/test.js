

// simulate require-js
define = function(dependencies, callback)
{

	console.log(dependencies);

	
	var cameraPositions = [];
	
	var renderCallbacks = [],      
				
		// Create the mockup which simulates the engine
		engineMockup = {
						
			// Sets the camera to a new position
			setCamera: function (pos) {	
				console.log("mockup-engine: Setting camera to " + pos.x + ", "+ pos.y + ", "+ pos.z  );
				cameraPositions.push(pos);				
			},
	
			// Add a callback which gets executed every frame
			addRenderCallback : function(renderCallback) {
				if (renderCallback !== undefined) {
					renderCallbacks.push(renderCallback);
					console.log("mockup-engine: adding render-callback");
				}
			},

			// Removes all objects from the scene exept the skybox.
			removeAddedObjects: function (doneCallback) {							
				renderCallbacks.length = 0;
				console.log("mockup-engine: all render-callbacks deleted");
				
				if(doneCallback !== undefined) {
					doneCallback();
				};
			},

			forceFrame: function(pos) {
				renderCallbacks.forEach(function (c) {
					c(undefined, { position: pos }, 0);
				}); 
			},
		};
	
	// execute the callback from the require-'define'-function
	var roomFactory = callback(engineMockup);
	
	QUnit.start();

	QUnit.test("Create an empty room", function(assert) {
				
		cameraPositions.length = 0;				
		var emptyRoom = roomFactory.createRoom();
		
		assert.ok(emptyRoom.enter !== undefined, "An empty room was created");
				
		emptyRoom.enter();
		assert.strictEqual(cameraPositions[0].x, 0, "The X-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[0].y, 0, "The Y-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[0].z, 0, "The Z-Position of the camerta was set correct");
		
	});
	
	
	QUnit.test("Create two rooms", function(assert) {
						
		cameraPositions.length = 0;
		var r1 = roomFactory.createRoom();
		var r2 = roomFactory.createRoom();
	
		r1.configure({
			
			// Set the start-position which is used when no door-number was provided
			start : new THREE.Vector3(1, 2, 3),		
		});
		
		
		r2.configure({
			
			// Set the start-position which is used when no door-number was provided
			start : new THREE.Vector3(4, 5, 6),
						
		});
		
		r1.enter();
		r2.enter();
		
		
		assert.strictEqual(cameraPositions[0].x, 1, "The X-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[0].y, 2, "The Y-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[0].z, 3, "The Z-Position of the camerta was set correct");
		
		assert.strictEqual(cameraPositions[1].x, 4, "The X-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[1].y, 5, "The Y-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[1].z, 6, "The Z-Position of the camerta was set correct");
	});
	
	
	
	QUnit.test("Create a room and check settings", function(assert) {
		
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
		
		cameraPositions.length = 0;		
				
		console.log("Enter without door");
		room.enter();
		console.log("Enter on door 0");
		room.enter(0);
		
		assert.strictEqual(cameraPositions.length, 2, "The camera-position was set two times");
		
		assert.strictEqual(cameraPositions[0].x, 0, "The X-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[0].y, 70, "The Y-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[0].z, -100, "The Z-Position of the camerta was set correct");
					
		assert.strictEqual(renderCallbacks.length, 2, "Two render-callbacks were added.");
		assert.strictEqual(enterCnt, 2, "The enter-event was fired twice");
		assert.strictEqual(preenterCnt, 2, "The pre-enter-event was fired twice");
		
		assert.strictEqual(cameraPositions[1].x, 90, "The X-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[1].y, 70, "The Y-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[1].z, 250, "The Z-Position of the camerta was set correct");
	});
	
	QUnit.test("Create a room with invalid door", function(assert) {
				
		var room = roomFactory.createRoom();
		
		room.configure({
			
			// Set the start-position which is used when no door-number was provided
			start : new THREE.Vector3(0, 70, -100),
			
			// Set the array of doors.
			// Each door must have a 'entryPosition' which is used on entering the room and
			// an function 'isLeaving' which is used to check if the room should be left.
			// The return value must be an boolean.
			doors : [
				{
					// empty object as door
				}
			],
		});
		
		
		cameraPositions.length = 0;
		
		console.log("Enter without door");
		room.enter();
		console.log("Enter on door 0, which has no properties");
		room.enter(0);
		
		assert.strictEqual(cameraPositions.length, 2, "The camera-position was set two times");
		assert.strictEqual(cameraPositions[0].x, 0, "The X-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[0].y, 70, "The Y-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[0].z, -100, "The Z-Position of the camerta was set correct");		
		assert.strictEqual(cameraPositions[1].x, 0, "The X-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[1].y, 70, "The Y-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[1].z, -100, "The Z-Position of the camerta was set correct");
	});
	
	
	
	
	
	
	
	
	QUnit.test("Create a room with invalid start-position", function(assert) {
				
		var room = roomFactory.createRoom();
		
		room.configure({
			
			// Set the start-position which is used when no door-number was provided
			start : {
				text: "this is not an valid start-position-object"
			},
			
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
		
		
		cameraPositions.length = 0;
		
		console.log("Enter without door");
		room.enter();
		assert.strictEqual(cameraPositions.length, 1, "The camera-position was set once");
		assert.strictEqual(cameraPositions[0].x, 0, "The X-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[0].y, 0, "The Y-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[0].z, 0, "The Z-Position of the camerta was set correct");
				
	});
	
	
	
	
	
	
	QUnit.test("Create a room and check the leaving-callback", function(assert) {
		
		var done = assert.async();
		var enterCnt = 0, preenterCnt = 0, expectedDoorNumber = -1;
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
			
			leaving : function(door){
				console.log("Leaving through door number " + door);
				assert.strictEqual(door, expectedDoorNumber, "The door was left through the right door");
				done();
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
						return position.x === 91;
					}
				},
				{
					entryPosition: new THREE.Vector3(100, 70, 250),
					isLeaving: function (position) {
						return position.x === 101;
					}
				},
				{
					entryPosition: new THREE.Vector3(120, 70, 250),
					isLeaving: function (position) {
						return position.x == 121;
					}
				}
			],
		});
		
		// Delete all stored render callbacks
		renderCallbacks.length = 0;
		
		cameraPositions.length = 0;
		room.enter(0);
		assert.strictEqual(cameraPositions.length, 1, "The camera-position was set once");
		assert.strictEqual(cameraPositions[0].x, 90, "The X-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[0].y, 70, "The Y-Position of the camerta was set correct");
		assert.strictEqual(cameraPositions[0].z, 250, "The Z-Position of the camerta was set correct");
		
		expectedDoorNumber = 1;
		engineMockup.forceFrame(new THREE.Vector3(101, 70, 250));
		
		
	});
	
};