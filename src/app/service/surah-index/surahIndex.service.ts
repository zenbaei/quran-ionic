import { Injectable } from '@angular/core';
import { SurahIndex } from '../../domain/surahIndex';
import * as Constants from '../../all/constants';
import { HttpRequest } from '../../core/http/httpRequest';
import { Observable } from 'rxjs';

@Injectable()
export class SurahIndexService {

  private readonly END_OF_LINE: string = '(\n|\r\n)';
  private readonly QURAN_INDEX_URL: string = Constants.DATA_DIR + Constants.QURAN_INDEX_FILE_NAME;

  constructor(private httpRequest: HttpRequest) { }

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

  /**
   * Calls http get quran.index file then calls {@link SurahIndexService#fromJson}.
   * @see HttpRequest#get
   */
  getQuranIndex(): Observable<SurahIndex[]> {
    return this.httpRequest.get(this.QURAN_INDEX_URL)
      .map(res => {
        return this.fromJson(res.text());
      });
  }

}
