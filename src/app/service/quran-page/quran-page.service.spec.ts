import { TestBed } from '@angular/core/testing';
import { QuranPageService } from './quran-page.service';
import { HttpModule, Response, ResponseOptions } from '@angular/http';
import * as Constants from '../../all/constants';
import { QuranPageMetadata } from '../../domain/quran-page-metadata';
import { HttpRequest } from '../../core/http/http-request';
import { Observable } from 'rxjs';
import { TestUtils } from '../../util/test-utils/test-utils';
import { Search } from "../../util/search-utils/search";
import * as TestData from "../../../test-data";
import { Tafsir } from '../../domain/tafsir';

describe('QuranPageService', () => {

    let quranPageContent: string = `quran page content`;
    let quranPageMetadata: string = `[{"fromAyah":1, "toAyah":2, "surahNumber":1},
                                        {"fromAyah":3, "toAyah":4, "surahNumber":2}]`;
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
        expect(quranPageMetadataArr[0].surahNumber).toEqual(1);

        expect(quranPageMetadataArr[1].fromAray).toEqual(3);
        expect(quranPageMetadataArr[1].toAyah).toEqual(4);
        expect(quranPageMetadataArr[1].surahNumber).toEqual(2);
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

    it(`Given quran content with 3 words and ayah with 2 words to match content are provided
        When normalizeString is used 
        Then regex search should return only the matched 2 words with no more characters`, () => {
            let stringToMatch: string = "سَيَصلى نارًا";
            let quranContent: string = `سَيَصۡلَىٰ نَارٗا ذَات`;
            let tafsir: Tafsir = new Tafsir(stringToMatch, 2, '');
            let quranContentExpectedMatch = `سَيَصۡلَىٰ نَارٗا`;
            let search: Search = new Search(QuranPageService.normalizeString(stringToMatch), quranContent);
            expect(search.group()).toBe(quranContentExpectedMatch);
    });

    it(`Given tafsir ayah and mushaf content is provided 
        When normalizeString is called 
        Then Search should return true`, () => {
            let tafsirAyah: string = QuranPageService.normalizeString('ٱلرحمن الرحيم');
            let search: Search = new Search(tafsirAyah, TestData.SURAT_AL_FATEHA);
            expect(search.test()).toBeTruthy();
    });

});