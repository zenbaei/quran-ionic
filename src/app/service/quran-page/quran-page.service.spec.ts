import { TestBed } from '@angular/core/testing';
import { QuranPageService } from './quran-page.service';
import { HttpModule, Response, ResponseOptions } from '@angular/http';
import * as Constants from '../../all/constants';
import { QuranPageMetadata } from '../../domain/quran-page-metadata';
import { HttpRequest } from '../../core/http/http-request';
import { Observable } from 'rxjs';
import { TestUtils } from '../../util/test-utils/test-utils';

describe('QuranPageService', () => {

    let quranPageContent: string = `quran page content`;
    let quranPageMetadata: string = `[{"fromAyah":1, "toAyah":2, "surahOrder":1},
                                        {"fromAyah":3, "toAyah":4, "surahOrder":2}]`;
    let quranPageService: QuranPageService;
    let httpRequest: HttpRequest;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [QuranPageService, HttpRequest]
        });

        quranPageService = TestBed.get(QuranPageService);
        httpRequest = TestBed.get(HttpRequest);
    });

    it('Given http get is mocked to get the quran page When findPageContentByPageNumber is called Then it should return string content', (done) => {
        let response: Response = TestUtils.mockResponse(httpRequest, quranPageContent);

        quranPageService.findPageContentByPageNumber(7)
            .subscribe(content => {
                expect(content).toEqual(quranPageContent);
                done();
            });

        let expectedURL: string = Constants.MUSHAF_DATA_DIR + '7/7.content';
        expect(httpRequest.get).toHaveBeenCalledWith(expectedURL);
    });

    it('Given http get is mocked When findPageContentByPageNumber is called with a value out of range Then it should throw RangeError', () => {
        quranPageService.findPageContentByPageNumber(0)
            .subscribe(str => fail()
            , err => {
                console.info(err.message);
                expect(err instanceof RangeError).toBeTruthy();
            });

        quranPageService.findPageContentByPageNumber(605)
            .subscribe(str => fail()
            , err => {
                console.info(err.message);
                expect(err instanceof RangeError).toBeTruthy();
            });
    });

    it('Given a string containg array of QuranPageMetada in json format When fromJson is called Then it should return array of QuranPageMetada object', () => {
        let quranPageMetadataArr: QuranPageMetadata[] = quranPageService.fromJson(quranPageMetadata);
        expect(quranPageMetadataArr).toBeTruthy();

        expect(quranPageMetadataArr.length).toBe(2);
        expect(quranPageMetadataArr[0].fromAray).toEqual(1);
        expect(quranPageMetadataArr[0].toAyah).toEqual(2);
        expect(quranPageMetadataArr[0].surahOrder).toEqual(1);

        expect(quranPageMetadataArr[1].fromAray).toEqual(3);
        expect(quranPageMetadataArr[1].toAyah).toEqual(4);
        expect(quranPageMetadataArr[1].surahOrder).toEqual(2);
    });

    it('Given http get is mocked to get the quran page metadata When findPageMetadataByPageNumber is called Then it should return QuranPageMetadata array', (done) => {
        let response: Response = TestUtils.mockResponse(httpRequest, quranPageMetadata);
        let quranPageMetadataArr: QuranPageMetadata[] = quranPageService.fromJson(quranPageMetadata);
        quranPageService.findPageMetadataByPageNumber(1)
            .subscribe(content => {
                expect(content).toEqual(quranPageMetadataArr);
                done();
            });

        let expectedURL: string = Constants.MUSHAF_DATA_DIR + '1/1.metadata';
        expect(httpRequest.get).toHaveBeenCalledWith(expectedURL);
    });

    it('Given When findPageMetadataByPageNumber is called with value out or range Then it should return Observable of RangeError error', () => {
        quranPageService.findPageMetadataByPageNumber(0)
            .subscribe(str => fail()
            , err => {
                console.info(err.message);
                expect(err instanceof RangeError).toBeTruthy();
            });

        quranPageService.findPageMetadataByPageNumber(605)
            .subscribe(str => fail()
            , err => {
                console.info(err.message);
                expect(err instanceof RangeError).toBeTruthy();
            });
    });
});