import { QuranPageComponentHelper } from "./quran-page.component.helper";
import { Search } from "../../app/util/search-utils/search";
import * as TestData from "../../test-data";
import { Tafsir } from '../../app/domain/tafsir';

describe('QuranPageComponentHelper', () => {

    let tafsirArr: Tafsir[] = [ 
            new Tafsir("ربّ العالمين", 2, "مربّيهم ومالكهم ومدبر أمورهم"),
            new Tafsir("يوم الدّين", 4, "يوم الجزاء"),
            new Tafsir("اهدنا الصّراط المستقيم", 6, "وفّقنا للثّبات على الطريق الواضح الذي لا اعوجاج فيه وهو الإسلام"),
            new Tafsir("المغضوب عليهم", 7, "اليهود"),
            new Tafsir("الضّالين", 7, "النصارى وكذا أشباههم في الضلال")
            ];

   
    it(`Given tafsir ayah and mushaf content is provided When normalizeString is called Then Search should return true 
        as long as the searched ayah is on the one line with no break`, () => {
        let tafsirAyah: string = QuranPageComponentHelper.normalizeString('ٱلرحمن الرحيم');
        let search: Search = new Search(tafsirAyah, TestData.SURAT_AL_FATEHA);
        expect(search.test()).toBeTruthy();
    });
    
    it('Given a string is provided along with its Search object When replace is called Then it should replace the matched string', () => {
        let str: string = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّاحِيمِ مالك";
        let tafsirAyah: string = QuranPageComponentHelper.normalizeString('بسم الله الرحمان الراحيم');
        let search: Search = new Search(tafsirAyah, str);
        let result: string = QuranPageComponentHelper.replace(str, search.group().trim(), 'ربي');
        expect(result).toEqual('ربي مالك');
    });

     it('Given quran content and tafsir is provided When patchTafsirOnContent is called Then it should replace the matched string with tafsir span', () => {
        let tafsirText: string = "مربّيهم ومالكهم ومدبر أمورهم";
        let tafsirAyah: string = "ربّ العالمين";
        let ayahFromMushaf: string = "رَبِّ ٱلۡعَٰلَمِينَ";
        let tafsir: Tafsir = new Tafsir(tafsirAyah, 2, tafsirText);
        let span: string = `<span class="tafsir" data-toggle="popover" title="${tafsirText}">${ayahFromMushaf}</span>`;
        
        let result: string = QuranPageComponentHelper.patchTafsirOnContent(tafsir, TestData.SURAT_AL_FATEHA);
        let expected: string = TestData.SURAT_AL_FATEHA.replace(ayahFromMushaf, span);
        expect(result).toEqual(expected);
    });

    it('Given quran content and tafsir is provided When patchTafsirOnContent is called Then it should throw no Error exception', () => {
        tafsirArr.forEach(tf => QuranPageComponentHelper.patchTafsirOnContent(tf, TestData.SURAT_AL_FATEHA));
    });

    it(`Given a string with line break is provided When it's used to match content Then it should match the string with line break`, () => {
        let stringToMatch: string = `ٱهۡدِنَا \n?ٱلصِّرَٰط`;
        let search: Search = new Search(stringToMatch, TestData.SURAT_AL_FATEHA);
        expect(search.test()).toBeTruthy();
    })

    it('Removing exccessed', () =>{
        let stringToMatch: string = "سَيَصلى نارًا";
        let ayah: string = `سَيَصۡلَىٰ نَارٗا ذَات`;
        let tafsir: Tafsir = new Tafsir(stringToMatch, 2, '');
        let testToken_1 = `سَيَصۡلَىٰ نَارٗا`;
        let testToken_2 = 'ذَاتَ';
        let search: Search = new Search(QuranPageComponentHelper.normalizeString(stringToMatch), ayah);
        expect(search.group()).toBe(testToken_1);
       /*
        let expected: string = `<span class="tafsir" data-toggle="popover" title="">${testToken_1}</span> ${testToken_2}`;
        let result: string = QuranPageComponentHelper.patchTafsirOnContent(tafsir, ayah);
        expect(result).toEqual(expected);*/
    });
});