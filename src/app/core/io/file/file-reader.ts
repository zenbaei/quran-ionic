import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';

/**
 * Native ionic File wrapper.
 */
@Injectable()
export class FileReader {

    APPLICATION_DIRECTORY: string;

    constructor(private file: File) {
        this.APPLICATION_DIRECTORY = this.file.applicationDirectory;
    }

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

