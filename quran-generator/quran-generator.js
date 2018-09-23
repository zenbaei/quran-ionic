"use strict"

var fs = require('fs');
var metadata = require('./metadata');
var index = require('.');
var tafsir = require('./tafsir');
var quranMarkup = require('./quran-markup')
var Quran = require('./quran');
var surahIndexArr;
let generatePageNu = process.argv[2];
let start = (generatePageNu) ? generatePageNu : 1;
let end = (generatePageNu) ? generatePageNu : 604;

(function start() {
    index.getQuranIndex().then((val) => {
        surahIndexArr = val;
        read();
    });
})();

var read = () => {
    for (let name of ['quran', 'android.quran']) {
        for (let i = start; i <= end; i++) {
            let filename = `${BASE_DIR}/${i}/${i}.${name}`;
            fs.readFile(filename, { encoding: 'UTF-8' }, (err, data) => {
                generateQuranHtml(i, data, filename, write);
            });
        }
    }
}

var write = (filename, quran) => {
    let file = filename + '.markup.json';
    console.log(`Writing file: ${file}`);
    fs.writeFile(file, JSON.stringify(quran, null, '\t'), (err) => { });
}

function generateQuranHtml(pageNumber, data, filename) {
    metadata.findMetadataByPageNumber(pageNumber)
        .then(metas => {
            buildHtmlContent(metas, data, 0).then(val => {
                let quran = new Quran(pageNumber);
                let temp = quranMarkup.surrondFirstAndLastWordInDiv(val);
                quran.data = quranMarkup.surrondEachLineInDiv(temp, pageNumber);
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
                .forEach(tafsir => data = quranMarkup.patchTafsirOverContent(tafsir, data));
            return data;
        })
}

function setGozeAndHezbAndSurahName(quran, metadata) {
    quran.surahName = surahIndexArr[(metadata.surahNumber - 1)].surahName;
    quran.goze = metadata.goze;
    quran.hezb = metadata.hezb;
}

function isTafsirWithinCurrentPage(tafsir, metadata) {
    if (tafsir.ayahNumber >= metadata.fromAyah && tafsir.ayahNumber <= metadata.toAyah) {
        return true;
    }
    return false;
}



