requirejs(["engine", "room1"], function (engine, room1) {

    // initialize the renderer
    engine.init();

    // Set the callback which gets executed when room1 is left
    room1.setLeaveCallback(function () { room1.show(); });

    // Load room1
    room1.show();
});