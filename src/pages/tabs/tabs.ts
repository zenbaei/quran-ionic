import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PopoverController, Tabs, Tab, Events } from 'ionic-angular';
import { ContentPage } from '../content/content';
import { QuranPage } from '../quran/quran';
import { GoToPopoverPage } from '../go-to-popover/go-to-popover';
import * as Constants from '../../app/all/constants';
import { AppUtils } from '../../app/util/app-utils/app-utils';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('tabBar') tabBar: Tabs;

  tab1Root = QuranPage;
  tab2Root = ContentPage;
  params = {}; // this object is passed through [rootParams] in tabs.html
  surahName: string = '1';
  pageNumber: string = '1';
  tabMarginHeight: string;
  isEnabled: boolean = true;
  readonly SHOW_TAB_BTN_CLASS = '.show-tab-btn';
  readonly HIDE_TAB_BTN_CLASS = '.hide-tab-btn';
  readonly TAB_CLASS = '.fixed-content';
  readonly MIN_QURAN_FONT_SIZE: number = 3.6;
  readonly MAX_QURAN_FONT_SIZE: number = 6;
  readonly INCREASE_FONT_PROPORTION: number = 0.1;

  constructor(private popoverCtrl: PopoverController, private cdRef: ChangeDetectorRef,
    private orientation: ScreenOrientation, private events: Events) {
      this.subscribeToEvents();
  }

  ionViewDidEnter() {
    this.saveParamForContentPage();
    let self = this;
    $(function () {
      self.tabMarginHeight = self.getTabMarginBottom();
      self.toggleTabButton(true);
    });
  }

  ngAfterViewChecked() {
    this.surahName = sessionStorage.getItem(Constants.SURAH_NAME);
    this.pageNumber = sessionStorage.getItem(Constants.PAGE_NUMBER);
    this.cdRef.detectChanges();
  }

  /**
   * Fired on tab change.
   * Disable font controls if not on quran page or if changed orientation and previous was quran page.
   * @param tab 
   */
  tabSelected(tab: Tab) {
    //TODO: impl need to be changed
    let selectedHistory: string[] = this.tabBar._selectHistory;
    let lastSelection: string = selectedHistory[selectedHistory.length - 1];
    if (tab.root == QuranPage || tab.index == 3 || tab.index == 4 ||
      (tab.index == 2 && lastSelection == 't0-0')) {
      this.isEnabled = true;
    } else {
      this.isEnabled = false;
    }
  }

  showGoToPopoverPage() {
    let popover = this.popoverCtrl.create(GoToPopoverPage, {
      'tabBar': this.tabBar
    }, { cssClass: 'custom-popover' });
    popover.present();
  }

  private saveParamForContentPage() {
    this.params = {
      tabBar: this.tabBar
    }
  }

  toggleRotate() {
    if (AppUtils.isPortrait(this.orientation)) {
      this.orientation.lock(this.orientation.ORIENTATIONS.LANDSCAPE);
    } else {
      this.orientation.lock(this.orientation.ORIENTATIONS.PORTRAIT);
    }
  }

  public hideTabBar() {
    this.tabBar.setTabbarHidden(true);
    this.toggleTabButton(false);
    this.fireToggleTabEvent(Constants.TabStatus.HIDDEN);
  }

  public showTabBar() {
    this.tabBar.setTabbarHidden(false);
    this.toggleTabButton(true);
    this.fireToggleTabEvent(Constants.TabStatus.SHOWN);
  }

  public getTabMarginBottom(): string {
    return $(this.TAB_CLASS).css(Constants.CSS_MARGIN_BOTTOM);
  }

  private fireToggleTabEvent(status: Constants.TabStatus): void {
    this.events.publish(Constants.EVENT_TOGGLE_TAB, status);
  }

  private fireFontChangedEvent(): void {
    this.events.publish(Constants.EVENT_FONT_CHANGED);
  }

  /**
   * Manipulates the tab show/hide button.
   * @param showTab 
   */
  private toggleTabButton(showTab: boolean) {
    if (showTab) {
      $(this.SHOW_TAB_BTN_CLASS).css('display', 'none');
      $(this.HIDE_TAB_BTN_CLASS).css({
        'display': 'block',
        'bottom': (Number(this.tabMarginHeight.replace('px', '')) + 5) + 'px'
      });
    } else {
      $(this.SHOW_TAB_BTN_CLASS).css('display', 'block');
      $(this.HIDE_TAB_BTN_CLASS).css('display', 'none');
    }
  }

  increaseFont() {
    let size: number = this.calculateFontSize(this.getFontSize(), Operator.ADD);
    if (size <= this.MAX_QURAN_FONT_SIZE) {
      this.fireFontChanged(size);
    }
  }

  decreaseFont() {
    let size: number = this.calculateFontSize(this.getFontSize(), Operator.MINUS);
    if (size >= this.MIN_QURAN_FONT_SIZE) {
      this.fireFontChanged(size);
    }
  }

  fireFontChanged(size: number) {
    this.saveFontSize(size);
    this.fireFontChangedEvent();
  }

  saveFontSize(size: number) {
    console.log(`save font size ${size}`);
    localStorage.setItem(Constants.QURAN_FONT_SIZE, size.toString());
  }

  getFontSize(): number {
    let fontStr: string = localStorage.getItem(Constants.QURAN_FONT_SIZE);
    if (fontStr == null) {
      return this.MIN_QURAN_FONT_SIZE + this.INCREASE_FONT_PROPORTION; //start at 3.7
    }
    return Number(fontStr);
  }

  calculateFontSize(fontSize: number, operator: Operator): number {
    let nu: number;
    if (Operator.ADD === operator) {
      nu = this.INCREASE_FONT_PROPORTION + fontSize;
    } else {
      nu = fontSize - this.INCREASE_FONT_PROPORTION;
    }
    return Number(nu.toPrecision(3))
  }

  subscribeToEvents() {
    this.events.subscribe(Constants.EVENT_KEYBOARD_OPEN_LNDSCP, () => {
      this.hideTabBar();
    });
  }
}

enum Operator { ADD, MINUS };
