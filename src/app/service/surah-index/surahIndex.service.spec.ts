import { TestBed, inject } from '@angular/core/testing';
import { SurahIndex } from '../../domain/surahIndex';
import { SurahIndexService } from './surahIndex.service';
import { FileReader } from '../../core/io/file/FileReader';
import { HttpModule, Http, Response } from '@angular/http';
import { IonicModule } from 'ionic-angular';
import * as Constants from '../../all/constants';
import 'rxjs/add/operator/toPromise';
import { File } from '@ionic-native/file';
import { AppModule } from '../../app.module';

describe('SurahIndexService', () => {

    let surahIndexService: SurahIndexService;
    let fileReader: FileReader;
    let file: File;
    let http: Http;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ HttpModule, AppModule ]
        });
    });

    beforeEach(() => {
        surahIndexService = TestBed.get(SurahIndexService);
        fileReader = TestBed.get(FileReader);
        file = TestBed.get(File);
        http = TestBed.get(Http);
    });

    it('should inject SurahIndexService', inject([SurahIndexService], (service) => {
        expect(service).toBeTruthy();
    }));

    it('should be able deserialize surah indexes json string', () => {
        let quranIndex: string = `{"surahName":"الفَاتِحَةِ","pageNumber":1}
            {"surahName":"البَقَرَةِ","pageNumber":2}`;
        let surahIndexes: SurahIndex[] = surahIndexService.fromJson(quranIndex);
        expect(surahIndexes).toBeTruthy();

        expect(surahIndexes.length).toBe(2);
        expect(surahIndexes[0].surahName).toEqual('الفَاتِحَةِ');
        expect(surahIndexes[0].pageNumber).toEqual(1);

        expect(surahIndexes[1].surahName).toEqual('البَقَرَةِ');
        expect(surahIndexes[1].pageNumber).toEqual(2);
    });

    it('should be to read quran index file from server', (done) => {
        let url: string = Constants.BASE_DIR + Constants.QURAN_INDEX_FILE;
        console.log(`quran index file url ${url}`);
        let result: Promise<Response> = http.get(url).toPromise();

        result.then(res => {
            spyOn(fileReader, 'readAsText').and.returnValue(Promise.resolve(res.text()));
            let surahIndexesPromise: Promise<SurahIndex[]> = surahIndexService.getQuranIndex();
            
            surahIndexesPromise.then(surahIndexes => {
                expect(surahIndexes.length).toBe(114);
                done();
            });
        });
    });

});
