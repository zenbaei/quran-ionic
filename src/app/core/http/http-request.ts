import { Injectable } from '@angular/core';
import { Http, Response  } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs';

/**
 * Http wrapper service.
 */
@Injectable()
export class HttpRequest {

    constructor(private http: Http) {}

    get(url: string): Observable<Response> {
        console.debug(`Http get url [${url}]`);
        return this.http.get(url);
    }

}