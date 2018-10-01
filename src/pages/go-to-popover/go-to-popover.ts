import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams, ViewController, RadioButton, Platform } from 'ionic-angular'
import * as Constants from '../../app/all/constants';
import { Storage } from '@ionic/storage';
import { QuranService } from '../../app/service/quran/quran-service';

@IonicPage()
@Component({
  selector: 'go-to-popover',
  templateUrl: 'go-to-popover.html',
})
export class GoToPopoverPage {
  @ViewChild('pageNumberInputEl') pageNumberInputEl;
  @ViewChild('pageNuInputRadioEl') pageNuInputRadioEl: RadioButton;
  pageNumber: string = '';
  isReadBookmarkDisabled: boolean = true;
  isStudyBookmarkDisabled: boolean = true;
  isDifferentBookmarkDisabled: boolean = true;
  selectedRadioVal: string = '';
  Bookmark: any = Constants.Bookmark;
  readonly PAGE_NU_VAL = "pageNu";
  popoverTopVal: string;
  popoverHeight: string;

  constructor(private navParams: NavParams, private viewCtrl: ViewController,
    private storage: Storage,
    private platform: Platform) {
  }

  ionViewDidLoad() {
    this.shouldEnableBookmarkCtls();
    this.subscribeToJsEvents();
  }

  subscribeToJsEvents() {
    $(window).resize(() => {
      this.clear();
    });
  }

  onRadioChange(val) {
    if (val === this.PAGE_NU_VAL) {
      this.adjustPopoverPosition();
    } else {
      this.resetPopoverPosition();
    }
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

  onPageNuInputFocus() {
    this.selectedRadioVal = this.PAGE_NU_VAL;
    this.pageNuInputRadioEl.checked = true;
  }

  resetPopoverPosition() {
    if (this.platform.isLandscape()) {
      this.resetPopoverHeight();
      return;
    }
   this.resetPopoverTop();    
  }

  /**
   * To avoid being coverd by keyboard.
   */
  adjustPopoverPosition() {
    if (this.platform.isLandscape()) {
      this.changePopoverHeight();
      return;
    }
    this.chanagePopoverTop();
  }

  changePopoverHeight() {
    this.popoverHeight = $('.popover-content').css('height');
    $('.popover-content').css('height', '120px');
  }

  chanagePopoverTop() {
    this.popoverTopVal = $('.popover-content').css('top');
    $('.popover-content').css('top', '30px');
  }

  resetPopoverTop() {
    if (!this.popoverTopVal) {
      return;
    }
    $('.popover-content').css('top', this.popoverTopVal);
  }

  resetPopoverHeight() {
    if (!this.popoverHeight) {
      return;
    }
    $('.popover-content').css('height', this.popoverHeight);
  }

  goTo() {
    if (this.selectedRadioVal === '') {
      return;
    }

    switch (this.selectedRadioVal) {
      case this.PAGE_NU_VAL: {
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
    this.clear();
    this.storage.set(Constants.PAGE_NUMBER, pageNumber).then(val => {
      this.navParams.data.tabBar.select(0);
    });
  }

  clear() {
    this.pageNumber = '';
    this.viewCtrl.dismiss();
  }

}