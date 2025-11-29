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

function ternary(condition, trueValue, falseValue) {
    if (condition) {
        return trueValue;
    }
    else {
        return falseValue;
    }
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

function getNoteFromString(noteStr) {

    var split = ternary(noteStr.contains("#"), 2, 1);
    var note = noteStr.substring(0, split);
    var octave = parseInt(noteStr.substring(split, noteStr.length));

    return {note: note, octave: octave};
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

            byNoteContainer.addTrigger(note, "Note on");
            // Analysis based on octave and channel is not set beacause it adds a layer of complexity
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

    notesOnThisBar = [];
    notesOnLastBar = [];

    for (var i = 0; i < 9; i++) {
        notesOnThisBar[i] = 0;
        notesOnLastBar[i] = 0;
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

function noteToPath(note) {
    return note.replace("-", "_").toLowerCase();
}

function handleNoteOn(note, channel, velocity) {

    var notePath = noteToPath(note);

    var noteData = getNoteFromString(note);
    
    var noteWithinOctave = noteData.note;
    var noteWithinOctavePath = noteToPath(noteWithinOctave);

    var octave = noteData.octave;


    local.values.midi.global.noteOn.trigger();

    var globalAllNotesContainer = local.values.midi.global.allNotes[notePath];
    globalAllNotesContainer.on.trigger();
    globalAllNotesContainer.count.set(globalAllNotesContainer.count.get() + 1);
    globalAllNotesContainer["channel" + channel].set(true);

    local.values.midi.global.byNote[noteWithinOctavePath].trigger();


    var channelByNoteContainer = local.values.midi.channels["channel" + channel].byNote[noteWithinOctavePath];
    channelByNoteContainer.on.trigger();
    channelByNoteContainer.count.set(channelByNoteContainer.count.get() + 1);
    channelByNoteContainer["octave" + octave].set(true);


    var channelAllNotesContainer = local.values.midi.channels["channel" + channel].allNotes[notePath];
    channelAllNotesContainer.on.trigger();
    channelAllNotesContainer.velocity.set(velocity);
    channelAllNotesContainer.playing.set(true);

    notesOnThisBar[channel - 1]++;
}

function handleNoteOff(note, channel) {
    var notePath = noteToPath(note);

    var noteData = getNoteFromString(note);
    
    var noteWithinOctave = noteData.note;
    var noteWithinOctavePath = noteToPath(noteWithinOctave);

    var octave = noteData.octave;


    var globalAllNotesContainer = local.values.midi.global.allNotes[notePath];

    globalAllNotesContainer.count.set(Math.max(0, globalAllNotesContainer.count.get() - 1));
    globalAllNotesContainer["channel" + channel].set(false);

    var channelByNoteContainer = local.values.midi.channels["channel" + channel].byNote[noteWithinOctavePath];
    channelByNoteContainer.count.set(Math.max(0, channelByNoteContainer.count.get() - 1));
    channelByNoteContainer["octave" + octave].set(false);

    var channelAllNotesContainer = local.values.midi.channels["channel" + channel].allNotes[notePath];
    channelAllNotesContainer.off.trigger();
    channelAllNotesContainer.velocity.set(0);
    channelAllNotesContainer.playing.set(false);
}

function beat(beat) {
    local.values.midi.global.temps[beat+""].trigger();
    if(beat == 1) {
        onBarStarted();
    }
}

var notesOnThisBar = [];
var notesOnLastBar = [];

function onBarStarted() {
    var lastBarTotal = 0;
    var last2BarsTotal = 0;

    for (var i = 0; i < 9; i++) {

        var chan = i + 1;
        var thisBarCount = notesOnThisBar[i];
        var lastBarCount = notesOnLastBar[i];

        local.values.midi.channels["channel" + chan].notesPerLastBar.set(thisBarCount);
        local.values.midi.channels["channel" + chan].notesPerLast2Bars.set((lastBarCount + thisBarCount) / 2);

        lastBarTotal += thisBarCount;
        last2BarsTotal += lastBarCount;

        notesOnLastBar[i] = thisBarCount;
        notesOnThisBar[i] = 0;
    }

    local.values.midi.global.notesPerLastBar.set(lastBarTotal);
    local.values.midi.global.notesPerLast2Bars.set((last2BarsTotal + lastBarTotal) / 2);
}