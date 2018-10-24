import { timer } from 'rxjs/observable/timer';

export class Common {
    public static showLoading(timeout) {
        var el = $('.loading');

        el.css('background-color', 'black');
        el.css('display', 'block');

        timer(timeout).subscribe(() =>
            el.css('background-color', 'transparent')
        );

        timer(timeout * 2).subscribe(() =>
            el.css('display', 'none')
        );
    }
}