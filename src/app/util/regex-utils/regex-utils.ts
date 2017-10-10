import { StringUtils } from "../string-utils/string-utils";

 export class RegexUtils {
    
    /**
     * Add line break and then zero or one metacharacter '\n?' to match text splited on 2 lines.
     * 
     * ex; اهدنا الصراط المستقيم تاتي على سطرين
     * 
     * @param str 
     */
    public static addLineBreakAfterEachWord(str: string) : string {
        console.debug(`Add line breaks after each word from ${str}`);
        let splited: string[] = str.split(' ');
        let result: string = '';
        for (let i= 0; i < splited.length; i++) {
            if (i === splited.length -1) { // last word
                result += splited[i];
            } else {
                result += splited[i] + SPACE + LINE_TERMINATOR + ZERO_OR_ONE;
            }
        }
        console.debug(`After adding line breaks [${result}]`);
        return result.trim();
    }

    public static removeTashkil(str: string): string {
        console.debug(`Remove Tashkil from [${str}]`);
        for (let s of TASHKIL_CHARACTERS_ARRAY) {
            if (str.indexOf(s) > 0) {
                str = StringUtils.replaceAll(str, s, EMPTY_STRING);
            }
        }
        console.debug(`After removing Tashkil ${str}`);
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
        console.debug(`After removing middle Alef ${result.trim()}`);
        return result.trim();
    }

    /**
     * After each char add '.?.?' to cover one tashkil or two by maximun after every character.
     * 
     * @param str 
     */
    public static addRegexDotMetaCharInBetween(str: string) {
        console.debug(`Add dot for zero or one time twice [${str}]`);
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
        console.debug(`Remove every Alef from [${str}]`);
        let result: string = str;
        for (let c of ALEFS) {
            result = StringUtils.replaceAll(result, c, ONE_CHAR + ZERO_OR_ONE);
        }
        console.debug(`After removing every Alef ${result.trim()}`);
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
        console.debug(`After removing first Alef ${result.trim()}`);
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
        //console.debug(`string without regex ${strWithoutRegex}`);
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
const GLOBAL: string = "g";
const ONE_CHAR: string = ".";
const ALEF_ABSTRACTED: string = "ا";
const ALEF_SKOON: string = "ٱ";
const LINE_TERMINATOR = '\n';
const SPACE = ' ';
const ZERO_OR_ONE: string = "?";
const ALEFS: string[] = ["أ", "آ", "إ", "ٱ", "ا"];

const TASHKIL_CHARACTERS_ARRAY: string[] = ["\u0610", "\u0611", "\u0612", "\u0613",
"\u0614", "\u0615", "\u0616", "\u0617", "\u0618", "\u0619", "\u061A", "\u06D6", "\u06D7",
"\u06D8", "\u06D9", "\u06DA", "\u06DB", "\u06DC", "\u06DD", "\u06DE", "\u06DF", "\u06E0",
"\u06E1", "\u06E2", "\u06E3", "\u06E4", "\u06E5", "\u06E6", "\u06E7", "\u06E8", "\u06E9",
"\u06EA", "\u06EB", "\u06EC", "\u06ED", "\u0640", "\u064B", "\u064C", "\u064D", "\u064E",
"\u064F", "\u0650", "\u0651", "\u0652", "\u0653", "\u0654", "\u0655", "\u0656", "\u0657",
"\u0658", "\u0659", "\u065A", "\u065B", "\u065C", "\u065D", "\u065E", "\u065F", "\u0670"];