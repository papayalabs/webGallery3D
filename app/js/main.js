requirejs(["engine", "room1", "room2"], function (engine, room1, room2) {

    // initialize the renderer
    engine.init();

    // Set the callback which gets executed when room1 is left
    room1.setLeaveCallback(function (door) {
        room2.show(room2.door);
    });

    // Set the callback which gets executed when room1 is left
    room2.setLeaveCallback(function (door) {
        room1.show(room1.door);
    });

    // Load room1
    room1.show();
});