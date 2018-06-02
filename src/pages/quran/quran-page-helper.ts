import { Tafsir } from '../../app/domain/tafsir';
import { Search } from "../../app/util/search-utils/search";
import { QuranService } from '../../app/service/quran/quran-service';
import { StringUtils } from '../../app/util/string-utils/string-utils';

export class QuranPageHelper {

    // both below vars were added to prevent replacing word inside a span already
    private static EXCLUDE: string =  '(?!<)';
    private static readonly CHARS_TO_REMOVE = new RegExp('<.*'); 
    private static readonly EMPTY: string = '';
    private static readonly LINE_BREAK: string = '\n';

    public static readonly ANCHOR_ATT = `class="fake-link tafsir" tabindex="0" data-toggle="popover" data-placement="top" data-trigger="focus"`;

    /*
    * This will result in exact matching 'ayah' from tafsir. it was introduced to avoid matching quran ayah to tafsir.
    * like 'بَلَىٰ' from yassen 18 matches tafsir {"ayah":"هي رميم", "ayahNumber":78, "tafsir":"بالية أشدّ البلى"}
    */
    private static readonly NO_NORMALIZATION = '\\noNormalization'; 
    

    public static patchTafsirOnContent(tafsir: Tafsir, pageContent: string): string {
        console.debug(`Patch tafsir on quran page content - ayah ${tafsir.ayah}`);
        let pageContentCopy: string = pageContent;

        // in case of no normalization, do exact match
        this.EXCLUDE = tafsir.ayah.indexOf(this.NO_NORMALIZATION) > -1 ? '' : this.EXCLUDE;
        
        let ayahToMatch: string = tafsir.ayah.indexOf(this.NO_NORMALIZATION) > -1 ? tafsir.ayah.replace(this.NO_NORMALIZATION, '') :
            QuranService.normalizeString(tafsir.ayah);
        
            let search: Search = new Search(ayahToMatch + this.EXCLUDE, pageContentCopy);

        
        if (!search.test()) {
            return pageContent;
            //throw new Error(`Ayah [${tafsir.ayah}] not matching target [${pageContentCopy}]`);  // uncomment when dev
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
            let span_1: string = `<a ${this.ANCHOR_ATT} title="${tafsir.tafsir}">${matchings[0].trim()}</a> `;
            let span_2: string = `<a ${this.ANCHOR_ATT} title="${tafsir.tafsir}">${matchings[1].trim()}</a>`;
            spans.push(span_1, span_2);
        } else {
            let span_1: string = `<a ${this.ANCHOR_ATT} title="${tafsir.tafsir}">${matchedAyah}</a>`;
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

    public static surroundEachWordInADiv(content: string): string {
        let lines: string[] = content.split(LINE_BREAK);
        let newContent: string = '';
        // need to bypass splitting <a>
        lines.forEach(line => {
            let newLine: string = '';
            let words: string[] = line.split(' ');
            words.forEach(wrd => {
                newLine += `<div>${wrd}</div>`;
            });
            newContent += newLine;
        });

        return newContent;
    }

    public static surrondEachLineInDiv(content: string, pageNumber: number): string {
        let lines: string[] = content.split('\n');
        let newContent: string = '';
        lines.forEach(str => {
            if (newContent === '' || newContent.split('\n').length == 2) { //first-line or second-line
                str = QuranPageHelper.replacePopoverTopWithButtom(str);
            }

            if (str.trim().split(' ').length === 2 || 
                str.trim().split(' ').length === 3 || // 'سورة آل عمرآن'
                (str.trim().split(' ').length === 4 && str.trim().split(' ')[0] === 'بِسۡمِ') ||
                this.isCenteredLine(str, pageNumber)) { // 'سورة النساء' || بسم الله الرحمن الرحيم
                newContent += `<div ${NO_JUSTIFY_CLASS}>${str}</div>\n`;
            } else {
                newContent += `<div>${str}</div>\n`;
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

    private static isCenteredLine(str: string, pageNumber: number): boolean {
        if (str.indexOf(KAFROUN) != -1 && (pageNumber === 603)  ||
            str.indexOf(MASAD) != -1 && (pageNumber === 603) ||
            str.indexOf(NASR) != -1 && (pageNumber === 603) ||
            str.indexOf(KAWTHAR) != -1 && (pageNumber === 602) ||
            str.indexOf(MAOUN) != -1 && (pageNumber === 602) ||
            str.indexOf(QAREA) != -1 && (pageNumber === 600) ||
            str === KORAYSH || 
            str === FAJR ||
            str === NAJM) {
            return true;
        }
        return false;
    }
}

//const EKHLAS = 'أَحَدُۢ ٤ ';
//const FALAQ = 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ٥ ';
//const NAS_1 = 'يُوَسۡوِسُ فِي صُدُورِ ٱلنَّاسِ ٥ ';
//const NAS_2 = 'وَٱلنَّاسِ ٦';
//const ASR = 'وَتَوَاصَوۡاْ بِٱلصَّبۡرِ';
//const GHASHEYA = 'ثُمَّ إِنَّ عَلَيۡنَا حِسَابَهُم ٦٢ ';
const KAFROUN = 'وَلَآ أَنتُمۡ عَٰبِدُونَ مَآ أَعۡبُدُ ٥';
const MASAD = 'مِّن مَّسَدِۢ';
const NASR = 'وَٱسۡتَغۡفِرۡهُۚ إِنَّهُۥ';
const KAWTHAR = 'هُوَ ٱلۡأَبۡتَرُ';
const MAOUN = 'وَيَمۡنَعُونَ ٱلۡمَاعُونَ';
const KORAYSH = 'مِّن جُوعٖ وَءَامَنَهُم مِّنۡ خَوۡفِۢ ٤ ';
const QAREA = 'نَارٌ حَامِيَةُۢ ١١ ';
const FAJR = 'فَٱدۡخُلِي فِي عِبَٰدِي ٩٢ وَٱدۡخُلِي جَنَّتِي ٠٣ ';
const NAJM = '١٦ فَٱسۡجُدُواْۤ لِلَّهِۤ وَٱعۡبُدُواْ۩ ٢٦ ';

const NO_JUSTIFY_CLASS = 'class = "no-justify"';

const LINE_BREAK = '\n';