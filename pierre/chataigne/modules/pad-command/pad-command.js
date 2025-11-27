var baseNote = 68;


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

function init() {
    local.scripts.pad_command.enableLog.set(true);

    if (!local.values.pads) {

        var pads = local.values.addContainer("Pads");
        for (var i = 1; i <= 16; i++) {
            var boolParam = pads.addBoolParameter("Pad " + i, "Pad " + i, false);
            boolParam.setAttribute("readonly", true);
        }
    }
}

function noteOnEvent(channel, pitch, velocity) {
    
    if (isPadNote(channel, pitch)) {
        var index = channelToIndex(pitch);
        setSquareValue(index, true);
    }
}

function noteOffEvent(channel, pitch, velocity) {
    if (isPadNote(channel, pitch)) {
        var index = channelToIndex(pitch);
        setSquareValue(index, false);
    }
}

function setSquareValue(index, enabled) {
    local.values.pads["pad" + index].set(enabled);
}

function channelToIndex(channel) {
    var padIndex = channel - baseNote + 1;
    var padRow = Math.ceil(padIndex / 4);
    var padColumn = (padIndex - 1) % 4 + 1;
    return Math.round((4 - padRow) * 4 + padColumn);
}

function isPadNote(channel, pitch) {
    return (channel == 10 && pitch >= baseNote && pitch <= baseNote + 15);
}