var http = require('http');
var fs = require('fs');
var quranService = require('./src/app/service/quran/quran-service')

const BASE_DIR = './src/assets/data/mushaf';

/*
http.createServer(function (req, res) {
}).listen(8080);
*/

var read = () => {
    for (let name of ['quran', 'android.quran']) {
        for (let i = 1; i <= 604; i++) {
            let filename = `${BASE_DIR}/${i}/${i}.${name}`;
            fs.readFile(filename, { encoding: 'UTF-8' }, (err, data) => {
                quranService.generateQuranHtml(i, data, filename, write);
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

read();