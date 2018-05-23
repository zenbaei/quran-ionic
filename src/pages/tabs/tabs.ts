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
  tabMarginHeight: string;
  readonly MARGIN_BOTTOM_PRP = 'margin-bottom';
  readonly SHOW_TAB_BTN_CLASS = '.show-tab-btn';
  readonly HIDE_TAB_BTN_CLASS = '.hide-tab-btn';
  readonly TAB_HEIGHT_CLASS = '.fixed-content';

  constructor(private popoverCtrl: PopoverController, private cdRef: ChangeDetectorRef,
    private screenOrientation: ScreenOrientation) {
  }

  ionViewDidEnter() {
    this.params = {
      mushafTabs: this.mushafTabs
    }
    let self = this;
    $(function() {
      self.tabMarginHeight =  $(self.TAB_HEIGHT_CLASS).css(self.MARGIN_BOTTOM_PRP);
      self.toggleTabButton(true);
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
    let mrg: string = $(this.TAB_HEIGHT_CLASS).css(this.MARGIN_BOTTOM_PRP);
    this.tabMarginHeight = mrg;
    this.toggleTab('none', '0');
    this.toggleTabButton(false);
  }

  showTabBar() {
    this.toggleTab('flex', this.tabMarginHeight);
    this.toggleTabButton(true);
  }

  toggleTab(display: string, margin: string) {
    let elements = document.querySelectorAll(".tabbar");

    if (elements != null) {
      Object.keys(elements).map((key) => {
        elements[key].style.display = display;
      });
    }

    $('.scroll-content').css(this.MARGIN_BOTTOM_PRP, margin);
    $(this.TAB_HEIGHT_CLASS).css(this.MARGIN_BOTTOM_PRP, margin);
  }

  toggleTabButton(showTab: boolean) {
    if (showTab) {
      $(this.SHOW_TAB_BTN_CLASS).css('display', 'none');
      $(this.HIDE_TAB_BTN_CLASS).css({
        'display': 'block',
        'bottom': (Number(this.tabMarginHeight.replace('px','')) + 5) + 'px'
      });
    } else {
      $(this.SHOW_TAB_BTN_CLASS).css('display', 'block');
      $(this.HIDE_TAB_BTN_CLASS).css('display', 'none');
    }
  }
}

