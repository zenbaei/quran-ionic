import { ArabicUtils } from "../../app/util/arabic-utils/arabic-utils";
import { Tafsir } from '../../app/domain/tafsir';
import { Search } from "../../app/util/search-utils/search";
import { QuranPageService } from '../../app/service/quran-page/quran-page.service';
import { RegexUtils } from "../../app/util/regex-utils/regex-utils";

export class QuranPageHelper {

    // both below vars were added to prevent replacing word inside a span already
    private static readonly EXCLUDE: string = '(?!<)';
    private static readonly CHARS_TO_REMOVE = new RegExp('<.*'); 
    private static readonly EMPTY: string = '';
    

    public static patchTafsirOnContent(tafsir: Tafsir, pageContent: string): string {
        console.debug(`Patch tafsir on quran page content - ayah ${tafsir.ayah}`);
        let pageContentCopy: string = pageContent;

        let ayahToMatch: string = QuranPageService.normalizeString(tafsir.ayah);
        let search: Search = new Search(ayahToMatch + this.EXCLUDE, pageContentCopy);

        if (!search.test()) {
            throw new Error(`Ayah [${tafsir.ayah}] not matching target [${pageContentCopy}]`);
        }

        let matchedAyah: string = search.group().trim().replace(this.CHARS_TO_REMOVE, this.EMPTY);
        let span: string = `<a href="#" class="tafsir" data-toggle="popover" data-placement="top" data-trigger="focus" data-viewport="" title="${tafsir.tafsir}">${matchedAyah}</a>`;
        let regex: RegExp = new RegExp(matchedAyah + this.EXCLUDE);
        pageContentCopy = pageContentCopy.replace(regex, span);
        
        return pageContentCopy;
    }

    public static surrondEachLineInDiv(content: string): string {
        let strArr: string[] = content.split('\n');
        let newContent: string = '';
        strArr.forEach(str => newContent += `<div>${str}</div>`);
        return newContent;
    } 
   
}