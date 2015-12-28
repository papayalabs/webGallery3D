define([], function () {

    var messageSpan = document.getElementById('messageSpan');
    var blocker = document.getElementById('blocker');
    var instructions = document.getElementById('instructions');

    return {
        setLoadMessage : function (msg) {
            
            messageSpan.innerHTML = msg;
        },

        show: function () {                  
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';

            instructions.style.display = '';
        },


        hide: function () {
            //controlsEnabled = true;
            //controls.enabled = true;            
            blocker.style.display = 'none';
        },


        showError: function(msg){
            instructions.style.display = '';
            instructions.innerHTML = msg;
        },


        hideInstructions: function () {
            instructions.style.display = 'none';
        },

    }
});