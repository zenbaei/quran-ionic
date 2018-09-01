var stringUtils = require('./string-utils');

/**
 * Add line break and then zero or one metacharacter '\n?' to match text splited on 2 lines.
 * 
 * ex; اهدنا الصراط المستقيم تاتي على سطرين
 * 
 * @param str 
 */
function addLineBreakAfterEachWord(str) {
    //console.debug(`Add line breaks after each word from ${str}`);
    let splited = str.split(' ');
    let result = '';
    for (let i = 0; i < splited.length; i++) {
        if (i === splited.length - 1) { // last word
            result += splited[i];
        } else {
            result += splited[i] + SPACE + LINE_TERMINATOR + ZERO_OR_ONE;
        }
    }
    //console.debug(`After adding line breaks [${result}]`);
    return result.trim();
}

function removeTashkil(str) {
    //console.debug(`Remove Tashkil from [${str}]`);
    for (let s of TASHKIL_CHARACTERS_ARRAY) {
        if (str.indexOf(s) > 0) {
            str = stringUtils.replaceAll(str, s, EMPTY_STRING);
        }
    }
    //console.debug(`After removing Tashkil ${str}`);
    return str;
}

/**
 * Replaces middle 'ا' Alef with \S?\S? from within the string but not start or end.
 * 
 * @param str 
 */
function replaceMiddleAlefsWithNonSpaceZeroOrOneTime(str) {
    //console.debug(`Remove middle Alef from [${str}]`);
    let strArr = str.split(SPACE);

    for (let i = 0; i < strArr.length; i++) {
        let word = strArr[i];
        let middleAlefIndex = getMiddleAlefIndex(word);
        if (middleAlefIndex !== -1) {
            strArr[i] = stringUtils.replaceAt(word, middleAlefIndex,
                NON_SPACE + ZERO_OR_ONE + NON_SPACE + ZERO_OR_ONE);
            return replaceMiddleAlefsWithNonSpaceZeroOrOneTime(concatenateWords(strArr)); // recursively check for more middle alefs exists
        }
    }

    let result = concatenateWords(strArr);
    //console.debug(`After removing middle Alef ${result}`);
    return result;
}

function concatenateWords(strArr) {
    let result = EMPTY_STRING;

    for (let w of strArr) {
        result += SPACE + w;
    }

    return result.trim();
}

/**
 * After each char add '\S?\S?' to cover one tashkil or two by maximun after every character
 * but not matching whitespace.
 * Note: if the string contains \S or ? then it'll be ignored
 * @param str 
 */
function addRegexNonWhiteSpaceMetaCharInBetween(str) {
    //console.debug(`Add dot for zero or one time, twice [${str}]`);
    let result = EMPTY_STRING;
    for (let i = 0; i < str.length; i++) {
        let char = str.charAt(i);
        if (char === SPACE) {
            result += SPACE;
        } else if (char === NON_SPACE || char === ZERO_OR_ONE) {
            continue;
        } else {
            result += str.charAt(i) + NON_SPACE + ZERO_OR_ONE + NON_SPACE + ZERO_OR_ONE;
        }
    }
    return result;
}

/**
 * Replaces every alef with one char for zero or one time.
 * 
 * Zero in order to match alef when it comes in the middle as 'العلمين'.
 * 
 * @param str 
 */
function replaceAlefWithRegexDotMetaChar(str) {
    //console.debug(`Remove every Alef from [${str}]`);
    let result = str;
    for (let c of ALEFS) {
        result = stringUtils.replaceAll(result, c, ONE_CHAR + ZERO_OR_ONE);
    }
    //console.debug(`After removing every Alef ${result.trim()}`);
    return result;
}

/**
 * Replaces Abstracted alef with alef skoon if it comes as first character.
 * 
 * @param str 
 */
function replaceFirstAlefCharWithAlefSkoon(str) {
    let splitStr = str.split(SPACE);
    for (let i = 0; i < splitStr.length; i++) {
        let word = splitStr[i];
        if (word.startsWith(ALEF_ABSTRACTED)) {
            splitStr[i] = word.replace(ALEF_ABSTRACTED, ALEF_SKOON);
        }
    }

    let result = SPACE;
    for (let w of splitStr) {
        result += w + SPACE;
    }
    //console.debug(`After removing first Alef ${result.trim()}`);
    return result.trim();
}

/**
 * Returns true if the string has alef within, ignoring start and end.
 * @param str
 * @returns number
 */
function getMiddleAlefIndex(str) {
    let regex = new RegExp(ALEF_ABSTRACTED, GLOBAL);

    //console.debug(`string without regex ${strWithoutRegex}`);
    var match;
    while ((match = regex.exec(str.trim())) != null) {
        if (match.index != 0 && match.index != str.length - 1) {
            return match.index;
        }
    }
    return -1;
}

function replaceWhiteSpaceWithRegexSpaceChar(str) {
    return str.replace(' ', WHITE_SPACE + ONE_OR_MORE);
}


const EMPTY_STRING = "";
const GLOBAL = "g";
const ONE_CHAR = ".";
const NON_SPACE = "\\S";
const ALEF_ABSTRACTED = "ا";
const ALEF_SKOON = "ٱ";
const LINE_TERMINATOR = '\n';
const SPACE = ' ';
const ZERO_OR_ONE = "?";
const WHITE_SPACE = "\\s";
const ONE_OR_MORE = "+";
const ALEFS = ["أ", "آ", "إ", "ٱ", "ا"];

const TASHKIL_CHARACTERS_ARRAY = ["\u0610", "\u0611", "\u0612", "\u0613",
    "\u0614", "\u0615", "\u0616", "\u0617", "\u0618", "\u0619", "\u061A", "\u06D6", "\u06D7",
    "\u06D8", "\u06D9", "\u06DA", "\u06DB", "\u06DC", "\u06DD", "\u06DE", "\u06DF", "\u06E0",
    "\u06E1", "\u06E2", "\u06E3", "\u06E4", "\u06E5", "\u06E6", "\u06E7", "\u06E8", "\u06E9",
    "\u06EA", "\u06EB", "\u06EC", "\u06ED", "\u0640", "\u064B", "\u064C", "\u064D", "\u064E",
    "\u064F", "\u0650", "\u0651", "\u0652", "\u0653", "\u0654", "\u0655", "\u0656", "\u0657",
    "\u0658", "\u0659", "\u065A", "\u065B", "\u065C", "\u065D", "\u065E", "\u065F", "\u0670"];

module.exports = {
    addLineBreakAfterEachWord: addLineBreakAfterEachWord,
    replaceFirstAlefCharWithAlefSkoon: replaceFirstAlefCharWithAlefSkoon,
    replaceMiddleAlefsWithNonSpaceZeroOrOneTime: replaceMiddleAlefsWithNonSpaceZeroOrOneTime,
    addRegexNonWhiteSpaceMetaCharInBetween: addRegexNonWhiteSpaceMetaCharInBetween,
    removeTashkil: removeTashkil
}