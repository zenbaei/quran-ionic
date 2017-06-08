import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequest } from '../../core/http/httpRequest';
import * as Constants from '../../all/constants';

@Injectable()
export class QuranPageService {

    private readonly QURAN_PAGE_FILE_EXTENSION = '.page';
    
    constructor(private httpRequest: HttpRequest) { }


    /**
     * Fetches quran page content from .page file.
     * 
     * @param pageNumber - the page number to fetch
     */
    fetchPageContent(pageNumber: number): Observable<string> {
        console.debug(`Fetch page content - pageNumber [${pageNumber}]`);
        let quranPageFileURL: string = Constants.BASE_DATA_DIR
            + `${pageNumber}/${pageNumber}` + this.QURAN_PAGE_FILE_EXTENSION;
        return this.httpRequest.get(quranPageFileURL)
            .map(res => res.text());
    }

}