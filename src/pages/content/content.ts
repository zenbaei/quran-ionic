import { Component, ViewChild } from '@angular/core';
import { NavParams, IonicPage, Searchbar, Content } from 'ionic-angular';
import { Index } from '../../app/domain';
import { IndexService } from '../../app/service/index/index-service';
import { Storage } from '@ionic/storage';
import * as Constants from '../../app/all/constants';
import { RegexUtils } from "../../app/util/regex-utils/regex-utils";


@IonicPage()
@Component({
  selector: 'page-content',
  templateUrl: 'content.html'
})
export class ContentPage {
  @ViewChild('surahSearchBar') surahSearchBar: Searchbar;
  @ViewChild(Content) content: Content;
  quranIdxArr: Index[] = [];
  searchQuery: string = '';

  constructor(private indexService: IndexService, private navParams: NavParams,
    private storage: Storage) {
    this.initializeItems();
  }

  goToPage(pageNumber: number) {
    this.storage.set(Constants.PAGE_NUMBER, pageNumber).then(val => {
      this.navParams.data.tabBar.select(0);
    });
  }

  ionViewWillLeave() {
    this.surahSearchBar.clearInput(null);
    this.content.scrollToTop();
  }

  initializeItems() {
    this.quranIdxArr = this.indexService.surahIndexArr;
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    if (ev === null) {
      return;
    }

    // set val to the value of the searchbar
    let val: string = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.quranIdxArr = this.quranIdxArr.filter((surahIdx) => {
        let normalizedSurah: string = RegexUtils.removeTashkil(surahIdx.surahName);
        return (normalizedSurah.indexOf(val) != -1 || surahIdx.surahNumber === Number(val.trim()));
      });
    }
  }
}
