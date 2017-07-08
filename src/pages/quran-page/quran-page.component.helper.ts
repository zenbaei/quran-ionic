import { ArabicUtils } from "../../app/util/arabic-utils/arabic-utils";
import { Tafsir } from '../../app/domain/tafsir';
import { Search } from "../../app/util/search-utils/search";

export class QuranPageComponentHelper {

    public static patchTafsirOnContent(tafsir: Tafsir, pageContent: string): string {
        console.debug(`Patch tafsir on quran page content - ayah ${tafsir.ayah}`);
        let pageContentCopy: string = pageContent;

        tafsir.ayah.split(' ').forEach(ayahToken => {
            let ayahToMatch: string = this.normalizeString(ayahToken);
            let search: Search = new Search(ayahToMatch, pageContentCopy);

            if (!search.test()) {
                throw new Error(`Ayah [${tafsir.ayah}] not matching target [${pageContentCopy}]`);
            }

            let span: string = `<span class="tafsir" data-toggle="popover" title="${tafsir.tafsir}">${search.group().trim()}</span>`;
            pageContentCopy = this.replace(pageContentCopy, search.group().trim(), span);
        });
        
        return pageContentCopy;
    }

    /**
     * First removes tashkil then adds (zero or max two chars) after each character in the string 
     * then replaces first abstracted alef with (one char or zero) then replaces middle alef (which will have .?.? after it from 
     * addRegexDotMetaCharInBetween) in that case it will match quran text whether it has alaf in between or not.
     * @param str 
     */
    public static normalizeString(str: string): string {
        return ArabicUtils.replaceFirstAlefCharWithAlefSkoon(
                 ArabicUtils.removeMiddleAlef( 
                   ArabicUtils.addRegexDotMetaCharInBetween( 
                     ArabicUtils.removeTashkil(str))));
    }

    /*
    public static substring(source: string, search: Search): string {
        let from: number = search.first();// + 2;
        let to: number = search.length();// - 3;
        console.debug(`Substring from [${from}] to [${to}] - source [${source}]`);
        return source.substr(from, to);
    }
    */

    public static replace(source: string, pattern: string, replacement: string): string {
        console.debug(`Replace [${pattern}] from source [${replacement}]`);
        let regex: RegExp = new RegExp(pattern);
        return source.replace(regex, replacement);
    }
}