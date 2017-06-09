import { TestBed, inject } from '@angular/core/testing';
import { QuranPageService } from './quranPage.service';
import { HttpModule, Response, ResponseOptions } from '@angular/http';
import * as Constants from '../../all/constants';
import { HttpRequest } from '../../core/http/httpRequest';
import { Observable } from 'rxjs';
import { AppModule } from '../../app.module';

describe('QuranPageService', () => {

    let quranPageContent: string = `quran page content`;
    let quranPageService: QuranPageService;
    let httpRequest: HttpRequest;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [QuranPageService, HttpRequest]
        });

        quranPageService = TestBed.get(QuranPageService);
        httpRequest = TestBed.get(HttpRequest);
    });

    
    it('Given http get is mocked for getting the quran page When fetchPageContent is called Then it should return string content', (done) => {
        let response: Response = new Response(new ResponseOptions());
        spyOn(response, 'text').and.returnValue(quranPageContent);
        spyOn(httpRequest, 'get').and.returnValue(Observable.of(response));
        
        quranPageService.fetchPageContent(7)
            .subscribe(content => {
                expect(content).toEqual(quranPageContent);
                done();
            });

        let expectedURL: string = Constants.BASE_DATA_DIR + '7/7.page';
        expect(httpRequest.get).toHaveBeenCalledWith(expectedURL);
    });


});