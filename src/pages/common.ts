import { timer } from 'rxjs/observable/timer';
import * as $ from "jquery";

export class Common {

    public static showLoading(timeout) {
        var loadingEl = $('.loading');
        loadingEl.css('background-color', 'black');
        loadingEl.css('display', 'block');

        timer(timeout).subscribe(() =>
            loadingEl.css('background-color', 'transparent')
        );

        timer(timeout * 2).subscribe(() =>
            loadingEl.css('display', 'none')
        );
    }

    public static isLoading(): boolean {
        var loadingEl = $('.loading')
        return (loadingEl.css('display') == 'block') ? true : false;
    }
}