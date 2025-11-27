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


function moduleValueChanged(value) {
    console.log(value);
}