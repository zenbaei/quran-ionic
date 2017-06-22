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
  * Finds tafsir by surah order.
  * 
  * Calls http get {surahOrder}.tafsir file then calls {@link #fromJson}.
  * 
  * @param surahOrder - Tafsir of surah to be retrieved, surahOrder should be between 1-114 
  *   
  * @returns Observable of Tafsir or Observable of RangeError - if passed argument is out of range
  * 
  * @see HttpRequest#get
  */
  findTafsirBySurahOrder(surahOrder: number): Observable<Tafsir[]> {
    console.debug(`Find tafsir by surah order [${surahOrder}]`);

    if (!this.isValidSurahOrder(surahOrder)) {
      return Observable.throw(new RangeError(`Surah order [${surahOrder}] is out of range (1 - 114)`));
    }

    let TAFSIR_FILE_URL = Constants.TAFSIR_MAKHLOUF_DATA_DIR + surahOrder + this.TAFSIR_FILE_EXTENSION;

    return this.httpRequest.get(TAFSIR_FILE_URL)
      .map((res: Response) => this.fromJson(res.text()));
  }

  private isValidSurahOrder(surahOrder: number): boolean {
    if (1 > surahOrder || surahOrder > 114) {
      return false;
    }
    return true;
  }
}