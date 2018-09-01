import { Injectable } from '@angular/core';
import { Index } from '../../domain';
import * as Constants from '../../all/constants';
import { HttpRequest } from '../../core/http/http-request';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class IndexService {

  private readonly QURAN_INDEX_FILE_URL: string = Constants.MUSHAF_DATA_DIR + 'quran.index';
  public surahIndexArr: Index[];

  constructor(private httpRequest: HttpRequest) {

    this.getQuranIndex().subscribe(arr => {
      this.surahIndexArr = arr;
    })
  }

  /**
   * Parses quran indexes string then deserializes it into an array of SurahIndex.
   * 
   * @param surahIndexJsonArr a string containg SurahIndex in json format, 
   * expected format [{surahName:"",pageNumber:1},..]
   */
  public fromJson(surahIndexJsonArr: string): Index[] {
    console.debug(`Deserialize json string into array of SurahIndex`);
    let surahIndexArr: Array<Index> = new Array();
    let jsonArr: any = JSON.parse(surahIndexJsonArr);
    for (var json of jsonArr) {
      surahIndexArr.push(new Index(json.surahName, json.pageNumber, json.surahNumber));
    }
    return surahIndexArr;
  }

  /**
   * Calls http get quran.index file then calls {@link SurahIndexService#fromJson}.
   * @see HttpRequest#get
   */
  public getQuranIndex(): Observable<Index[]> {
    console.debug('Get quran index file');
    return this.httpRequest.get(this.QURAN_INDEX_FILE_URL)
      .map((res: Response) => this.fromJson(res.text()));
  }

}
