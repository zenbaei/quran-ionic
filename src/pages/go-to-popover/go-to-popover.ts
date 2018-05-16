import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Tabs } from 'ionic-angular'
import { AppUtils } from '../../app/util/app-utils/app-utils';
import * as Constants from '../../app/all/constants';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'go-to-popover',
  templateUrl: 'go-to-popover.html',
})
export class GoToPopoverPage {
  @ViewChild('input') pageNumberEl;
  pageNumber: string = '';

  constructor(private navParams: NavParams,private viewCtrl: ViewController, 
    private storage: Storage) {
  }

  ngAfterViewChecked() {
    this.pageNumberEl.setFocus();
  }

  goToPage() {
    let pageNumber: number = Number(this.pageNumber.trim());
    if (!AppUtils.isValidPageNumber(pageNumber)) {
      return;
    }
    this.cancel();
    this.storage.set(Constants.PAGE_NUMBER, pageNumber).then(val => {
      this.navParams.data.mushafTabs.select(0);
    });
  }

  cancel() {
    this.pageNumber = '';
    this.viewCtrl.dismiss();
  }
}
