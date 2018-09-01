import { TestBed, inject } from '@angular/core/testing';
import { Index } from '../../domain';
import { IndexService } from './index-service';
import { HttpModule } from '@angular/http';
import { HttpRequest } from '../../core/http/http-request';
import { TestUtils } from '../../util/test-utils/test-utils';

describe('IndexService', () => {

    let quranIndexContent: string = `[{"surahName":"الفَاتِحَةِ","pageNumber":1},
            {"surahName":"البَقَرَةِ","pageNumber":2}]`;
    let quranIndexService: IndexService;
    let httpRequest: HttpRequest;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [IndexService, HttpRequest]
        });

        quranIndexService = TestBed.get(IndexService);
        httpRequest = TestBed.get(HttpRequest);
    });

    it('Given IndexService is provided When inject is called Then IndexService should be defined', inject([IndexService], (service) => {
        expect(service).toBeDefined();
    }));

    it('Given a string containg array of SurahIndex in json format When fromJson is called Then it should return array of SurahIndex object', () => {
        let surahIndexes: Index[] = quranIndexService.fromJson(quranIndexContent);
        expect(surahIndexes).toBeTruthy();

        expect(surahIndexes.length).toBe(2);
        expect(surahIndexes[0].surahName).toEqual('الفَاتِحَةِ');
        expect(surahIndexes[0].pageNumber).toEqual(1);

        expect(surahIndexes[1].surahName).toEqual('البَقَرَةِ');
        expect(surahIndexes[1].pageNumber).toEqual(2);
    });

    it('Given http get is mocked to return json string When getQuranIndex is called Then it should return observable', () => {
        TestUtils.mockResponse(httpRequest, quranIndexContent);

        quranIndexService.getQuranIndex()
            .subscribe(surahIndexes => {
                expect(surahIndexes.length).toBe(2);
            });
    });

});
