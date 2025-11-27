function log(message) {
    script.log(message);
}

function logWarning(input) {
    script.logWarning(input);
}

function logError(input) {
    script.logError(input);
}


function logProperties(input) {
    var properties = util.getObjectProperties(input);
    log(properties);
}

function logMethods(input) {
    var methods = util.getObjectMethods(input);
    log(methods);
}

function getOctaveFromMidi(midi) {
    var octave = Math.floor(midi / 12) - 1 + "";
    octave = octave.substring(0, octave.length - 2);
    
    return octave;
}   

function getNoteWithinOctaveFromMidi(midi) {
    var n = midi % 12;
    if (n == 0) {
        return "C";
    }
    else if (n == 1) {
        return "C#";
    }
    else if (n == 2) {
        return "D";
    }
    else if (n == 3) {
        return "D#";
}
    else if (n == 4) {
        return "E";
    }
    else if (n == 5) {
        return "F";
    }
    else if (n == 6) {
        return "F#";
    }
    else if (n == 7) {
        return "G";
    }
    else if (n == 8) {
        return "G#";
    }
    else if (n == 9) {
        return "A";
    }
    else if (n == 10) {
        return "A#";
    }
    else if (n == 11) {
        return "B";
    }
}

function getNoteFromMidi(midi) {
    return getNoteWithinOctaveFromMidi(midi) + getOctaveFromMidi(midi);
}

function init() {
    script.setExecutionTimeout(300);
    
    local.scripts.msgchb.enableLog.set(true);

    function setupGlobalAllNotesContainer() {
        var allNotesContainer = local.values.midi.global.allNotes;
        allNotesContainer.clear();

        for (var midi = 0; midi < 128; midi++) {
            var note = getNoteFromMidi(midi);
            
            var noteContainer = allNotesContainer.addContainer(note);

            noteContainer.addTrigger("On", "Note on");
            noteContainer.addIntParameter("Count", "Count", 0, 0, 11);

            for (var i = 1; i <= 9; i++) {
                noteContainer.addBoolParameter("Channel " + i, "Channel " + i, false);
            }

            noteContainer.setCollapsed(true);
        }

        allNotesContainer.setCollapsed(true);
    }

    function setupGlobalByNoteContainer() {
        var byNoteContainer = local.values.midi.global.byNote;
        byNoteContainer.clear();

        for (var midi = 0; midi < 12; midi++) {
            var note = getNoteWithinOctaveFromMidi(midi);

            var noteContainer = byNoteContainer.addContainer(note);

            noteContainer.addTrigger("On", "Note on");
            noteContainer.addIntParameter("Octave Count", "Octave Count", 0, 0, 11);
            noteContainer.addIntParameter("Channel Count", "Channel Count", 0, 0, 9);

            var onOctaveContainer = noteContainer.addContainer("On Octave");
            for (var octave = -1; octave <= 9; octave++) {
                var octaveStr = "Octave " + octave;
                onOctaveContainer.addBoolParameter(octaveStr, octaveStr, false);
            }

            var onChannelContainer = noteContainer.addContainer("On Channel");
            for (var i = 1; i <= 9; i++) {
                onChannelContainer.addBoolParameter("Channel " + i, "Channel " + i, false);
            }

            onOctaveContainer.setCollapsed(true);
            onChannelContainer.setCollapsed(true);

            noteContainer.setCollapsed(true);
        }
    }

    function setupAllNotesContainer(channel) {
        var allNotesContainer = local.values.midi.channels["channel" + channel].allNotes;
        allNotesContainer.clear();
        for (var midi = 0; midi < 128; midi++) {
            var note = getNoteFromMidi(midi);
            
            var noteContainer = allNotesContainer.addContainer(note);

            noteContainer.addTrigger("On", "Note on");
            noteContainer.addTrigger("Off", "Note off");
            noteContainer.addBoolParameter("Playing", "Playing", false);
            noteContainer.addIntParameter("Velocity", "Velocity", 0, 0, 127);

            noteContainer.setCollapsed(true);
        }
        allNotesContainer.setCollapsed(true);
    }

    function setupByNoteContainer(channel) {
        var byNoteContainer = local.values.midi.channels["channel" + channel].byNote;
        byNoteContainer.clear();

        for (var midi = 0; midi < 12; midi++) {
            var note = getNoteWithinOctaveFromMidi(midi);
            
            var noteContainer = byNoteContainer.addContainer(note);

            noteContainer.addTrigger("On", "Note on");
            noteContainer.addIntParameter("Count", "Count", 0, 0, 11);

            for (var octave = -1; octave <= 9; octave++) {
                var octaveStr = "Octave " + octave;
                noteContainer.addBoolParameter(octaveStr, octaveStr, false);
            }

            noteContainer.setCollapsed(true);
        }
    }

    setupGlobalAllNotesContainer();
    setupGlobalByNoteContainer();

    for (var chan = 1; chan <= 9; chan++) {
        
        setupAllNotesContainer(chan);
        setupByNoteContainer(chan);
    }
}

function moduleValueChanged(value) {
    
}

function setSquareOpacity(square,opacity) {

    var index;
    if (square < 10) {
        index = "0" + square;
    } else {
        index = square;
    }

    var path = "/surfaces/Squares/Square_" + index + "/opacity";
    root.modules.madMapper.send(path, opacity);
}

function handleNoteOn(note, channel, velocity) {
    
    local.values.midi.global.noteOn.trigger();
}

function handleNoteOff(note, channel) {
    
}