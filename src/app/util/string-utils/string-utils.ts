export class StringUtils {

    public static replaceAt(target: string, index: number, replacement: string): string {
        //console.debug(`Replace [${target}] index [${index}] with [${replacement}]`);
        let leftChunk: string = target.substr(0, index);
        let rightChunk: string = target.substr(index + 1, target.length - leftChunk.length);
        return leftChunk + replacement + rightChunk;
    }

    public static replaceAll(target: string, pattern: string, replacement: string) {
        let regex: RegExp = new RegExp(pattern, 'g');
        return target.replace(regex, replacement);
    }

    /**
     * Replacing with the use of regex because in case the string contains
     * forward slash regex will throw exception.
     */
    public static safeReplaceAll(target: string, pattern: string, replacement: string) {
        let newStr: string = target;
        while (newStr.indexOf(pattern) >= 0) {
            newStr = newStr.replace(pattern, replacement);
        }
        return newStr;
    }

}