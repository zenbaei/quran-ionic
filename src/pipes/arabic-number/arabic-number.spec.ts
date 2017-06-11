import { ArabicNumberPipe } from './arabic-number';

describe('ArabicNumberPipe', () => {

    let pipe: ArabicNumberPipe;

    beforeEach(() => {
        pipe = new ArabicNumberPipe();
    });

    it('Given an english number is provided When ArabicNumberPipe transform is called Then it should return the arabic equivilant', () => {
        let arNumber: string = pipe.transform('103');
        expect(arNumber).toEqual('١٠٣');
    });

});
