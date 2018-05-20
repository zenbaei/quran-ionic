import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PopoverController, Tabs } from 'ionic-angular';
import { ContentPage } from '../content/content';
import { QuranPage } from '../quran/quran';
import { GoToPopoverPage } from '../go-to-popover/go-to-popover';
import * as Constants from '../../app/all/constants';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('mushafTabs') mushafTabs: Tabs;

  tab1Root = QuranPage;
  tab2Root = ContentPage;
  params = {}; // this object is passed through [rootParams] in tabs.html
  gozeAndHezb: string = '1'; // if not intialized by any value then it won't show on tabs!
  surahName: string = '1';
  pageNumber: string = '1';
  tabMargin: string;
  readonly MARGIN_BOTTOM = 'margin-bottom';

  constructor(private popoverCtrl: PopoverController, private cdRef: ChangeDetectorRef,
    private screenOrientation: ScreenOrientation) {
  }

  ionViewDidEnter() {
    this.params = {
      mushafTabs: this.mushafTabs
    }
    let self = this;
    $(function () {
      self.hideTabBar();
    });
  }

  ngAfterViewChecked() {
    this.gozeAndHezb = sessionStorage.getItem(Constants.GOZE_AND_HEZB);
    this.surahName = sessionStorage.getItem(Constants.SURAH_NAME);
    this.pageNumber = sessionStorage.getItem(Constants.PAGE_NUMBER);
    this.cdRef.detectChanges();
  }

  showGoToPopoverPage() {
    let popover = this.popoverCtrl.create(GoToPopoverPage, {
      'mushafTabs': this.mushafTabs
    }, { cssClass: 'custom-popover' });
    popover.present();
  }

  toggleRotate() {
    if (this.screenOrientation.type === this.screenOrientation.ORIENTATIONS.PORTRAIT ||
      this.screenOrientation.type === this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY ||
      this.screenOrientation.type === this.screenOrientation.ORIENTATIONS.PORTRAIT_SECONDARY) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    } else {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }
  }

  hideTabBar() {
    let mrg: string = $('.scroll-content').css(this.MARGIN_BOTTOM);
    if (mrg !== '0') {
      setTimeout(() => {
        this.tabMargin = mrg;
        this.toggleTab('none', '0');
        this.toggleShowTabButton('block');
      }, 5000);
    }
  }

  showTabBar() {
    this.toggleTab('flex', this.tabMargin);
    this.toggleShowTabButton('none');
    this.hideTabBar();
  }

  toggleTab(display: string, margin: string) {
    let elements = document.querySelectorAll(".tabbar");

    if (elements != null) {
      Object.keys(elements).map((key) => {
        elements[key].style.display = display;
      });
    }

    $('.scroll-content').css(this.MARGIN_BOTTOM, margin);
    $('.fixed-content').css(this.MARGIN_BOTTOM, margin);
  }

  toggleShowTabButton(display: string) {
    $('.bottom-right').css('display', display);
  }
}
