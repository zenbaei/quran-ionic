import { Injectable } from '@angular/core';
import { SurahIndex } from '../../domain/surahIndex';
import { File } from '@ionic-native/file';

@Injectable()
export class SurahIndexService {

  readonly END_OF_LINE = '(\n|\r\n)';

  constructor(private file: File) { }

  /**
   * Parses surah indexes string then deserializes it into any array of SurahIndex.
   * 
   * @param surahIndexesJsonString a string containg SurahIndex in json format delimited
   * by new line
   */
  asSurahIndexes(surahIndexesJsonString: string) : SurahIndex[] {  
    console.debug(`Deserialize into array of SurahIndex`);
    return surahIndexesJsonString.split(new RegExp(this.END_OF_LINE))
      .filter(line => line.trim().length > 0)
      .map(line => { 
        return line.trim() 
      })
      .map(line => {
        console.debug(`line detected: ${line}}`);
        let jsonObject: any = JSON.parse(line);
        return new SurahIndex(jsonObject.key, jsonObject.value)
    });
  }

  /**
   * Reads a file from the given path as string.
   * 
   * @param path
   * @param fileName
   * 
   * @see File.readAsText
   */
  readFile(path: string, fileName: string) : Promise<string> {
    console.debug(`read file from path: [${path}], file name: [${fileName}]`);
    return this.file.readAsText(path, fileName);
  } 

}
