import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequest } from '../../core/http/http-request';
import * as Constants from '../../all/constants';

@Injectable()
export class QuranPageService {

    private readonly QURAN_PAGE_FILE_EXTENSION = '.page';

    constructor(private httpRequest: HttpRequest) { }


    /**
     * Fetches quran page content from .page file.
     * 
     * @param pageNumber - the page number to fetch
     * 
     * @returns Observable of string - page content or Observable of RangeError - if passed value is out of range (1 - 604)
     */
    fetchPageContent(pageNumber: number): Observable<string> {
        console.debug(`Fetch page content - pageNumber [${pageNumber}]`);

        if (!this.isValidPageNumber(pageNumber)) {
            return Observable.throw(new RangeError(`Page number [${pageNumber}] is out of valid range (1 - 604)`));
        }

        let quranPageFileURL: string = Constants.BASE_DATA_DIR
            + `${pageNumber}/${pageNumber}` + this.QURAN_PAGE_FILE_EXTENSION;
        return this.httpRequest.get(quranPageFileURL)
            .map(res => {
                console.log(res.text());
               return res.text();
            }); 
    }

    private isValidPageNumber(pageNumber: number): boolean {
        if (1 > pageNumber || pageNumber > 604) {
            return false;
        }
        return true;
    }

}