import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as Constants from '../../app/all/constants';

@IonicPage()
@Component({
  selector: 'page-bookmark-menu-popover',
  templateUrl: 'bookmark-menu-popover.html',
})
export class BookmarkMenuPopoverPage {

  bookmarkType: string = '';
  Bookmark: any = Constants.Bookmark;

  constructor(public viewCtrl: ViewController, public storage: Storage) {
  }

  ionViewDidLoad() {
    this.subscribeToJsEvents();
  }

  subscribeToJsEvents() {
    $(window).resize(() => {
      this.cancel();
    });
  }

  save() {
    if (this.bookmarkType === '') {
      return;
    }
    this.storage.get(Constants.PAGE_NUMBER).then(pgNu => {
      this.storage.set(this.bookmarkType, pgNu);
      this.cancel();
    })
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

}
