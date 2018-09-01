var http = require('http');
var fs = require('fs');
var metadata = require('./metadata');
var index = require('./index');
var tafsir = require('./tafsir');
var quranHtml = require('./quran-html')
var Quran = require('./quran');
var surahIndexArr;

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
    console.log(`writing to.. ${dir}`);
    fs.writeFile(`${filename}.json`, JSON.stringify(quran), (err) => {
        console.log(err);
    });
}

function generateQuranHtml(pageNumber, data, filename) {
    console.log(`Generating quran files started`);
    let start = Date.now();
    let quran = new Quran(pageNumber);

    metadata.findMetadataByPageNumber(pageNumber)
        .then(metas => {
            metas.forEach(meta => {

                tafsir.findTafsirBySurahNumber(meta.surahNumber)
                    .then(tafsirArr => {
                        tafsirArr
                            .filter(tafsir => isTafsirWithinCurrentPage(tafsir, meta))
                            .forEach(tafsir => data = quranHtml.patchTafsirOverContent(tafsir, data));
                        if (isLastMetadata(meta, metas)) {
                            setGozeAndHezbAndSurahName(quran, metas[0]); //always display first surah name
                            quran.data = quranHtml.surrondEachLineInDiv(data, pageNumber);
                            write(filename, quran);
                        }
                    });

            });
        });

    console.log(`Generating quran finished at: ${Math.floor((Date.now() - start) / 1000)} seconds`);
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











function normalizeString(str) {
    return RegexUtils.addLineBreakAfterEachWord(
        RegexUtils.replaceFirstAlefCharWithAlefSkoon(
            RegexUtils.replaceMiddleAlefsWithNonSpaceZeroOrOneTime(
                RegexUtils.addRegexNonWhiteSpaceMetaCharInBetween(
                    RegexUtils.removeTashkil(str)))));
}




