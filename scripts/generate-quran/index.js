var fs = require('fs');
const { BASE_DIR } = require('./constants');
const QURAN_INDEX = BASE_DIR + '/quran.index';

class Index {
    constructor(surahName, pageNumber, surahNumber) {
        this.surahName = surahName;
        this.pageNumber = pageNumber;
        this.surahNumber = surahNumber;
    }
}

function toObject(surahIndexJsonArr) {
    //console.debug(`Deserialize json string into array of SurahIndex`);
    let surahIndexArr = new Array();
    let jsonArr = JSON.parse(surahIndexJsonArr);
    for (var json of jsonArr) {
        surahIndexArr.push(new Index(json.surahName, json.pageNumber, json.surahNumber));
    }
    return surahIndexArr;
}

function getQuranIndex() {
    console.debug(`Get quran index file from ${QURAN_INDEX}`);
    return new Promise((resolve) => {
        fs.readFile(QURAN_INDEX, { encoding: 'UTF-8' }, (err, data) => {
            resolve(toObject(data));
        });
    })
}

module.exports =  {
    getQuranIndex: getQuranIndex
}