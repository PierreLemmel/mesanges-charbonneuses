function log(message) {
    script.log(message);
}

function logProperties(input) {
    var properties = util.getObjectProperties(input);
    log(properties);
}

function logMethods(input) {
    var methods = util.getObjectMethods(input);
    log(methods);
}

function arrayLog(array) {
    for (var i = 0; i < array.length; i++) {
        log(array[i]);
    }
}

function init() {
    local.scripts.ableton_osc.enableLog.set(true);
    setupListeners();
}

function test() {
    local.send("/live/test");
}

var tracksCount = 16;
function setupListeners() {
    log("Setting up listeners");
    for (var i = 0; i < tracksCount; i++) {
        local.send("/live/track/start_listen/volume", i);
    }
}


var oscHandlers = [
    {
        path: "/live/error",
        handler: function(data) {
            onErrorMessage(data);
        }
    },
    {
        path: "/live/startup",
        handler: function(data) {
            onStartupMessage(data);
        }
    },
    {
        path: "/live/test",
        handler: function(data) {
            onTestMessage(data);
        }
    },
    {
        path: "/live/track/get/volume",
        handler: function(data) {
            onTrackVolumeMessage(data);
        }
    }
];

function oscEvent(address, args, originIp) {
    
    for (var i = 0; i < oscHandlers.length; i++) {
        if (oscHandlers[i].path == address) {
            oscHandlers[i].handler(args);
            return;
        }
    }

    log("Unhandled message: ");
    log(address);
    arrayLog(args);
}

function onTestMessage(data) {
    log("Test - " + data[0]);
}

function onTrackVolumeMessage(data) {
    var trackIndex = data[0] + 1;
    var volume = data[1];
    
    local.values.tracks["track" + trackIndex].volume.set(volume);
}

function onErrorMessage(data) {
    logError("Ableton OSC Error");
    logError(data[0]);
}

function onStartupMessage(data) {
    setupListeners();
}