import { Injectable } from '@angular/core';
import { Tafsir } from '../../domain/tafsir';
import * as Constants from '../../all/constants';
import { HttpRequest } from '../../core/http/http-request';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class TafsirService {

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
  * Finds tafsir by surah number.
  * 
  * Calls http get {surahNumber}.tafsir file then calls {@link #fromJson}.
  * 
  * @param surahNumber - Tafsir of surah to be retrieved, surahNumber should be between 1-114 
  *   
  * @returns Observable of Tafsir or Observable of RangeError - if passed argument is out of range
  * 
  * @see HttpRequest#get
  */
  findTafsirBySurahNumber(surahNumber: number): Observable<Tafsir[]> {
    console.debug(`Find tafsir by surah number [${surahNumber}]`);

    if (!this.isValidSurahNumbersurahNumber(surahNumber)) {
      return Observable.throw(new RangeError(`Surah number [${surahNumber}] is out of range (1 - 114)`));
    }

    let TAFSIR_FILE_URL = TAFSIR_MAKHLOUF_DATA_DIR + surahNumber + TAFSIR_FILE_EXTENSION;

    return this.httpRequest.get(TAFSIR_FILE_URL)
      .map((res: Response) => this.fromJson(res.text()));
  }

  private isValidSurahNumbersurahNumber(surahNumber: number): boolean {
    if (1 > surahNumber || surahNumber > 114) {
      return false;
    }
    return true;
  }
}

export const TAFSIR_MAKHLOUF_DATA_DIR = Constants.BASE_DATA_DIR + 'tafsir/makhlouf/';
const TAFSIR_FILE_EXTENSION = '.tafsir';