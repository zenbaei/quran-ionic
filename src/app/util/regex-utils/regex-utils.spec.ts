import { RegexUtils } from "./regex-utils";

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

    it(`Given an arabic text contains 'ا' alaf character in middle When removeMiddleAlef is called 
        Then it should return the text middle alef and leaves first and last alef. test 1`, () => {
        let stringWithoutAlef = RegexUtils.removeMiddleAlef('الضالينا العالمين');
        expect(stringWithoutAlef).toEqual('الضلينا العلمين');
    });

    it(`Given an arabic text contains 'ا' alaf character in middle When removeMiddleAlef is called 
        Then it should remove the text's middle alef and leaves first and last alef. test 2`, () => {
        let stringWithoutAlef = RegexUtils.removeMiddleAlef("اهدنا الصّراط المستقيم");
        expect(stringWithoutAlef).toEqual("اهدنا الصّرط المستقيم");
    });

    it(`Given an arabic text is proviced When addRegexDotMetaCharInBetween is called 
        Then it should return string with regex .?.? after every character`, () => {
        let regex: string = '.?.?';
        let str: string = 'ك ب';
        let exptected = 'ك' + regex + ' ' + 'ب' + regex;
        expect(RegexUtils.addRegexDotMetaCharInBetween(str)).toEqual(exptected);   
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
 
});