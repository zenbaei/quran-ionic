var fs = require('fs');
var metadata = require('./metadata');
var index = require('.');
var tafsir = require('./tafsir');
var quranHtml = require('./quran-html')
var Quran = require('./quran');
var stringUtils = require('./string-utils')
const { B, BT, BTT } = require('./constants');
var surahIndexArr;
const L1 = '\n\t\t';
const L2 = L1 + '\t';
const L3 = L2 + '\t';

(function start() {
    index.getQuranIndex().then((val) => {
        surahIndexArr = val;
        read();
    });
})();

/*
http.createServer(function (req, res) {
}).listen(8080);
*/

var read = () => {
    for (let name of ['quran', 'android.quran']) { 
        for (let i = 1; i <= 604; i++) {
            let filename = `${BASE_DIR}/${i}/${i}.${name}`;
            fs.readFile(filename, { encoding: 'UTF-8' }, (err, data) => {
                generateQuranHtml(i, data, filename, write);
            });
        }
    }
}

var write = (filename, quran) => {
    let file = filename + '.html.json';
    console.log(`Writing file: ${file}`);
    var formatted = formatData(JSON.stringify(quran, null, '\t'));
    fs.writeFile(file, formatted, (err) => { });
}

function generateQuranHtml(pageNumber, data, filename) {
    metadata.findMetadataByPageNumber(pageNumber)
        .then(metas => {
            buildHtmlContent(metas, data, 0).then(val => { 
                let quran = new Quran(pageNumber);
                quran.data = quranHtml.surrondEachLineInDiv(val, pageNumber);
                setGozeAndHezbAndSurahName(quran, metas[0]);
                write(filename, quran);
             });
        })
}

async function buildHtmlContent(metas, data, i) {
    data = await getTafsirByMetadata(metas[i], data);
    if (metas.length - 1 === i) {
        return data;
    }
    return buildHtmlContent(metas, data, i + 1);
}

function getTafsirByMetadata(meta, data) {
    return tafsir.findTafsirBySurahNumber(meta.surahNumber)
        .then(tafsirArr => {
            tafsirArr
                .filter(tafsir => isTafsirWithinCurrentPage(tafsir, meta))
                .forEach(tafsir => data = quranHtml.patchTafsirOverContent(tafsir, data));
            return data;
        })
}

function setGozeAndHezbAndSurahName(quran, metadata) {
    quran.surahName = surahIndexArr[(metadata.surahNumber - 1)].surahName;
    quran.goze = metadata.goze;
    quran.hezb = metadata.hezb;
}

/**
 * In case of quran page with multiple surahs (metadata), we need to make sure saving is executed after
 * the whole page is processed (tasfir).
 * @param meta 
 * @param metas 
 */
function isLastMetadata(meta, metas) {
    if (metas[metas.length - 1].surahNumber === meta.surahNumber) {
        return true;
    }
    return false;
}

function isTafsirWithinCurrentPage(tafsir, metadata) {
    if (tafsir.ayahNumber >= metadata.fromAyah && tafsir.ayahNumber <= metadata.toAyah) {
        return true;
    }
    return false;
}

function formatData(data) {
    var result = stringUtils.replaceAll(data, B, L1);
    result = stringUtils.replaceAll(result, BT, L2);
    result = stringUtils.replaceAll(result, BTT, L3);
    result = stringUtils.replaceAll(result, '<a ', L3 + '<a ');
    result = stringUtils.replaceAll(result, '</a> ', L3 + '</a> ');
    return result;
}



