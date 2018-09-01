var fs = require('fs');
const TAFSIR_MAKHLOUF_DATA_DIR = '../../src/assets/data/tafsir/makhlouf';

class Tafsir {
    constructor(ayah, ayahNumber, tafsir) {
        this.ayah = ayah;
        this.ayahNumber = ayahNumber;
        this.tafsir = tafsir;
    }
}

function toObject(tafsirJsonArr) {
    //console.debug(`Deserialize tafsir json array into an array of Tafsir`);
    let tafsirArr = new Array();
    let jsonArr = JSON.parse(tafsirJsonArr);
    for (var json of jsonArr) {
        tafsirArr.push(new Tafsir(json.ayah, json.ayahNumber, json.tafsir));
    }
    return tafsirArr;
}

function findTafsirBySurahNumber(surahNumber) {
    //console.debug(`Find tafsir by surah number [${surahNumber}]`);

    let filename = `${TAFSIR_MAKHLOUF_DATA_DIR}/${surahNumber}.tafsir`;

    return new Promise((resolve) => {
        fs.readFile(filename, { encoding: 'utf8' }, (err, data) => {
            //console.log(filename);
            //rewriteTafsirFileInPrettyFormat(filename, toObject(data));
            resolve(toObject(data));
        });
    })
}

function rewriteTafsirFileInPrettyFormat(filename, data) {
    fs.writeFile(filename, JSON.stringify(data, null, '\t'), (err) => {});
}

module.exports = {
    findTafsirBySurahNumber: findTafsirBySurahNumber
}
