"use strict";

var Search = require('./search');
var regexUtils = require('./regex-utils');
const { PAGES_FONT, B, BT, BTT } = require('./constants');

function patchTafsirOverContent(tafsir, content) {
    //console.debug(`Patch tafsir on quran page content - ayah ${tafsir.ayah}`);

    let exclude = '(?!<)'; // to prevent replacing word inside a span already
    let search = initSearch(tafsir, content, exclude);

    if (!search.test()) {
        throw new Error(`Ayah [${tafsir.ayah}] not matching target [${content}]`);  // uncomment when dev
    }

    let matchedAyah = search.group().trim().replace(CHARS_TO_REMOVE, EMPTY);
    let replacement = `<a data-content='${tafsir.tafsir}' ${POPOVER_ATT}>${matchedAyah}</a>`;

    let regex = new RegExp(matchedAyah + search.exclude);
    return content.replace(regex, replacement);
}

function initSearch(tafsir, content, exclude) {
    // in case of no normalization, do exact match
    exclude = tafsir.ayah.indexOf(NO_NORMALIZATION) > -1 ? '' : exclude;

    let ayahToMatch = tafsir.ayah.indexOf(NO_NORMALIZATION) > -1 ?
        tafsir.ayah.replace(NO_NORMALIZATION, '') :
        normalizeString(tafsir.ayah);
    
    return new Search(ayahToMatch, content, exclude);
}

function surrondEachLineInDiv(content, pageNumber) {
    let lines = content.split('\n');
    let newContent = '';

    lines.forEach((str, index) => {
        if (isCenteredLine(str, pageNumber)) {
            newContent += 
        `<div style='font-size:${DEFAULT_FONT_SIZE}' class='no-justify'>${BT}<nobr>${BTT}${str}${BT}</nobr>${B}</div>${B}`;
        } else {
            newContent += 
                `<div style='font-size:${getFontSize(pageNumber, index + 1)}'>${BT}<nobr>${BTT}${str}${BT}</nobr>${B}</div>${B}`;
        }
    });
    return newContent;
}

function isCenteredLine(str, pageNumber) {
    if (str.trim().split(' ').length === 2 || // سورة النساء
        str.trim().split(' ').length === 3 || // 'سورة آل عمرآن'
        (str.trim().split(' ').length === 4 && str.trim().split(' ')[0] === BESM) || //بسم الله الرحمن الرحيم
        (str.indexOf(RAAD) != -1 && pageNumber === 255) ||
        (str.indexOf(NAJM) != -1 && pageNumber === 528) ||
        (str.indexOf(GHASHEYA) != -1 && pageNumber === 593) ||
        (str.indexOf(FAJR) != -1 && pageNumber === 594) ||
        (str.indexOf(QAREA) != -1 && pageNumber === 600) ||
        (str.indexOf(KAWTHAR) != -1 && pageNumber === 602) ||
        (str.indexOf(MAOUN) != -1 && pageNumber === 602) ||
        (str.indexOf(KORAYSH) != -1 && pageNumber === 602) ||
        (str.indexOf(KAFROUN) != -1 && pageNumber === 603) ||
        (str.indexOf(MASAD) != -1 && pageNumber === 603) ||
        (str.indexOf(NASR) != -1 && pageNumber === 603)) {
        return true;
    }
    return false;
}

function getFontSize(pageNumber, lineNumber) {
    let lnNuFtSz = PAGES_FONT.get(pageNumber);
    if (lnNuFtSz != null && lnNuFtSz.get(lineNumber) != null) {
        return lnNuFtSz.get(lineNumber) + 'vw';
    }
    return DEFAULT_FONT_SIZE;
}

function normalizeString(str) {
    return regexUtils.addLineBreakAfterEachWord(
        regexUtils.replaceFirstAlefCharWithAlefSkoon(
            regexUtils.replaceMiddleAlefsWithNonSpaceZeroOrOneTime(
                regexUtils.addRegexNonWhiteSpaceMetaCharInBetween(
                    regexUtils.removeTashkil(str)))));
}



const EMPTY = '';
const POPOVER_ATT = `tabindex='0' role='button' class='fake-link tafsir' data-toggle='popover' data-placement='top'`;
const CHARS_TO_REMOVE = new RegExp('<.*'); // to prevent replacing word inside a span already

const RAAD = 'عِلۡمُ ٱلۡكِتَٰبِ';
const GHASHEYA = 'ثُمَّ إِنَّ عَلَيۡنَا حِسَابَهُم';
const KAFROUN = 'وَلِيَ دِينِ';
const MASAD = 'مِّن مَّسَدِۢ';
const NASR = 'وَٱسۡتَغۡفِرۡهُۚ إِنَّهُۥ';
const KAWTHAR = 'هُوَ ٱلۡأَبۡتَرُ';
const MAOUN = 'وَيَمۡنَعُونَ ٱلۡمَاعُونَ';
const KORAYSH = 'مِّن جُوعٖ وَءَامَنَهُم مِّنۡ خَوۡفِۢ';
const QAREA = 'نَارٌ حَامِيَةُۢ';
const FAJR = 'فَٱدۡخُلِي فِي عِبَٰدِي ';
const NAJM = 'فَٱسۡجُدُواْۤ لِلَّهِۤ وَٱعۡبُدُواْ';
const BESM = 'بِسۡمِ';
const NO_NORMALIZATION = '\\noNormalization';
const DEFAULT_FONT_SIZE = '4.8vw';

module.exports = {
    patchTafsirOverContent: patchTafsirOverContent,
    surrondEachLineInDiv: surrondEachLineInDiv
}