

function replaceAt(target, index, replacement) {
    //console.debug(`Replace [${target}] index [${index}] with [${replacement}]`);
    let leftChunk = target.substr(0, index);
    let rightChunk = target.substr(index + 1, target.length - leftChunk.length);
    return leftChunk + replacement + rightChunk;
}

function replaceAll(target, pattern, replacement) {
    let regex = new RegExp(pattern, 'g');
    return target.replace(regex, replacement);
}

/**
 * Replacing with the use of regex because in case the string contains
 * forward slash regex will throw exception.
 */
function safeReplaceAll(target, pattern, replacement) {
    let newStr = target;
    while (newStr.indexOf(pattern) >= 0) {
        newStr = newStr.replace(pattern, replacement);
    }
    return newStr;
}

module.exports = {
    replaceAt: replaceAt,
    replaceAll: replaceAll
}