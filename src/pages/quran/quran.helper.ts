import { ArabicUtils } from "../../app/util/arabic-utils/arabic-utils";
import { Tafsir } from '../../app/domain/tafsir';
import { Search } from "../../app/util/search-utils/search";
import { QuranPageService } from '../../app/service/quran-page/quran-page.service';
import { RegexUtils } from "../../app/util/regex-utils/regex-utils";
import { StringUtils } from '../../app/util/string-utils/string-utils';

export class QuranPageHelper {

    // both below vars were added to prevent replacing word inside a span already
    private static EXCLUDE: string =  '(?!<)';
    private static readonly CHARS_TO_REMOVE = new RegExp('<.*'); 
    private static readonly EMPTY: string = '';
    private static readonly LINE_BREAK: string = '\n';
    private static readonly NO_JUSTIFY_CLASS = `class='no-justify'`;
    private static readonly SPAN_CLASS = `class="fake-link tafsir" tabindex="0" data-toggle="popover" data-placement="top" data-trigger="focus"`;
    /*
    * This will result in exact matching 'ayah' from tafsir. it was introduced to avoid matching quran ayah to tafsir.
    * like 'بَلَىٰ' from yassen 18 matches tafsir {"ayah":"هي رميم", "ayahNumber":78, "tafsir":"بالية أشدّ البلى"}
    */
    private static readonly NO_NORMALIZATION= '\\noNormalization'; 
    

    public static patchTafsirOnContent(tafsir: Tafsir, pageContent: string): string {
        console.debug(`Patch tafsir on quran page content - ayah ${tafsir.ayah}`);
        let pageContentCopy: string = pageContent;

        // in case of no normalization, do exact match
        this.EXCLUDE = tafsir.ayah.indexOf(this.NO_NORMALIZATION) > -1 ? '' : this.EXCLUDE;
        
        let ayahToMatch: string = tafsir.ayah.indexOf(this.NO_NORMALIZATION) > -1 ? tafsir.ayah.replace(this.NO_NORMALIZATION, '') :
            QuranPageService.normalizeString(tafsir.ayah);
        
            let search: Search = new Search(ayahToMatch + this.EXCLUDE, pageContentCopy);

        if (!search.test()) {
            throw new Error(`Ayah [${tafsir.ayah}] not matching target [${pageContentCopy}]`);
        }

        let matchedAyah: string = search.group().trim().replace(this.CHARS_TO_REMOVE, this.EMPTY);
        // if on 2 lines then add span for each (before adding div for everyline it was working, so i had to make it that way after div for everyline)
        let spans: string[] = [];
        let matchings: string[] = [];
        
        /* This will add tafsir span to both words when matching words with break within.
        * Don't remember what was the issue before adding it.
        */
        if (matchedAyah.indexOf(this.LINE_BREAK) > 0) {
            matchings = matchedAyah.split(this.LINE_BREAK);
            let span_1: string = `<a ${this.SPAN_CLASS} title="${tafsir.tafsir}">${matchings[0].trim()}</a> `;
            let span_2: string = `<a ${this.SPAN_CLASS} title="${tafsir.tafsir}">${matchings[1].trim()}</a>`;
            spans.push(span_1, span_2);
        } else {
            let span_1: string = `<a ${this.SPAN_CLASS} title="${tafsir.tafsir}">${matchedAyah}</a>`;
            spans.push(span_1);
        }
        
        if (spans.length > 1) {
            let regex_1: RegExp = new RegExp(matchings[0] + this.EXCLUDE);
            let regex_2: RegExp = new RegExp(matchings[1] + this.EXCLUDE);

            pageContentCopy = pageContentCopy.replace(regex_1, spans[0]);
            pageContentCopy = pageContentCopy.replace(regex_2, spans[1]);
        } else {
            let regex: RegExp = new RegExp(matchedAyah + this.EXCLUDE);
            pageContentCopy = pageContentCopy.replace(regex, spans[0]);
        }

        return pageContentCopy;
    }

    public static surrondEachLineInDiv(content: string): string {
        if (content.indexOf('div') >= 0) { //in case of page with 2 or more metadata, surrondEachLineInDiv is called per every surah metadata
            return;
        }
        let strArr: string[] = content.split('\n');
        let newContent: string = '';
        strArr.forEach(str => {
            if (newContent === '') { //first-line
                str = QuranPageHelper.replacePopoverTopWithButtom(str);
            }

            if (str.trim().split(' ').length === 2 || str.trim().split(' ').length === 3 || // 'سورة آل عمرآن'
                    (str.trim().split(' ').length === 4 && str.trim().split(' ')[0] === 'بِسۡمِ') ) { // 'سورة النساء' || بسم الله الرحمن الرحيم
                newContent += `<div ${this.NO_JUSTIFY_CLASS}>${str}</div>`;
            } else {
                newContent += `<div>${str}</div>`;
            }
        });
        return newContent;
    }
   
    /**
     * It was added to avoid getting tafsir popover hidden when on first line.
     * @param str 
     */
    private static replacePopoverTopWithButtom(str: string): string {
        return StringUtils.replaceAll(str, 'top', 'bottom');
    }
}