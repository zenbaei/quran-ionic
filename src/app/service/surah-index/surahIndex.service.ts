import { Injectable } from '@angular/core';
import { SurahIndex } from '../../domain/surahIndex';
import { FileReader } from '../../core/io/file/FileReader';
import * as Constants from '../../all/constants';
import { HttpModule, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class SurahIndexService {

  private readonly END_OF_LINE: string = '(\n|\r\n)';
  private readonly QURAN_INDEX_URL: string = Constants.DATA_DIR + Constants.QURAN_INDEX_FILE_NAME;

  constructor(private http: Http) { }

  /**
   * Parses surah indexes string then deserializes it into any array of SurahIndex.
   * 
   * @param surahIndexes a string containg SurahIndex in json format delimited
   * by new line. for ex; {surahName:"",pageNumber:1}
   */
  fromJson(surahIndexes: string): SurahIndex[] {
    console.debug(`Deserialize json string into array of SurahIndex`);
    return surahIndexes.split(new RegExp(this.END_OF_LINE))
      .filter(line => line.trim().length > 0)
      .map(line => {
        return line.trim()
      })
      .map(line => {
        // console.debug(`line detected: ${line}}`);
        let jsonObject: any = JSON.parse(line);
        return new SurahIndex(jsonObject.surahName, jsonObject.pageNumber)
      });
  }

  getQuranIndex(): Promise<SurahIndex[]> {
    console.debug(`Http get quran index from url ${this.QURAN_INDEX_URL}`);
    return this.http.get(this.QURAN_INDEX_URL).toPromise()
      .then(res => {
        return this.fromJson(res.text());
      });
  }

}
