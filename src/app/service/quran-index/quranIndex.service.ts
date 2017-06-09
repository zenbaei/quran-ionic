import { Injectable } from '@angular/core';
import { SurahIndex } from '../../domain/surahIndex';
import * as Constants from '../../all/constants';
import { HttpRequest } from '../../core/http/httpRequest';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class QuranIndexService {

  private readonly QURAN_INDEX_FILE_URL: string = Constants.BASE_DATA_DIR + 'quran.index';

  constructor(private httpRequest: HttpRequest) { }

  /**
   * Parses quran indexes string then deserializes it into any array of SurahIndex.
   * 
   * @param surahIndexes a string containg SurahIndex in json format delimited
   * by new line. for ex; {surahName:"",pageNumber:1}
   */
  fromJson(surahIndexes: string): SurahIndex[] {
    console.debug(`Deserialize json string into array of SurahIndex`);
    let surahIndexArr: Array<SurahIndex> = new Array();
    let jsonArr: any = JSON.parse(surahIndexes);
    for (var json of jsonArr) {
      surahIndexArr.push(new SurahIndex(json.surahName, json.pageNumber));
    }
    return surahIndexArr;
  }

  /**
   * Calls http get quran.index file then calls {@link SurahIndexService#fromJson}.
   * @see HttpRequest#get
   */
  getQuranIndex(): Observable<SurahIndex[]> {
    return this.httpRequest.get(this.QURAN_INDEX_FILE_URL)
      .map((res: Response) => this.fromJson(res.text()));
  }

}
