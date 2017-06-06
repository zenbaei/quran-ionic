import { TestBed, inject } from '@angular/core/testing';
import { SurahIndex } from '../../domain/surahIndex';
import { SurahIndexService } from './surahIndex.service';
import { HttpModule, Response, ResponseOptions } from '@angular/http';
import * as Constants from '../../all/constants';
import { HttpRequest } from '../../core/http/httpRequest';
import { Observable } from 'rxjs';
import { AppModule } from '../../app.module';

describe('SurahIndexService', () => {

    let quranIndexContent: string = `{"surahName":"الفَاتِحَةِ","pageNumber":1}
            {"surahName":"البَقَرَةِ","pageNumber":2}`;
    let surahIndexService: SurahIndexService;
    let httpRequest: HttpRequest;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [SurahIndexService, HttpRequest]
        });

        surahIndexService = TestBed.get(SurahIndexService);
        httpRequest = TestBed.get(HttpRequest);
    });

    it('Given SurahIndexService is provided When inject is called Then SurahIndexService should be defined', inject([SurahIndexService], (service) => {
        expect(service).toBeDefined();
    }));

    it('Given a string containg multiple SurahIndex in json format When fromJson is called Then it should return array of SurahIndex object', () => {
        let surahIndexes: SurahIndex[] = surahIndexService.fromJson(quranIndexContent);
        expect(surahIndexes).toBeTruthy();

        expect(surahIndexes.length).toBe(2);
        expect(surahIndexes[0].surahName).toEqual('الفَاتِحَةِ');
        expect(surahIndexes[0].pageNumber).toEqual(1);

        expect(surahIndexes[1].surahName).toEqual('البَقَرَةِ');
        expect(surahIndexes[1].pageNumber).toEqual(2);
    });

    it('Given http get is mocked to return json string When getQuranIndex is called Then it should return observable', () => {
        let response: Response = new Response(new ResponseOptions());
        spyOn(response, 'text').and.returnValue(quranIndexContent);
        spyOn(httpRequest, 'get').and.returnValue(Observable.of(response));
        surahIndexService.getQuranIndex()
            .subscribe(surahIndexes => {
                expect(surahIndexes.length).toBe(2);
            });
    });

});
