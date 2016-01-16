requirejs(["engine", "room1", "room2"], function (engine, room1, room2) {

    // initialize the renderer
    engine.init();

    

    // Set the callback which gets executed when room1 is left
    room1.setLeaveCallback(function (door) {
        room2.enter(room2.door);
    });

    // Set the callback which gets executed when room1 is left
    room2.setLeaveCallback(function (door) {
        room1.enter(room1.door);
    });

    // Start the animation
    engine.run();

    // Load room1
    room1.enter();
});