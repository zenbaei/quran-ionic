import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequest } from '../../core/http/http-request';
import * as Constants from '../../all/constants';
import { QuranPageMetadata } from '../../domain/quran-page-metadata';
import { RegexUtils } from "../../util/regex-utils/regex-utils";
import { Storage } from '@ionic/storage';

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
    fromJson(pageMetadataJsonArr: string): QuranPageMetadata[] {
        let pageMetadataArr: Array<QuranPageMetadata> = new Array();
        let jsonArr: any = JSON.parse(pageMetadataJsonArr);
        for (var json of jsonArr) {
            pageMetadataArr.push(new QuranPageMetadata(json.fromAyah, json.toAyah, json.surahNumber, json.goze, json.hezb));
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

    public doVarMigration() {
        this.migratePortraitLnHgt();

        this.migrateLandscapeLnHgt();

        this.migrateQuranFont();
    }

    private migratePortraitLnHgt(): void {
        let oldKey: string = 'portraitLineHeightKey';
        let locStgVal: string = localStorage.getItem(oldKey);

        if (locStgVal != null) {
            this.storage.set(PORTRAIT_LINE_HEIGHT, locStgVal);
        }

        localStorage.removeItem(oldKey);
        localStorage.removeItem(PORTRAIT_LINE_HEIGHT);
    }

    private migrateLandscapeLnHgt(): void {
        let oldKey: string = 'landscapeLineHeightKey';
        let locStgVal: string = localStorage.getItem(oldKey);

        if (locStgVal != null) {
            this.storage.set(LANDSCAPE_LINE_HEIGHT, locStgVal);
        }

        localStorage.removeItem(oldKey);
        localStorage.removeItem(LANDSCAPE_LINE_HEIGHT);
    }

    private migrateQuranFont(): void {
        let oldKey: string = 'quranFontSize';
        let oldVal: string = localStorage.getItem(oldKey);
        let newPortVar: string = localStorage.getItem(PORTRAIT_QURAN_FONT_SIZE);
        let newLandVar: string = localStorage.getItem(LANDSCAPE_QURAN_FONT_SIZE);

        if (newPortVar != null) {
            this.storage.set(PORTRAIT_QURAN_FONT_SIZE, newPortVar);
        } else if (oldVal != null) {
            this.storage.set(PORTRAIT_QURAN_FONT_SIZE, oldVal);
        }

        if (newLandVar != null) {
            this.storage.set(LANDSCAPE_QURAN_FONT_SIZE, newLandVar);
        } else if (oldVal != null) {
            this.storage.set(LANDSCAPE_QURAN_FONT_SIZE, oldVal);
        }

        localStorage.removeItem(oldKey);
        localStorage.removeItem(PORTRAIT_QURAN_FONT_SIZE);
        localStorage.removeItem(LANDSCAPE_QURAN_FONT_SIZE);
    }

    public getPageNumber(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.storage.get(Constants.PAGE_NUMBER).then(val => {
                resolve(val);
            });
        });
    }

    public savePageNumber(pageNumber: number): void {
        this.storage.set(Constants.PAGE_NUMBER, pageNumber);
    }

    public getFontSize(isPortrait: boolean): Promise<number> {
        console.debug(`Get font size - isPortrait: ${isPortrait}`);
        let key: string = this.getFontKeyByOrientation(isPortrait);
        return new Promise((resolve) => {
            this.storage.get(key).then(val => {
                let size: number = (val == null) ?
                    DEFAULT_QURAN_FONT_SIZE :
                    Number(val);
                resolve(size);
            });
        });
    }

    public saveFontSize(size: number, isPortrait: boolean): void {
        console.debug(`Save font size: ${size} - isPortrait: ${isPortrait}`);
        this.storage.set(this.getFontKeyByOrientation(isPortrait), size.toString());
    }

    private getFontKeyByOrientation(isPortrait: boolean): string {
        return isPortrait ?
            PORTRAIT_QURAN_FONT_SIZE :
            LANDSCAPE_QURAN_FONT_SIZE;
    }

    public saveLineHeight(size: number, isPortrait: boolean): void {
        console.debug(`Save line height: ${size} - isPortrait: ${isPortrait}`);
        this.storage.set(
            this.getLineHeightKey(isPortrait),
            size.toString());
    }

    public getLineHeight(isAndroid: boolean, isPortrait: boolean): Promise<number> {
        console.debug(`Get line height - isAndroid: ${isAndroid} - isPortrait: ${isPortrait}`);
        let key: string = this.getLineHeightKey(isPortrait);

        return new Promise(resolve => {
            this.storage.get(key).then(val => {
                let size: number = (val == null) ?
                    this.getDefaultLineHeight(isAndroid, isPortrait) :
                    Number(val);
                resolve(size);
            });
        });
    }

    private getLineHeightKey(isPortrait: boolean): string {
        return isPortrait ?
            PORTRAIT_LINE_HEIGHT :
            LANDSCAPE_LINE_HEIGHT;
    }

    private getDefaultLineHeight(isAndroid: boolean, isPortrait: boolean): number {
        console.debug('Get default line height');
        return isPortrait ?
            this.getPortraitDefaultPlatformLineHeightSize(isAndroid) :
            this.getLandscapeDefaultPlatformLineHeightSize(isAndroid);
    }

    private getPortraitDefaultPlatformLineHeightSize(isAndroid: boolean): number {
        return isAndroid ?
            DEFAULT_PORTRAIT_LINE_HEIGHT_SIZE_ANDROID :
            DEFAULT_PORTRAIT_LINE_HEIGHT_SIZE_IOS;
    }

    private getLandscapeDefaultPlatformLineHeightSize(isAndroid: boolean): number {
        return isAndroid ?
            DEFAULT_LANDSCAPE_LINE_HEIGHT_SIZE_ANDROID :
            DEFAULT_LANDSCAPE_LINE_HEIGHT_SIZE_IOS;
    }

    public static isValidPageNumber(pageNumber: number): boolean {
        if (!pageNumber || pageNumber < FIRST_PAGE || pageNumber > LAST_PAGE) {
            return false;
        }
        return true;
    }

}

const DEFAULT_QURAN_FONT_SIZE: number = 3.7;

const PORTRAIT_QURAN_FONT_SIZE = 'portraitQuranFontSize';
const LANDSCAPE_QURAN_FONT_SIZE = 'landscapeQuranFontSize';

const PORTRAIT_LINE_HEIGHT: string = 'portraitLineHeight';
const LANDSCAPE_LINE_HEIGHT: string = 'landscapeLineHeight';

const DEFAULT_PORTRAIT_LINE_HEIGHT_SIZE_ANDROID: number = 5.7;
const DEFAULT_LANDSCAPE_LINE_HEIGHT_SIZE_ANDROID: number = 17;

const DEFAULT_PORTRAIT_LINE_HEIGHT_SIZE_IOS: number = 2.9;
const DEFAULT_LANDSCAPE_LINE_HEIGHT_SIZE_IOS: number = 9;

const FIRST_PAGE = 1;
const LAST_PAGE = 604;

const ANDROID_QURAN_FILE_EXTENSION = '.android.quran';
const IOS_QURAN_FILE_EXTENSION = '.quran';
const QURAN_METADATA_FILE_EXTENSION = '.metadata';