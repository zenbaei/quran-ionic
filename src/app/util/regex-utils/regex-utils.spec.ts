import { RegexUtils } from "./regex-utils";
import * as TestData from "../../../test-data";

describe('RegexUtils', () => {

    it('Given a string with spaces is provided When addLineBreakAfterEachWord is called Then it should add regex line break then zero or one metacharacter after each word', () => {
        let phrase: string = 'Hi how are';
        let result: string = RegexUtils.addLineBreakAfterEachWord(phrase);
        expect(result).toBe('Hi \n?how \n?are');
    });

    it('Given a text with tashkil is provided When removeTashkil is called Then it should return the string without tashkil', () => {
        let stringWithoutTahskil = RegexUtils.removeTashkil('سُورَةُ الفَاتِحَةِ');
        expect(stringWithoutTahskil).toEqual('سورة الفاتحة');
    });

    it(`Given an arabic text contains 'ا' alaf character in middle 
        When replaceMiddleAlefsWithNonSpaceZeroOrOneTime is called 
        Then it should return the text middle alef and leaves first and last alef. test 1`, () => {
        expect('الض\\S?\\S?لينا الع\\S?\\S?لمين').toEqual(RegexUtils.replaceMiddleAlefsWithNonSpaceZeroOrOneTime('الضالينا العالمين'));
    });

    it(`Given an arabic text contains 'ا' alaf character in middle When removeMiddleAlef is called 
        Then it should remove the text's middle alef and leaves first and last alef. test 2`, () => {
        expect("اهدنا الصّر\\S?\\S?ط المستقيم").toEqual(RegexUtils.replaceMiddleAlefsWithNonSpaceZeroOrOneTime("اهدنا الصّراط المستقيم"));
    });

    it(`Given an arabic text contains 2 'ا' alaf character in middle 
        When removeMiddleAlef is called 
        Then it should remove the text's middle alef and leaves first and last alef. test 3`, () => {
        expect('النف\\S?\\S?ث\\S?\\S?ت').toEqual(RegexUtils.replaceMiddleAlefsWithNonSpaceZeroOrOneTime("النفاثات"));
    });

    it(`Given an arabic text is provided 
        When addRegexDotMetaCharInBetween is called 
        Then it should return string with regex \S?\S? after every character`, () => {
        let regex: string = '\\S?\\S?';
        let str: string = 'ك ب';
        let exptected = 'ك' + regex + ' ' + 'ب' + regex;
        expect(RegexUtils.addRegexNonWhiteSpaceMetaCharInBetween(str)).toEqual(exptected);   
    });

     it(`Given an arabic text is provided When replaceAlefWithRegexDotMetaChar is called 
        Then it should replace alef with a dot and exclamation mark`, () => {
        let str: string = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';
        let expectedStr = 'بِسۡمِ .?للَّهِ .?لرَّحۡمَٰنِ .?لرَّحِيمِ'; ;
        expect(RegexUtils.replaceAlefWithRegexDotMetaChar(str)).toEqual(expectedStr);
    });

     it(`Given an arabic text is provided When replaceFirstAlefCharWithAlefSkoon is called 
        Then it should replace first char if alef with alef skoon. test 1`, () => {
        let str: string = 'بِسۡمِ اللَّهِ الرَّحۡمَٰنِ الرَّحِيمِ';
        let expectedStr = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ'; ;
        expect(RegexUtils.replaceFirstAlefCharWithAlefSkoon(str)).toEqual(expectedStr);
    });

    it(`Given an arabic text is provided When replaceFirstAlefCharWithAlefSkoon is called 
        Then it should replace first char if alef with alef skoon. test 2`, () => {
        let str: string = "اهدنا الصّراط المستقيم";
        let expectedStr = "ٱهدنا ٱلصّراط ٱلمستقيم";
        expect(RegexUtils.replaceFirstAlefCharWithAlefSkoon(str)).toEqual(expectedStr);
    });
 
    it(`Given a string with line break is provided When it's used to match content Then it should match the string with line break`, () => {
        let patten: string = `ٱهۡدِنَا \n?ٱلصِّرَٰط`;
        let regex: RegExp = new RegExp(patten);
        expect(regex.exec(TestData.SURAT_AL_FATEHA)).toBeTruthy();
    });

    /* testing multiline flag failed
    it(`Given a content with 2 words seperated by line break is provided
        When addRegexDotMetaCharInBetween is used with multiline flag
        Then it should match the string with line break`, () => {
        let pattern: string = RegexUtils.addRegexDotMetaCharInBetween(`ٱهۡدِنَا ٱلصِّرَٰط`);
        let regex: RegExp = new RegExp(pattern, 'm');
        expect(regex.exec(TestData.SURAT_AL_FATEHA)).toBeTruthy();
    });
    */
});