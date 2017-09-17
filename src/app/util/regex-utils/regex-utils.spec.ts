import { RegexUtils } from "./regex-utils";

describe('RegexUtils', () => {

    it('Given a string with spaces is provided When addLineBreakAfterEachWord is called Then it should add regex line break then zero or one metacharacter after each word', () => {
        let phrase: string = 'Hi how are';
        let result: string = RegexUtils.addLineBreakAfterEachWord(phrase);
        expect(result).toBe('Hi \n?how \n?are');
    });
 
});