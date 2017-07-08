export class StringUtils {

    public static replaceAt(target: string, index: number, replacement: string): string {
        console.debug(`Replace [${target}] index [${index}] with [${replacement}]`);
        let leftChunk: string = target.substr(0, index);
        let remainingTarget: string = target;
        let rightChunk: string = target.substr(index + 1, target.length - leftChunk.length);
        return leftChunk + replacement + rightChunk;
    }

    public static replaceAll(target: string, pattern: string, replacement: string) {
        let regex: RegExp = new RegExp(pattern, 'g');
        return target.replace(regex, replacement);
    }

}