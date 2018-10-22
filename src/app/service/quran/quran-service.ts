import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequest } from '../../core/http/http-request';
import * as Constants from '../../all/constants';
import { QuranPageMetadata } from '../../domain/quran-page-metadata';

import { Storage } from '@ionic/storage';
import { Quran } from '../../domain/quran';
import { RegexUtils } from '../../util/regex-utils/regex-utils';

@Injectable()
export class QuranService {
    //private LOCAL_FILE_PATH = 'file:///home/zenbaei/Documents/quran-html-output/';

    constructor(private httpRequest: HttpRequest, private storage: Storage) { }

    /**
     * Parses quran page metadata json string then deserializes it into an array of QuranPageMetadata.
     * 
     * @param pageMetadataJsonArr a string containg QuranPageMetadata in json format, 
     * expected format [{fromAyah:1, toAyah:2, surahNumber:""},..]
     */
    toObject(pageMetadataJsonArr: string): QuranPageMetadata[] {
        let pageMetadataArr: Array<QuranPageMetadata> = new Array();
        let jsonArr: any = JSON.parse(pageMetadataJsonArr);
        for (var json of jsonArr) {
            pageMetadataArr.push(new QuranPageMetadata(json.fromAyah, json.toAyah, json.surahNumber, json.goze, json.hezb));
        }
        return pageMetadataArr;
    }

    quranToObject(json: string): Quran {
        let obj: any = JSON.parse(json);
        let quran: Quran = new Quran(obj.pageNumber);
        quran.data = obj.data;
        quran.goze = obj.goze;
        quran.hezb = obj.hezb;
        quran.surahName = obj.surahName;
        return quran;
    }


    /**
     * Finds quran page content from .content file by page number.
     * 
     * @param pageNumber - the page number to fetch, pageNumber should be between 1-604
     * 
     * @returns Observable of string - page content or Observable of RangeError - if passed value is out of range
     */
    findPageContentByPageNumber(pageNumber: number, isAndroid: boolean): Observable<string> {
        console.debug(`Find page content by page number [${pageNumber}]`);

        if (!this.isValidPageNumber(pageNumber)) {
            return Observable.throw(new RangeError(`Page number [${pageNumber}] is out of valid range (1 - 604)`));
        }

        let quranPageFileURL: string = Constants.MUSHAF_DATA_DIR
            + `${pageNumber}/${pageNumber}` + this.getExtension(isAndroid);

        return this.httpRequest.get(quranPageFileURL)
            .map(res => {
                return res.text();
            });
    }

    private getExtension(isAndroid: boolean): string {
        return isAndroid ?
            ANDROID_QURAN_FILE_EXTENSION :
            IOS_QURAN_FILE_EXTENSION;
    }

    private getHtmlExtension(isAndroid: boolean): string {
        return isAndroid ?
            ANDROID_QURAN_HTML_FILE_EXTENSION :
            IOS_QURAN_HTML_FILE_EXTENSION;
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
            + `${pageNumber}/${pageNumber}` + QURAN_METADATA_FILE_EXTENSION;
        return this.httpRequest.get(pageMetadataURL)
            .map(res => {
                return this.toObject(res.text());
            });
    }

    private isValidPageNumber(pageNumber: number): boolean {
        if (1 > pageNumber || pageNumber > 604) {
            return false;
        }
        return true;
    }

    public getSavedPageNumber(): Promise<number> {
        return new Promise((resolve) => {
            this.storage.get(Constants.PAGE_NUMBER).then(val => {
                if (!val) {
                    this.savePageNumber(1);
                    resolve(1);
                }
                resolve(val);
            });
        });
    }

    public savePageNumber(pageNumber: number): void {
        this.storage.set(Constants.PAGE_NUMBER, pageNumber);
    }

    public saveLineHeight(size: string, isFullPage: boolean): void {
        console.debug(`Save line height: ${size}`);
        this.storage.set(
            this.getLineHeightKey(isFullPage),
            size);
    }

    getLineHeightKey(isFullPage: boolean): string {
        return isFullPage ? LINE_HEIGHT_EXTENDED : LINE_HEIGHT;    
    }

    public getLineHeight(isFullPage: boolean): Promise<string> {
        let key: string = this.getLineHeightKey(isFullPage);

        return new Promise(resolve => {
            this.storage.get(key).then(val => {
                resolve(val);
            });
        });
    }

    public static isValidPageNumber(pageNumber: number): boolean {
        if (!pageNumber || pageNumber < FIRST_PAGE || pageNumber > LAST_PAGE) {
            return false;
        }
        return true;
    }

    public findAll(): Promise<Quran[]> {
        let qurans: Quran[] = new Array();
        return new Promise((resolve) => {
            for (let i = 1; i <= 604; i++) {
                this.storage.get(i.toString()).then(qr => {
                    let quran: Quran = new Quran(i);
                    let json: any = JSON.parse(qr);
                    quran.data = json.data;
                    quran.goze = json.goze;
                    quran.hezb = json.hezb;
                    quran.surahName = json.surahName;
                    qurans.push(quran);

                    if (i == 604) { // done loading
                        resolve(qurans);
                    }
                });
            }
        });
    }

    public find(page: number, isAndroid: boolean): Observable<Quran> {
        console.debug(`find page: ${page}`);
        if (!this.isValidPageNumber(page)) {
            new RangeError(`Page number [${page}] is out of valid range (1 - 604)`);
        }

        let quranPageFileURL: string = Constants.MUSHAF_DATA_DIR
            + `${page}/${page}` + this.getHtmlExtension(isAndroid);

        return this.httpRequest.get(quranPageFileURL)
            .map(res => {
                return this.quranToObject(res.text());
            });
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

}


const LINE_HEIGHT: string = 'lineHeight';
const LINE_HEIGHT_EXTENDED: string = 'lineHeightExtended';

const FIRST_PAGE = 1;
const LAST_PAGE = 604;

const ANDROID_QURAN_FILE_EXTENSION = '.android.quran';
const IOS_QURAN_FILE_EXTENSION = '.quran';

const ANDROID_QURAN_HTML_FILE_EXTENSION = '.android.quran.html.json';
const IOS_QURAN_HTML_FILE_EXTENSION = '.quran.html.json';

const QURAN_METADATA_FILE_EXTENSION = '.metadata';