import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';

/**
 * Native ionic File wrapper.
 */
@Injectable()
export class FileReader {

    readonly APPLICATION_DIRECTORY: string = this.file.applicationDirectory;

    constructor(private file: File) { }

    /**
     * Reads a file from the given path as string.
     * 
     * @param path
     * @param fileName
     * 
     * @see File.readAsText
     */
    readAsText(path: string, fileName: string): Promise<string> {
        console.debug(`read file from path: [${path}], file name: [${fileName}]`);
        return this.file.readAsText(path, fileName);
    }
}

