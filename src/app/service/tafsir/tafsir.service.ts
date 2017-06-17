import { Injectable } from '@angular/core';
import { Tafsir } from '../../domain/tafsir';
import * as Constants from '../../all/constants';
import { HttpRequest } from '../../core/http/http-request';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class TafsirService {

  private readonly TAFSIR_FILE_EXTENSION = '.tafsir';

  constructor(private httpRequest: HttpRequest) { }

  /**
     * Parses tafsir data string then deserializes it into an array of Tafsir.
     * 
     * @param tafsirJsonArr a string containg an array of Tasfir in json format,
     * expected format [{"ayah":'', "ayahNumber":2, "tafsir":''},..]
     */
  fromJson(tafsirJsonArr: string): Tafsir[] {
    console.debug(`Deserialize tafsir json array into an array of Tafsir`);
    let tafsirArr: Array<Tafsir> = new Array();
    let jsonArr: any = JSON.parse(tafsirJsonArr);
    for (var json of jsonArr) {
      tafsirArr.push(new Tafsir(json.ayah, json.ayahNumber, json.tafsir));
    }
    return tafsirArr;
  }

  /**
  * Calls http get {id}.tafsir file then calls {@link #fromJson}.
  *
  * @param surahId - Tafsir of surah to be retrieved, surahId should be between 1-114 
  *   
  * @returns Observable of Tafsir or Observable of RangeError - if passed argument is out of range
  * 
  * @see HttpRequest#get
  */
  findTafsirBySurahId(surahId: number): Observable<Tafsir[]> {
    console.debug(`Find tafsir by surah id [${surahId}]`);

    if (!this.isValidSurahId(surahId)) {
      return Observable.throw(new RangeError(`Surah id [${surahId}] is out of range (1 - 114)`));
    }

    let TAFSIR_FILE_URL = Constants.TAFSIR_MAKHLOUF_DATA_DIR + surahId + this.TAFSIR_FILE_EXTENSION;

    return this.httpRequest.get(TAFSIR_FILE_URL)
      .map((res: Response) => this.fromJson(res.text()));
  }

  private isValidSurahId(surahId: number): boolean {
    if (1 > surahId || surahId > 114) {
      return false;
    }
    return true;
  }
}