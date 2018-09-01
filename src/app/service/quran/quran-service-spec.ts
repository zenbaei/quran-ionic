import { TestBed } from '@angular/core/testing';
import { QuranService } from './quran-service';
import { HttpModule } from '@angular/http';
import * as Constants from '../../all/constants';
import { QuranPageMetadata } from '../../domain/quran-page-metadata';
import { HttpRequest } from '../../core/http/http-request';
import { TestUtils } from '../../util/test-utils/test-utils';
import { Search } from "../../util/search-utils/search";
import * as TestData from "../../../test-data";

describe('QuranService', () => {

    let quranPageContent: string = `quran page content`;
    let quranPageMetadata: string = `[{"fromAyah":1, "toAyah":2, "surahNumber":1},
                                        {"fromAyah":3, "toAyah":4, "surahNumber":2}]`;
    let quranService: QuranService;
    let httpRequest: HttpRequest;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [QuranService, HttpRequest]
        });

        quranService = TestBed.get(QuranService);
        httpRequest = TestBed.get(HttpRequest);
    });

    it('Given http get is mocked to get the quran page When findPageContentByPageNumber is called Then it should return string content', (done) => {
        TestUtils.mockResponse(httpRequest, quranPageContent);

        quranService.findPageContentByPageNumber(7, false)
            .subscribe(content => {
                expect(content).toEqual(quranPageContent);
                done();
            });

        let expectedURL: string = Constants.MUSHAF_DATA_DIR + '7/7.content';
        expect(httpRequest.get).toHaveBeenCalledWith(expectedURL);
    });

    it('Given http get is mocked When findPageContentByPageNumber is called with a value out of range Then it should throw RangeError', () => {
        quranService.findPageContentByPageNumber(0, false)
            .subscribe(str => fail()
            , err => {
                console.info(err.message);
                expect(err instanceof RangeError).toBeTruthy();
            });

        quranService.findPageContentByPageNumber(605, false)
            .subscribe(str => fail()
            , err => {
                console.info(err.message);
                expect(err instanceof RangeError).toBeTruthy();
            });
    });

    it('Given a string containg array of QuranPageMetada in json format When fromJson is called Then it should return array of QuranPageMetada object', () => {
        let quranPageMetadataArr: QuranPageMetadata[] = quranService.toObject(quranPageMetadata);
        expect(quranPageMetadataArr).toBeTruthy();

        expect(quranPageMetadataArr.length).toBe(2);
        expect(quranPageMetadataArr[0].fromAyah).toEqual(1);
        expect(quranPageMetadataArr[0].toAyah).toEqual(2);
        expect(quranPageMetadataArr[0].surahNumber).toEqual(1);

        expect(quranPageMetadataArr[1].fromAyah).toEqual(3);
        expect(quranPageMetadataArr[1].toAyah).toEqual(4);
        expect(quranPageMetadataArr[1].surahNumber).toEqual(2);
    });

    it(`Given http get is mocked to get the quran page metadata When findPageMetadataByPageNumber is called 
        Then it should return QuranPageMetadata array`, (done) => {
        TestUtils.mockResponse(httpRequest, quranPageMetadata);
        let quranPageMetadataArr: QuranPageMetadata[] = quranService.toObject(quranPageMetadata);
        quranService.findPageMetadataByPageNumber(1)
            .subscribe(content => {
                expect(content).toEqual(quranPageMetadataArr);
                done();
            });

        let expectedURL: string = Constants.MUSHAF_DATA_DIR + '1/1.metadata';
        expect(httpRequest.get).toHaveBeenCalledWith(expectedURL);
    });

    it('Given When findPageMetadataByPageNumber is called with value out or range Then it should return Observable of RangeError error', () => {
        quranService.findPageMetadataByPageNumber(0)
            .subscribe(str => fail()
            , err => {
                console.info(err.message);
                expect(err instanceof RangeError).toBeTruthy();
            });

        quranService.findPageMetadataByPageNumber(605)
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
            //let tafsir: Tafsir = new Tafsir(stringToMatch, 2, '');
            let quranContentExpectedMatch = `سَيَصۡلَىٰ نَارٗا`;
            let search: Search = new Search(QuranService.normalizeString(stringToMatch), quranContent);
            expect(search.group()).toBe(quranContentExpectedMatch);
    });

    it(`Given tafsir ayah and mushaf content is provided 
        When normalizeString is called 
        Then Search should return true`, () => {
            let tafsirAyah: string = QuranService.normalizeString('ٱلرحمن الرحيم');
            let search: Search = new Search(tafsirAyah, TestData.SURAT_AL_FATEHA);
            expect(search.test()).toBeTruthy();
    });

    it(`Given tafsir ayah and mushaf content is provided 
        When normalizeString is called 
        Then Search should return true - case no 1`, () => {
            let tafsirAyah: string = QuranService.normalizeString('ٱلرحمن الرحيم');
            let search: Search = new Search(tafsirAyah, TestData.SURAT_AL_FATEHA);
            expect(search.test()).toBeTruthy();
    });

    it(`Given tafsir ayah and mushaf content with 3 tashkil after a characher is provided 
        When normalizeString is called 
        Then Search should return true - case no 2`, () => {
            let quran: string = "شَرَوۡاْ بِهِۦٓ أَنفُسَهُمۡۚ";
            let tafsir: string = 'بِهِ.? أنفسهم'; // dont have a solution than to manualy add .? to tafsir ayah
            let tafsirAyah: string = QuranService.normalizeString(tafsir);
            let search: Search = new Search(tafsirAyah, quran);
            expect(search.test()).toBeTruthy();
    });


    it(`Given tafsir ayah and mushaf content with 3 tashkil after a characher is provided 
        When normalizeString is called 
        Then Search should return true - case no 3`, () => {
            let quran: string = 'فَٱدَّٰرَٰٔتُمۡ فِيهَاۖ';
            let tafsir: string = 'فادّ.?ر.?تم فيها';
            let tafsirAyah: string = QuranService.normalizeString(tafsir);
            let search: Search = new Search(tafsirAyah, quran);
            expect(search.test()).toBeTruthy();
    });

    it(`Given tafsir ayah and mushaf content with 3 tashkil after a characher is provided 
        When normalizeString is called 
        Then Search should return true - case no 4`, () => {
            let quran: string = 'وَٱلصَّٰبِ‍ِٔينَ';
            let tafsir: string = 'وَٱلصَّٰ.?بِ‍ِٔينَ';
            let tafsirAyah: string = QuranService.normalizeString(tafsir);
            let search: Search = new Search(tafsirAyah, quran);
            expect(search.test()).toBeTruthy();
    });

    it(`Given tafsir ayah and mushaf content with 3 tashkil after a characher is provided 
        When normalizeString is called 
        Then Search should return true - case no 5`, () => {
            let quran: string = 'وَلَا يَ‍ُٔودُهُۥ';
            let tafsir: string = 'لا يَ‍ُٔودُهُ';
            let tafsirAyah: string = QuranService.normalizeString(tafsir);
            let search: Search = new Search(tafsirAyah, quran);
            expect(search.test()).toBeTruthy();
    });    

    it(`Given tafsir ayah and mushaf content with 3 tashkil after a characher is provided 
    When normalizeString is called 
    Then Search should return true - case no 6`, () => {
        let quran: string = 'خَٰسِ‍ِٔينَ';
        let tafsir: string = 'خَٰسِ‍ِٔينَ';
        let tafsirAyah: string = QuranService.normalizeString(tafsir);
        let search: Search = new Search(tafsirAyah, quran);
        expect(search.test()).toBeTruthy();
    });

    it(`Given tafsir ayah and mushaf content with 3 tashkil after a characher is provided 
    When normalizeString is called 
    Then Search should return true - case no 7`, () => {
        let quran: string = 'ٱلَّذِي حَآجَّ إِبۡرَٰهِ‍ۧمَ';
        let tafsir: string = 'الذي حَآجَّ إبراه.?م';
        let tafsirAyah: string = QuranService.normalizeString(tafsir);
        let search: Search = new Search(tafsirAyah, quran);
        expect(search.test()).toBeTruthy();
    });
    
    it(`Given tafsir ayah and mushaf content with 3 tashkil after a characher is provided 
    When normalizeString is called 
    Then Search should return true - case no 7`, () => {
        let quran: string = 'ٱلَّذِي حَآجَّ إِبۡرَٰهِ‍ۧمَ';
        let tafsir: string = 'الذي حَآجَّ إبراه.?م';
        let tafsirAyah: string = QuranService.normalizeString(tafsir);
        let search: Search = new Search(tafsirAyah, quran);
        expect(search.test()).toBeTruthy();
    });

    it(`Given tafsir ayah and mushaf content with 3 tashkil after a characher is provided 
    When normalizeString is called 
    Then Search should return true - case no 8`, () => {
        let quran: string = 'وَلَا تَسۡ‍َٔمُوٓاْ';
        let tafsir: string = 'ولا تس.?موا';
        let tafsirAyah: string = QuranService.normalizeString(tafsir);
        let search: Search = new Search(tafsirAyah, quran);
        expect(search.test()).toBeTruthy();
    });

    it(`Given tafsir ayah and mushaf content with 3 tashkil after a characher is provided 
    When normalizeString is called 
    Then Search should return true - case no 9`, () => {
        let quran: string = 'أَنَّىٰ يُحۡيِۦ';
        let tafsir: string = 'أَنَّىٰ يُحۡيِۦ';
        let tafsirAyah: string = QuranService.normalizeString(tafsir);
        let search: Search = new Search(tafsirAyah, quran);
        expect(search.test()).toBeTruthy();
    });

    it(`Given tafsir ayah and mushaf content with 3 tashkil after a characher is provided 
    When normalizeString is called 
    Then Search should return true - case no 10`, () => {
        let quran: string = 'كُونُواْ رَبَّٰنِيِّ‍ۧنَ';
        let tafsir: string = 'كُونُواْ رَبَّٰ.?نِيِّ‍ۧنَ';
        let tafsirAyah: string = QuranService.normalizeString(tafsir);
        let search: Search = new Search(tafsirAyah, quran);
        expect(search.test()).toBeTruthy();
    });

    it(`Given tafsir ayah and mushaf content with 3 tashkil after a characher is provided 
    When normalizeString is called 
    Then Search should return true - case no 11`, () => {
        let quran: string = 'لَهُۥٓ أَسۡلَمَ';
        let tafsir: string = 'لَهُۥٓ.? أَسۡلَمَ';
        let tafsirAyah: string = QuranService.normalizeString(tafsir);
        let search: Search = new Search(tafsirAyah, quran);
        expect(search.test()).toBeTruthy();
    });

    it(`Given tafsir ayah and mushaf content with 3 tashkil after a characher is provided 
    When normalizeString is called 
    Then Search should return true - case no 12`, () => {
        let quran: string = TestData.SURAT_AL_NISAA_PG_1;
        let tafsir_1: string = 'ألاّ تعولوا';
        let tafsir_2: string = 'ذَٰلِكَ أَدۡنَىٰٓ أَلَّا تَعُولُواْ';
        
        let tafsirAyah_1: string = QuranService.normalizeString(tafsir_1);
        let search_1: Search = new Search(tafsirAyah_1, quran);
        expect(search_1.test()).toBeTruthy();

        let tafsirAyah_2: string = QuranService.normalizeString(tafsir_2);
        let search_2: Search = new Search(tafsirAyah_2, quran);
        expect(search_2.test()).toBeTruthy();
    });
    
});