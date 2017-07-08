import { StringUtils } from './string-utils';

describe('StringUtils', () => {

    it(`Given a string is provided When replaceAt is called 
        Then it should remove the character at the given index`, () => {
         let str: string = "air";
        expect(StringUtils.replaceAt(str, 1, '')).toEqual('ar');
    });

    it(`Given a string is provided When replaceAll is called 
        Then it should replaces all provided pattern`, () => {
         let str: string = "ٱل ٱل";
        expect(StringUtils.replaceAll(str, 'ٱل', 'ال')).toEqual('ال ال');
    });

});