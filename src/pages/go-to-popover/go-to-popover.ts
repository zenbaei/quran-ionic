import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavParams, ViewController, RadioButton } from 'ionic-angular'
import * as Constants from '../../app/all/constants';
import { Storage } from '@ionic/storage';
import { QuranService } from '../../app/service/quran/quran-service';

@IonicPage()
@Component({
  selector: 'go-to-popover',
  templateUrl: 'go-to-popover.html',
})
export class GoToPopoverPage {
  @ViewChild('input') pageNumberEl;
  @ViewChild('pageInputRadio') pageInputRadioEl: RadioButton;
  pageNumber: string = '';
  isReadBookmarkDisabled: boolean = true;
  isStudyBookmarkDisabled: boolean = true;
  isDifferentBookmarkDisabled: boolean = true;
  goToRadio: string = '';
  Bookmark: any = Constants.Bookmark;

  constructor(private navParams: NavParams, private viewCtrl: ViewController,
    private storage: Storage, private cdRef: ChangeDetectorRef) {
  }

  ionViewDidLoad() {
    this.shouldEnableBookmarkCtls();
  }

  shouldEnableBookmarkCtls() {
    this.storage.get(Constants.Bookmark.read).then(val => {
      if (val) {
        this.isReadBookmarkDisabled = false;
      }
    });

    this.storage.get(Constants.Bookmark.study).then(val => {
      if (val) {
        this.isStudyBookmarkDisabled = false;
      }
    });

    this.storage.get(Constants.Bookmark.different).then(val => {
      if (val) {
        this.isDifferentBookmarkDisabled = false;
      }
    });
  }

  ngAfterViewChecked() {
    this.pageNumberEl.setFocus();
    this.cdRef.detectChanges();
  }

  selectRadio() {
    this.pageInputRadioEl.checked = true;
  }

  goTo() {
    if (this.goToRadio === '') {
      return;
    }

    switch (this.goToRadio) {
      case 'page': {
        this.goToPage();
        break;
      }
      case Constants.Bookmark.read: {
        this.goToBookmark(Constants.Bookmark.read);
        break;
      }
      case Constants.Bookmark.study: {
        this.goToBookmark(Constants.Bookmark.study);
        break;
      }
      case Constants.Bookmark.different: {
        this.goToBookmark(Constants.Bookmark.different);
        break;
      }
    }

  }

  goToPage() {
    let pageNumber: number = Number(this.pageNumber.trim());
    if (!QuranService.isValidPageNumber(pageNumber)) {
      return;
    }
    this.navigateToQuranPage(pageNumber);
  }

  goToBookmark(bookmarkType: string) {
    this.storage.get(bookmarkType).then(pageNumber => {
      this.navigateToQuranPage(pageNumber);
    })
  }

  navigateToQuranPage(pageNumber: any): void {
    this.cancel();
    this.storage.set(Constants.PAGE_NUMBER, pageNumber).then(val => {
      this.navParams.data.tabBar.select(0);
    });
  }

  cancel() {
    this.pageNumber = '';
    this.viewCtrl.dismiss();
  }
}
