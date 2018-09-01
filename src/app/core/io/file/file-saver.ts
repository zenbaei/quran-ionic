import * as Saver from 'file-saver';

export class FileSaver {

    public save(text: string) {
        var data = new Blob([text], { type: 'text/plain;charset=utf-8' });
        Saver.saveAs(data, 'text.txt');
    }

}