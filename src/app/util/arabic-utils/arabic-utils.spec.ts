import * as Constants from '../../all/constants';
import { ArabicUtils } from './arabic-utils';

describe('ArabicUtils', () => {

    it('Given an english number is provided When toArabicNumber is called Then it should return the arabic equivilant', () => {
        expect(ArabicUtils.toArabicNumber(94)).toEqual('٩٤');
        expect(ArabicUtils.toArabicNumber(103)).toEqual('١٠٣');
    });
});
