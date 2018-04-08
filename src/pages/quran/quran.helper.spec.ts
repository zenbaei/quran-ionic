import { QuranPageHelper } from "./quran.helper";
import { Search } from "../../app/util/search-utils/search";
import * as TestData from "../../test-data";
import { Tafsir } from '../../app/domain/tafsir';

describe('QuranPageHelper', () => {

    let tafsirArr: Tafsir[] = [
        new Tafsir("ربّ العالمين", 2, "مربّيهم ومالكهم ومدبر أمورهم"),
        new Tafsir("يوم الدّين", 4, "يوم الجزاء"),
        new Tafsir("اهدنا الصّراط المستقيم", 6, "وفّقنا للثّبات على الطريق الواضح الذي لا اعوجاج فيه وهو الإسلام"),
        new Tafsir("المغضوب عليهم", 7, "اليهود"),
        new Tafsir("الضّالين", 7, "النصارى وكذا أشباههم في الضلال")
    ];

    it('Given quran content and tafsir is provided When patchTafsirOnContent is called Then it should replace the matched string with tafsir span', () => {
        let tafsirText: string = "مربّيهم ومالكهم ومدبر أمورهم";
        let tafsirAyah: string = "ربّ العالمين";
        let ayahFromMushaf: string = "رَبِّ ٱلۡعَٰلَمِينَ";
        let tafsir: Tafsir = new Tafsir(tafsirAyah, 2, tafsirText);
        let exptectedSpan: string = `<span class="tafsir" data-toggle="popover" title="${tafsirText}">${ayahFromMushaf}</span>`;

        let result: string = QuranPageHelper.patchTafsirOnContent(tafsir, TestData.SURAT_AL_FATEHA);
        let expected: string = TestData.SURAT_AL_FATEHA.replace(ayahFromMushaf, exptectedSpan);
        expect(result).toEqual(expected);
    });

    it('Given quran content and tafsir is provided When patchTafsirOnContent is called Then it should throw no Error exception', () => {
        tafsirArr.forEach(tf => QuranPageHelper.patchTafsirOnContent(tf, TestData.SURAT_AL_FATEHA));
    });

    it(`Given a string with line break is provided 
        When it's used to match content 
        Then it should match the string with line break`, () => {
        let stringToMatch: string = `ٱهۡدِنَا \n?ٱلصِّرَٰط`;
        let search: Search = new Search(stringToMatch, TestData.SURAT_AL_FATEHA);
        expect(search.test()).toBeTruthy();
    });

    it(`Given quran content for surat elfalaq 1 and tafsir is provided 
        When patchTafsirOnContent is called 
        Then it should replace the matched string with tafsir span`, () => {
            let tafsirText: string = "أعْتـَصِمُ وأسْتجير";
            let tafsirAyah: string = "أعوذ";
            let ayahFromMushaf: string = "أَعُوذُ";
            let tafsir: Tafsir = new Tafsir(tafsirAyah, 2, tafsirText);
            let exptectedSpan: string = `<span class="tafsir" data-toggle="popover" title="${tafsirText}">${ayahFromMushaf}</span>`;

            let result: string = QuranPageHelper.patchTafsirOnContent(tafsir, TestData.SURAT_AL_FALAQ);
            let expected: string = TestData.SURAT_AL_FALAQ.replace(ayahFromMushaf, exptectedSpan);
            expect(result).toEqual(expected);
        });

    it(`Given quran content for surat elfalaq 2 and tafsir is provided 
        When patchTafsirOnContent is called 
        Then it should replace the matched string with tafsir span`, () => {
            let tafsirText: string = "بربّ الصّـبْح والخَـلـْـق كلـّهمْ";
            let tafsirAyah: string = "بربّ الفلق";
            let ayahFromMushaf: string = "بِرَبِّ ٱلۡفَلَقِ";
            let tafsir: Tafsir = new Tafsir(tafsirAyah, 2, tafsirText);
            let exptectedSpan: string = `<span class="tafsir" data-toggle="popover" title="${tafsirText}">${ayahFromMushaf}</span>`;

            let result: string = QuranPageHelper.patchTafsirOnContent(tafsir, TestData.SURAT_AL_FALAQ);
            let expected: string = TestData.SURAT_AL_FALAQ.replace(ayahFromMushaf, exptectedSpan);
            expect(result).toEqual(expected);
    });

    it(`Given quran content and tafsir is provided 
        When patchTafsirOnContent is called 
        Then it should replace the matched string with tafsir span`, () => {
            let tafsirText: string = "بربّ الصّـبْح والخَـلـْـق كلـّهمْ";
            let tafsirAyah: string = "بربّ الفلق";
            let ayahFromMushaf: string = "بِرَبِّ ٱلۡفَلَقِ";
            let tafsir: Tafsir = new Tafsir(tafsirAyah, 2, tafsirText);
            let exptectedSpan: string = `<span class="tafsir" data-toggle="popover" title="${tafsirText}">${ayahFromMushaf}</span>`;

            let result: string = QuranPageHelper.patchTafsirOnContent(tafsir, TestData.SURAT_AL_FALAQ);
            let expected: string = TestData.SURAT_AL_FALAQ.replace(ayahFromMushaf, exptectedSpan);
            expect(result).toEqual(expected);
    });

    it(`Given quran content with a word inside span is provided
        When same word is provided again for tafisr 
        Then it should replace only the second word not one in span already`, () => {
        let ayah: string = "ٱعوذ";
        let tafsir: Tafsir = new Tafsir(ayah, 2, '');
        let content: string = `<span class="tafsir" data-toggle="popover" title="">${ayah}</span>`;
        let pageContent: string = content + ayah;
        let result: string = QuranPageHelper.patchTafsirOnContent(tafsir, pageContent);
        expect(result).toEqual(content + content);
    });

});