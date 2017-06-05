import { Injectable } from '@angular/core';
import { SurahIndex } from '../../domain/surahIndex';
import { FileReader } from '../../core/io/file/FileReader';
import * as Constants from '../../all/constants';

@Injectable()
export class SurahIndexService {

  readonly END_OF_LINE = '(\n|\r\n)';

  constructor(private fileReader: FileReader) { }

  /**
   * Parses surah indexes string then deserializes it into any array of SurahIndex.
   * 
   * @param surahIndexes a string containg SurahIndex in json format delimited
   * by new line. for ex; {surahName:"",pageNumber:1}
   */
  fromJson(surahIndexes: string): SurahIndex[] {
    console.debug(`Deserialize into array of SurahIndex`);
    return surahIndexes.split(new RegExp(this.END_OF_LINE))
      .filter(line => line.trim().length > 0)
      .map(line => {
        return line.trim()
      })
      .map(line => {
        console.debug(`line detected: ${line}}`);
        let jsonObject: any = JSON.parse(line);
        return new SurahIndex(jsonObject.surahName, jsonObject.pageNumber)
      });
  }

  getQuranIndex(): Promise<SurahIndex[]> {
    console.debug('Get quran index');
    let dir: string = this.fileReader.APPLICATION_DIRECTORY + Constants.BASE_DIR;
    return this.fileReader.readAsText(dir, Constants.QURAN_INDEX_FILE)
      .then(str => {
        return this.fromJson(str);
      });
  }

}
