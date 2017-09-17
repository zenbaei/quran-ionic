 export class RegexUtils {


    private static readonly LINE_TERMINATOR = '\n';
    private static readonly SPACE = ' ';
    private static readonly ZERO_OR_ONE: string = "?";
    
    /**
     * Add line break and then zero or more metacharacter to match strings not on same line.
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
                result += splited[i] + this.SPACE + this.LINE_TERMINATOR + this.ZERO_OR_ONE;
            }
        }
        console.debug(`After adding line breaks [${result}]`);
        return result.trim();
    }
 }