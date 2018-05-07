import { Component, ViewChild, Input, ElementRef, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QuranIndexService } from '../../app/service/quran-index/quran-index.service';
import { QuranPage } from '../quran/quran';
import { ContentPage } from '../content/content';
import { AppUtils } from '../../app/util/app-utils/app-utils';


@IonicPage({
  name: 'GoToPage',
  segment: 'goTo'
})
@Component({
  selector: 'page-go-to',
  templateUrl: 'go-to.html',
})
export class GoToPage {
  @ViewChild('input') pageNumberEl;
  pageNumber: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ngAfterViewChecked() {
    this.pageNumberEl.setFocus();
  }

  goToPage() {
    let pageNumber: number = Number(this.pageNumber.trim());
    this.reset();
    this.navigateToQuranPage(pageNumber);
  }

  cancel() {
    let pageNumber: number = Number(this.getPageNumber());
    if (!pageNumber) { // back when on content page, there will be no page number yet
      this.navCtrl.push(ContentPage.name);
    }
    this.navigateToQuranPage(pageNumber);
  }

  reset() {
    this.pageNumber = '';
  }

  /*
  * QuranPage ngOnInit will be called after pushing the page.
  */
  navigateToQuranPage(pageNumber: number) {
    if (!pageNumber || !AppUtils.isValidPageNumber(pageNumber)) {
      return;
    }
    
    this.navCtrl.push(QuranPage.name, {
      'pageNumber': pageNumber
    });
  }

  getPageNumber(): string {
    let pagNumStr = this.navParams.get('pageNumber');
    if (!pagNumStr || pagNumStr === null) {
      return '';
    }
    return pagNumStr.trim();
  }

}
