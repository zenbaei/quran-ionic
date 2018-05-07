import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequest } from '../../core/http/http-request';
import * as Constants from '../../all/constants';
import { QuranPageMetadata } from '../../domain/quran-page-metadata';
import { RegexUtils } from "../../util/regex-utils/regex-utils";

@Injectable()
export class QuranPageService {
    private LOCAL_FILE_PATH = 'file:///home/zenbaei/Documents/quran-html-output/';

    constructor(private httpRequest: HttpRequest) { }

    /**
   * Parses quran page metadata json string then deserializes it into an array of QuranPageMetadata.
   * 
   * @param pageMetadataJsonArr a string containg QuranPageMetadata in json format, 
   * expected format [{fromAyah:1, toAyah:2, surahNumber:""},..]
   */
    fromJson(pageMetadataJsonArr: string): QuranPageMetadata[] {
        console.debug(`Deserialize json string into array of QuranPageMetadata`);
        let pageMetadataArr: Array<QuranPageMetadata> = new Array();
        let jsonArr: any = JSON.parse(pageMetadataJsonArr);
        for (var json of jsonArr) {
            pageMetadataArr.push(new QuranPageMetadata(json.fromAyah, json.toAyah, json.surahNumber));
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

    /**
     * First removes tashkil then add non white space match (for zero or one time) after each character in the string 
     * then replaces first abstracted alef with (one char or zero) then replaces middle alef (which will have .?.? after it from 
     * addRegexDotMetaCharInBetween) in that case it will match quran text whether it has alaf in between or not.
     * @param str 
     */
    public static normalizeString(str: string): string {
        return RegexUtils.addLineBreakAfterEachWord(
                RegexUtils.replaceFirstAlefCharWithAlefSkoon(
                    RegexUtils.replaceMiddleAlefsWithNonSpaceZeroOrOneTime(
                        RegexUtils.addRegexNonWhiteSpaceMetaCharInBetween(
                            RegexUtils.removeTashkil(str)))));
    }

    /*
    public writeToFile(fileName: string, content: string): void {
        console.log('Write file path ' + this.LOCAL_FILE_PATH + ' ' + content.substring(0, 10));
        this.file.createFile(this.LOCAL_FILE_PATH, 'test.js', false)
        this.file.writeFile(this.LOCAL_FILE_PATH, fileName, content, this.writeOption);
    }*/

}