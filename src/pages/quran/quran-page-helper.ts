import { Tafsir } from '../../app/domain/tafsir';
import { Search } from "../../app/util/search-utils/search";
import { QuranService } from '../../app/service/quran/quran-service';
import { StringUtils } from '../../app/util/string-utils/string-utils';

export class QuranPageHelper {

    private static EXCLUDE: string = '(?!<)'; // to prevent replacing word inside a span already
    

    /*
    * This will result in exact matching 'ayah' from tafsir. it was introduced to avoid matching quran ayah to tafsir.
    * like 'بَلَىٰ' from yassen 18 matches tafsir {"ayah":"هي رميم", "ayahNumber":78, "tafsir":"بالية أشدّ البلى"}
    */
    private static readonly NO_NORMALIZATION = '\\noNormalization';


    public static patchTafsirOnContent(tafsir: Tafsir, pageContent: string): string {
        console.debug(`Patch tafsir on quran page content - ayah ${tafsir.ayah}`);
        let pageContentCopy: string = pageContent;

        let search: Search = this.initSearch(tafsir, pageContentCopy);

        if (!search.test()) {
            return pageContent;
            //throw new Error(`Ayah [${tafsir.ayah}] not matching target [${pageContentCopy}]`);  // uncomment when dev
        }

        let matchedAyah: string = search.group().trim().replace(CHARS_TO_REMOVE, EMPTY);
        let replacement: string = `<a ${ANCHOR_ATT} title="${tafsir.tafsir}">${matchedAyah}</a>`;

        let regex: RegExp = new RegExp(matchedAyah + this.EXCLUDE);
        pageContentCopy = pageContentCopy.replace(regex, replacement);

        return pageContentCopy;
    }

    private static initSearch(tafsir: Tafsir, pageContentCopy: string): Search {
        // in case of no normalization, do exact match
        this.EXCLUDE = tafsir.ayah.indexOf(this.NO_NORMALIZATION) > -1 ? '' : this.EXCLUDE;

        let ayahToMatch: string = tafsir.ayah.indexOf(this.NO_NORMALIZATION) > -1 ? tafsir.ayah.replace(this.NO_NORMALIZATION, '') :
            QuranService.normalizeString(tafsir.ayah);

        return new Search(ayahToMatch + this.EXCLUDE, pageContentCopy);
    }

    public static surrondEachLineInDiv(content: string, pageNumber: number): string {
        let lines: string[] = content.split('\n');
        let newContent: string = '';
        lines.forEach(str => {
            if (newContent === '' || newContent.split('\n').length == 2) { //first-line or second-line
                str = QuranPageHelper.replacePopoverTopWithButtom(str);
            }

            if (this.isCenteredLine(str, pageNumber)) {
                newContent += `<div ${NO_JUSTIFY_CLASS}><nobr>${str}</nobr></div>\n`;
            } else {
                newContent += `<div><nobr>${str}</nobr></div>\n`;
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
        if (str.trim().split(' ').length === 2 || // سورة النساء
            str.trim().split(' ').length === 3 || // 'سورة آل عمرآن'
            (str.trim().split(' ').length === 4 && str.trim().split(' ')[0] === BESM) || //بسم الله الرحمن الرحيم
            (str.indexOf(KAFROUN) != -1 && pageNumber === 603) ||
            (str.indexOf(MASAD) != -1 && pageNumber === 603) ||
            (str.indexOf(NASR) != -1 && pageNumber === 603) ||
            (str.indexOf(KAWTHAR) != -1 && pageNumber === 602) ||
            (str.indexOf(MAOUN) != -1 && pageNumber === 602) ||
            (str.indexOf(QAREA) != -1 && pageNumber === 600) ||
            str === KORAYSH ||
            str === FAJR ||
            str === NAJM) {
            return true;
        }
        return false;
    }
}

const EMPTY: string = '';
const ANCHOR_ATT = `tabindex="0" role="botton" class="fake-link tafsir" data-toggle="popover" data-placement="top"`;
const CHARS_TO_REMOVE = new RegExp('<.*'); // to prevent replacing word inside a span already

const KAFROUN = 'وَلَآ أَنتُمۡ عَٰبِدُونَ مَآ أَعۡبُدُ ٥';
const MASAD = 'مِّن مَّسَدِۢ';
const NASR = 'وَٱسۡتَغۡفِرۡهُۚ إِنَّهُۥ';
const KAWTHAR = 'هُوَ ٱلۡأَبۡتَرُ';
const MAOUN = 'وَيَمۡنَعُونَ ٱلۡمَاعُونَ';
const KORAYSH = 'مِّن جُوعٖ وَءَامَنَهُم مِّنۡ خَوۡفِۢ ٤ ';
const QAREA = 'نَارٌ حَامِيَةُۢ ١١ ';
const FAJR = 'فَٱدۡخُلِي فِي عِبَٰدِي ٩٢ وَٱدۡخُلِي جَنَّتِي ٠٣ ';
const NAJM = '١٦ فَٱسۡجُدُواْۤ لِلَّهِۤ وَٱعۡبُدُواْ۩ ٢٦ ';
const BESM = 'بِسۡمِ';
const NO_JUSTIFY_CLASS = 'class = "no-justify"';
