/*
import { TestBed, async } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import * as Constants from '../../all/constants';
import { HttpRequest } from './httpRequest';

describe('HttpRequest', () => {

    let httpRequest: HttpRequest;
    let url: string = Constants.DATA_DIR + Constants.QURAN_INDEX_FILE_NAME;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ HttpModule ],
            providers: [HttpRequest]
        });

        httpRequest = TestBed.get(HttpRequest);
    });

    // the assets or even index.html are not available during test therfore the get request timesout
    it('Given a url to quran.index file is provided When get is called Then its reponse should include data', async(() => {
        expect(httpRequest).toBeDefined();
        httpRequest.get(url).subscribe(res => {
            expect(res.status).toBe(404);
        });
    }));

});
*/