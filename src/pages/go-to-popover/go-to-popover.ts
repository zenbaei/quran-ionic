import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular'
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
  pageNumber: string = '';

  constructor(private navParams: NavParams,private viewCtrl: ViewController, 
    private storage: Storage) {
  }

  ngAfterViewChecked() {
    this.pageNumberEl.setFocus();
  }

  goToPage() {
    let pageNumber: number = Number(this.pageNumber.trim());
    if (!QuranService.isValidPageNumber(pageNumber)) {
      return;
    }
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
