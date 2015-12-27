requirejs(["engine", "room1", "room2"], function (engine, room1, room2) {

    // initialize the renderer
    engine.init();

    // Set the callback which gets executed when room1 is left
    room1.setLeaveCallback(function () { room2.show(); });

    // Set the callback which gets executed when room1 is left
    room2.setLeaveCallback(function () { room1.show(); });

    // Load room1
    room1.show();
});