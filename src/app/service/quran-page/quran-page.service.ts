import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequest } from '../../core/http/http-request';
import * as Constants from '../../all/constants';
import { QuranPageMetadata } from '../../domain/quran-page-metadata';

@Injectable()
export class QuranPageService {

    constructor(private httpRequest: HttpRequest) { }

    /**
   * Parses quran page metadata json string then deserializes it into an array of QuranPageMetadata.
   * 
   * @param pageMetadataJsonArr a string containg QuranPageMetadata in json format, 
   * expected format [{fromAyah:1, toAyah:2, surahOrder:""},..]
   */
    fromJson(pageMetadataJsonArr: string): QuranPageMetadata[] {
        console.debug(`Deserialize json string into array of QuranPageMetadata`);
        let pageMetadataArr: Array<QuranPageMetadata> = new Array();
        let jsonArr: any = JSON.parse(pageMetadataJsonArr);
        for (var json of jsonArr) {
            pageMetadataArr.push(new QuranPageMetadata(json.fromAyah, json.toAyah, json.surahOrder));
        }
        return pageMetadataArr;
    }


    /**
     * Finds quran page content from .content file by page number.
     * 
     * @param pageNumber - the page number to fetch, pageNumber should be between 1-604
     * 
     * @returns Observable of string - page content or Observable of RangeError - if passed value is out of range
     */
    findPageContentByPageNumber(pageNumber: number): Observable<string> {
        console.debug(`Find page content by page number [${pageNumber}]`);

        if (!this.isValidPageNumber(pageNumber)) {
            return Observable.throw(new RangeError(`Page number [${pageNumber}] is out of valid range (1 - 604)`));
        }

        let quranPageFileURL: string = Constants.MUSHAF_DATA_DIR
            + `${pageNumber}/${pageNumber}` + Constants.QURAN_PAGE_CONTENT_FILE_EXTENSION;
        return this.httpRequest.get(quranPageFileURL)
            .map(res => {
                return res.text();
            });
    }

    /**
     * Finds quran page metadata by the given pageNumber.
     * 
     * Calls HttpRequest to the metadata file and then fromJson to parse it.
     * 
     * @param pageNumber - the page number to use for getting the file for ex; 1.metadata
     * 
     * @returns Observable of QuranPageMetadata array or Observable of RangeError - if passed value is out of range
     * 
     * @see fromJson
     * @see HttpRequest
     */
    findPageMetadataByPageNumber(pageNumber: number): Observable<QuranPageMetadata[]> {
        console.debug(`Find quran page metadata by page number [${pageNumber}]`);

        if (!this.isValidPageNumber(pageNumber)) {
            return Observable.throw(new RangeError(`Page number [${pageNumber}] is out of valid range (1 - 604)`));
        }

        let pageMetadataURL: string = Constants.MUSHAF_DATA_DIR
            + `${pageNumber}/${pageNumber}` + Constants.QURAN_PAGE_METADATA_FILE_EXTENSION;
        return this.httpRequest.get(pageMetadataURL)
            .map(res => {
                return this.fromJson(res.text());
            });
    }

    private isValidPageNumber(pageNumber: number): boolean {
        if (1 > pageNumber || pageNumber > 604) {
            return false;
        }
        return true;
    }

}