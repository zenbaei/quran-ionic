import { Tafsir } from '../../app/domain/tafsir';
import { Search } from "../../app/util/search-utils/search";
import { QuranService } from '../../app/service/quran/quran-service';
import { PAGES_FONT } from './quran-page-constants';

export class QuranPageHelper {

    private static EXCLUDE: string = '(?!<)'; // to prevent replacing word inside a span already

    public static patchTafsirOnContent(tafsir: Tafsir, pageContent: string): string {
        //console.debug(`Patch tafsir on quran page content - ayah ${tafsir.ayah}`);
        let pageContentCopy: string = pageContent;

        let search: Search = this.initSearch(tafsir, pageContentCopy);

        if (!search.test()) {
            return pageContent;
            //throw new Error(`Ayah [${tafsir.ayah}] not matching target [${pageContentCopy}]`);  // uncomment when dev
        }

        let matchedAyah: string = search.group().trim().replace(CHARS_TO_REMOVE, EMPTY);
        let replacement: string = `<a ${ANCHOR_ATT} data-content="${tafsir.tafsir}">${matchedAyah}</a>`;

        let regex: RegExp = new RegExp(matchedAyah + this.EXCLUDE);
        pageContentCopy = pageContentCopy.replace(regex, replacement);

        return pageContentCopy;
    }

    private static initSearch(tafsir: Tafsir, pageContentCopy: string): Search {
        // in case of no normalization, do exact match
        this.EXCLUDE = tafsir.ayah.indexOf(NO_NORMALIZATION) > -1 ? '' : this.EXCLUDE;

        let ayahToMatch: string = tafsir.ayah.indexOf(NO_NORMALIZATION) > -1 ?
            tafsir.ayah.replace(NO_NORMALIZATION, '') :
            QuranService.normalizeString(tafsir.ayah);

        return new Search(ayahToMatch + this.EXCLUDE, pageContentCopy);
    }

    public static surrondEachLineInDiv(content: string, pageNumber: number): string {
        let lines: string[] = content.split('\n');
        let newContent: string = '';

        lines.forEach((str, index) => {
            if (this.isCenteredLine(str, pageNumber)) {
                newContent += `<div style="font-size:${DEFAULT_FONT_SIZE}" class='no-justify'><nobr>${str}</nobr></div>\n`;
            } else {
                newContent += `<div style="font-size:${this.getFontSize(pageNumber, index + 1)}"><nobr>${str}</nobr></div>\n`;
            }
        });
        return newContent;
    }

    private static isCenteredLine(str: string, pageNumber: number): boolean {
        if (str.trim().split(' ').length === 2 || // سورة النساء
            str.trim().split(' ').length === 3 || // 'سورة آل عمرآن'
            (str.trim().split(' ').length === 4 && str.trim().split(' ')[0] === BESM) || //بسم الله الرحمن الرحيم
            (str.indexOf(RAAD) != -1 && pageNumber === 255) ||
            (str.indexOf(NAJM) != -1 && pageNumber === 528) ||
            (str.indexOf(GHASHEYA) != -1 && pageNumber === 593) ||
            (str.indexOf(FAJR) != -1 && pageNumber === 594) ||
            (str.indexOf(QAREA) != -1 && pageNumber === 600) ||
            (str.indexOf(KAWTHAR) != -1 && pageNumber === 602) ||
            (str.indexOf(MAOUN) != -1 && pageNumber === 602) ||
            (str.indexOf(KORAYSH) != -1 && pageNumber === 602) ||
            (str.indexOf(KAFROUN) != -1 && pageNumber === 603) ||
            (str.indexOf(MASAD) != -1 && pageNumber === 603) ||
            (str.indexOf(NASR) != -1 && pageNumber === 603)) {
            return true;
        }
        return false;
    }

    private static getFontSize(pageNumber: number, lineNumber: number): string {
        let lnNuFtSz: Map<number, number> = PAGES_FONT.get(pageNumber);
        if (lnNuFtSz != null && lnNuFtSz.get(lineNumber) != null) {
            return lnNuFtSz.get(lineNumber) + 'vw';
        }
        return DEFAULT_FONT_SIZE;
    }

}

const EMPTY: string = '';
const ANCHOR_ATT = `tabindex="0" role="button" class="fake-link tafsir" data-toggle="popover" data-placement="top"`;
const CHARS_TO_REMOVE = new RegExp('<.*'); // to prevent replacing word inside a span already

const RAAD = 'عِلۡمُ ٱلۡكِتَٰبِ';
const GHASHEYA = 'ثُمَّ إِنَّ عَلَيۡنَا حِسَابَهُم';
const KAFROUN = 'وَلِيَ دِينِ';
const MASAD = 'مِّن مَّسَدِۢ';
const NASR = 'وَٱسۡتَغۡفِرۡهُۚ إِنَّهُۥ';
const KAWTHAR = 'هُوَ ٱلۡأَبۡتَرُ';
const MAOUN = 'وَيَمۡنَعُونَ ٱلۡمَاعُونَ';
const KORAYSH = 'مِّن جُوعٖ وَءَامَنَهُم مِّنۡ خَوۡفِۢ';
const QAREA = 'نَارٌ حَامِيَةُۢ';
const FAJR = 'فَٱدۡخُلِي فِي عِبَٰدِي ';
const NAJM = 'فَٱسۡجُدُواْۤ لِلَّهِۤ وَٱعۡبُدُواْ';
const BESM = 'بِسۡمِ';
const NO_NORMALIZATION = '\\noNormalization';
const DEFAULT_FONT_SIZE = '4.8vw';