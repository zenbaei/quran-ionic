import { StringUtils } from "../string-utils/string-utils";
export class ArabicUtils {

    public static toArabicNumber(enNumber: number): string {
        console.debug(`Convert to arabic number [${enNumber}]`);
        let enNumberStr: string[] = enNumber.toLocaleString().split('');
        let arNumber: string = '';

        for (var char of enNumberStr) {
            arNumber += ENGLISH_ARABIC_NUMBER_MAP.get(char);
        }
        return arNumber;
    }

    public static removeTashkil(str: string): string {
        console.debug(`Remove tashkil from [${str}]`);
        for (let s of TASHKIL_CHARACTERS_ARRAY) {
            if (str.indexOf(s) > 0) {
                str = StringUtils.replaceAll(str, s, EMPTY_STRING);
            }
        }
        return str;
    }

    /**
     * Removes regex '.?' from the string if exists then removes 'ا' Alef from within the string but not start or end.
     * 
     * @param str 
     */
    public static removeMiddleAlef(str: string): string {
        console.debug(`Remove middle Alef from [${str}]`);
        let regex: RegExp = new RegExp(ALEF_ABSTRACTED, GLOBAL);
        var match;
        let strArr: Array<string> = str.split(SPACE);
        for (let i = 0; i < strArr.length; i++) {
            let word: string = strArr[i];
            while ((match = regex.exec(word)) != null) {
                if (this.isHavingMiddleAlef(strArr[i])) {
                    strArr[i] = StringUtils.replaceAt(word,  match.index, EMPTY_STRING);
                }
            }
        }

        let result: string = EMPTY_STRING;

        for (let w of strArr) {
            result += SPACE + w;
        }

        return result.trim();
    }

    /**
     * After each char add '.?.?' to absorb one tashkil or two by maximun after every character.
     * 
     * @param str 
     */
    public static addRegexDotMetaCharInBetween(str: string) {
        let result: string = EMPTY_STRING;
        for (let i = 0; i < str.length; i++) {
            let char: string = str.charAt(i);
            if (char === SPACE) {
                result += SPACE;
            } else {
                result += str.charAt(i) + ONE_CHAR + ZERO_OR_ONE + ONE_CHAR + ZERO_OR_ONE;
            }
        }
        return result;
    }

    /**
     * Replaces every alef with one char for zero or one time.
     * 
     * Zero in order to match alef when it comes in the middle as 'العلمين'.
     * 
     * @param str 
     */
    public static replaceAlefWithRegexDotMetaChar(str: string) {
        let result: string = str;
        for (let c of ALEFS) {
            result = StringUtils.replaceAll(result, c, ONE_CHAR + ZERO_OR_ONE);
        }
        return result;
    }

    /**
     * Replaces Abstracted alef with alef skoon if it comes as first character.
     * 
     * @param str 
     */
    public static replaceFirstAlefCharWithAlefSkoon(str: string) {
        let splitStr: string[] = str.split(SPACE);
        for (let i = 0; i < splitStr.length; i++) {
            let word: string = splitStr[i];
            if (word.startsWith(ALEF_ABSTRACTED)) {
                splitStr[i] = word.replace(ALEF_ABSTRACTED, ALEF_SKOON);
            }
        }

        let result: string = SPACE;
        for (let w of splitStr) {
            result += w + SPACE;
        }

        return result.trim();
    }

    /**
     * Remove Regex '.?' from the string and returns true if the string has alef within ignoring start and end.
     * @param str
     * @returns boolean
     */
    private static isHavingMiddleAlef(str: string): boolean {
        let regex: RegExp = new RegExp(ALEF_ABSTRACTED, GLOBAL);
        let strArr: string[] = str.split('');
        let strWithoutRegex: string = '';
        
        for (let s of strArr) {
            if (s !== ONE_CHAR && s !== ZERO_OR_ONE) {
                strWithoutRegex += s;
            }
        }
        console.debug(`string without regex ${strWithoutRegex}`);
        var match;
        while((match = regex.exec(strWithoutRegex.trim())) != null ) {
            if (match.index != 0 && match.index != strWithoutRegex.length - 1) {
                return true;
            }
        }
        return false;
    }
}

const EMPTY_STRING: string = "";
const SPACE: string = " ";
const GLOBAL: string = "g";
const ONE_CHAR: string = ".";
const ZERO_OR_ONE: string = "?";
const ALEF_ABSTRACTED: string = "ا";
const ALEF_SKOON: string = "ٱ";

const ENGLISH_ARABIC_NUMBER_MAP: Map<string, string> = new Map()
    .set('0', "٠")
    .set('1', "١")
    .set('2', "٢")
    .set('3', "٣")
    .set('4', "٤")
    .set('5', "٥")
    .set('6', "٦")
    .set('7', "٧")
    .set('8', "٨")
    .set('9', "٩");

const TASHKIL_CHARACTERS_ARRAY: string[] = ["\u0610", "\u0611", "\u0612", "\u0613",
    "\u0614", "\u0615", "\u0616", "\u0617", "\u0618", "\u0619", "\u061A", "\u06D6", "\u06D7",
    "\u06D8", "\u06D9", "\u06DA", "\u06DB", "\u06DC", "\u06DD", "\u06DE", "\u06DF", "\u06E0",
    "\u06E1", "\u06E2", "\u06E3", "\u06E4", "\u06E5", "\u06E6", "\u06E7", "\u06E8", "\u06E9",
    "\u06EA", "\u06EB", "\u06EC", "\u06ED", "\u0640", "\u064B", "\u064C", "\u064D", "\u064E",
    "\u064F", "\u0650", "\u0651", "\u0652", "\u0653", "\u0654", "\u0655", "\u0656", "\u0657",
    "\u0658", "\u0659", "\u065A", "\u065B", "\u065C", "\u065D", "\u065E", "\u065F", "\u0670"];

const ALEFS: string[] = ["أ", "آ", "إ", "ٱ", "ا"];

