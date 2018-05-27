import { Component, ViewChild } from '@angular/core';
import { NavParams, IonicPage, Searchbar, Content, Keyboard, Events } from 'ionic-angular';
import { QuranIndex } from '../../app/domain/quran-index';
import { QuranIndexService } from '../../app/service/quran-index/quran-index.service';
import { Storage } from '@ionic/storage';
import * as Constants from '../../app/all/constants';
import { RegexUtils } from "../../app/util/regex-utils/regex-utils";
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { AppUtils } from '../../app/util/app-utils/app-utils';

@IonicPage()
@Component({
  selector: 'page-content',
  templateUrl: 'content.html'
})
export class ContentPage {
  @ViewChild('surahSearchBar') surahSearchBar: Searchbar;
  @ViewChild(Content) content: Content;
  quranIdxArr: QuranIndex[] = [];
  searchQuery: string = '';

  constructor(private surahIndexService: QuranIndexService, private navParams: NavParams,
    private storage: Storage, private orientation: ScreenOrientation, private keyboard: Keyboard,
    private events: Events) {
    this.initializeItems();
  }

  goToPage(pageNumber: number) {
    this.storage.set(Constants.PAGE_NUMBER, pageNumber).then(val => {
      this.navParams.data.tabBar.select(0);
    });
  }

  ionViewDidEnter() {
    this.surahSearchBar.clearInput(null);
    this.content.scrollToTop();
  }

  initializeItems() {
    this.quranIdxArr = this.surahIndexService.surahIndexArr;
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();
    this.fireKeyboardOpenOnLandscape();

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

  /**
   * When keyboard opened on landscape we need 
   * to hide the tab bar to free some screen space.
   */
  private fireKeyboardOpenOnLandscape(): void {
    if (!AppUtils.isPortrait(this.orientation) && this.keyboard.isOpen()) {
      this.events.publish(Constants.EVENT_KEYBOARD_OPEN_LNDSCP);
    }
  }

}
