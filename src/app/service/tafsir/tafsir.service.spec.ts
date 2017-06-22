import { TestBed, inject } from '@angular/core/testing';
import { Tafsir } from '../../domain/tafsir';
import { TafsirService } from './tafsir.service';
import { HttpModule, Response, ResponseOptions } from '@angular/http';
import { HttpRequest } from '../../core/http/http-request';
import { Observable } from 'rxjs';
import { TestUtils } from '../../util/test-utils/test-utils';
import * as Constants from '../../all/constants';

describe('TafsirService', () => {

    let tafsirContent: string = `[{"ayah":"ayah1", "ayahNumber":2, "tafsir":"tafsir1"},
                                    {"ayah":"ayah2", "ayahNumber":4, "tafsir":"tafsir2"}]`;
    let tafsirService: TafsirService;
    let httpRequest: HttpRequest;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [TafsirService, HttpRequest]
        });

        tafsirService = TestBed.get(TafsirService);
        httpRequest = TestBed.get(HttpRequest);
    });

    it('Given TafsirService is provided When inject is called Then TafsirService should be defined', inject([TafsirService], (service) => {
        expect(service).toBeDefined();
    }));

    it('Given a string containg array of Tafsir in json format When fromJson is called Then it should return array of Tafsir object', () => {
        let tafsirs: Tafsir[] = tafsirService.fromJson(tafsirContent);
        expect(tafsirs).toBeTruthy();

        expect(tafsirs.length).toBe(2);
        expect(tafsirs[0].ayah).toEqual('ayah1');
        expect(tafsirs[0].ayahNumber).toEqual(2);
        expect(tafsirs[0].tafsir).toEqual('tafsir1');

        expect(tafsirs[1].ayah).toEqual('ayah2');
        expect(tafsirs[1].ayahNumber).toEqual(4);
        expect(tafsirs[1].tafsir).toEqual('tafsir2');
    });

    it('Given http get is mocked to get tafsir content When findTafsirBySurahOrder is called Then it should return string content', (done) => {
        let response: Response = TestUtils.mockResponse(httpRequest, tafsirContent);
        let tafsirArr: Tafsir[] = tafsirService.fromJson(tafsirContent);
        tafsirService.findTafsirBySurahOrder(1)
            .subscribe(content => {
                expect(content).toEqual(tafsirArr);
                done();
            });

        let expectedURL: string = Constants.TAFSIR_MAKHLOUF_DATA_DIR + '1.tafsir';
        expect(httpRequest.get).toHaveBeenCalledWith(expectedURL);
    });

    it('Given When findTafsirBySurahOrder is called with a value out of range Then it should throw RangeError', () => {
        tafsirService.findTafsirBySurahOrder(0)
            .subscribe(str => fail()
            , err => {
                console.info(err.message);
                expect(err instanceof RangeError).toBeTruthy();
            });

        tafsirService.findTafsirBySurahOrder(115)
            .subscribe(str => fail()
            , err => {
                console.info(err.message);
                expect(err instanceof RangeError).toBeTruthy();
            });
    });
});