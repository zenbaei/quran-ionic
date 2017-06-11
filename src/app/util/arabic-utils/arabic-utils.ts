export class ArabicUtils {

    static toArabicNumber(enNumber: number): string {
        let enNumberStr: string[] = enNumber.toLocaleString().split('');
		let arNumber: string = '';
		
        for (var char of enNumberStr) {
          arNumber += englishArabicNumberMap.get(char);
        }
        return arNumber;
    }
}

export const englishArabicNumberMap: Map<string, string> = new Map()
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

