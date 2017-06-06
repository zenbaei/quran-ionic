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
    let http: Http;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule, AppModule]
        });
    });

    beforeEach(() => {
        surahIndexService = TestBed.get(SurahIndexService);
        http = TestBed.get(Http);
    });

    it('should inject SurahIndexService', inject([SurahIndexService], (service) => {
        expect(service).toBeTruthy();
    }));

    it('should deserialize surah indexes json string', () => {
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

    it('should read quran index file from server', (done) => {
        surahIndexService.getQuranIndex().then(surahIndexes => {
            expect(surahIndexes.length).toBe(114);
            done();
        });
    });

});
