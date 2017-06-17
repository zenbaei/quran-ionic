import { Response, ResponseOptions } from '@angular/http';
import { HttpRequest } from '../../core/http/http-request';
import { Observable } from 'rxjs';

export class TestUtils {

    static mockResponse(httpRequest: HttpRequest, body: string): Response {
        let response: Response = new Response(new ResponseOptions());
        spyOn(response, 'text').and.returnValue(body);
        spyOn(httpRequest, 'get').and.returnValue(Observable.of(response));
        return response;
    }

}

