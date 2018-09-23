var fs = require('fs');
const { BASE_DIR } = require('./constants');

class Metadata {
    constructor(fromAyah, toAyah, surahNumber, goze, hezb) {
        this.fromAyah = fromAyah;
        this.toAyah = toAyah;
        this.surahNumber = surahNumber;
        this.goze = goze;
        this.hezb = hezb;
    }
}

function toObject(metadataJsonArr) {
    let metadataArr = new Array();
    let jsonArr = JSON.parse(metadataJsonArr);
    for (var json of jsonArr) {
        metadataArr.push(new Metadata(json.fromAyah, json.toAyah, json.surahNumber, json.goze, json.hezb));
    }
    return metadataArr;
}

function findMetadataByPageNumber(pageNumber) {
    //console.debug(`Find quran page metadata by page number [${pageNumber}]`);

    let filename = `${BASE_DIR}/${pageNumber}/${pageNumber}.metadata.json`;

    return new Promise((resolve) => {
        fs.readFile(filename, { encoding: 'UTF-8' }, (err, data) => {
            resolve(toObject(data));
        });
    })
}

function rewriteMetadataFileInPrettyFormat(filename, data) {
    console.log(`Rewriting file ${filename}`);
    fs.writeFile(filename + '.json', JSON.stringify(data, null, '\t'), (err) => {});
    fs.unlink(filename);
}

module.exports = {
    findMetadataByPageNumber: findMetadataByPageNumber
}



