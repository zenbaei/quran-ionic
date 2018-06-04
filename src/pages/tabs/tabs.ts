import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PopoverController, Tabs, Tab, Events } from 'ionic-angular';
import { ContentPage } from '../content/content';
import { QuranPage } from '../quran/quran-page';
import { GoToPopoverPage } from '../go-to-popover/go-to-popover';
import * as Constants from '../../app/all/constants';
import { Operator } from '../../app/all/constants';
import { AppUtils } from '../../app/util/app-utils/app-utils';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import * as $ from "jquery";

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {

  readonly SHOW_TAB_BTN_CLASS = '.show-tab-btn';
  readonly HIDE_TAB_BTN_CLASS = '.hide-tab-btn';
  readonly TAB_CLASS = '.fixed-content';
  @ViewChild('tabBar') tabBar: Tabs;
  tab1Root = QuranPage;
  tab2Root = ContentPage;
  params = {}; // this object is passed through [rootParams] in tabs.html
  surahName: string = '1';
  pageNumber: string = '1';
  isTabCtlEnabled: boolean = true;
  showFontCtls: boolean = false;
  showLineHeightCtls: boolean = false;
  isTabBarShown: boolean = true;

  constructor(private popoverCtrl: PopoverController, private cdRef: ChangeDetectorRef,
    private orientation: ScreenOrientation, private events: Events) {
    this.subscribeToEvents();
  }

  ionViewDidEnter() {
    this.saveParamForContentPage();
  }

  // TODO: change into event
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
      this.isTabCtlEnabled = true;
    } else {
      this.isTabCtlEnabled = false;
      this.hideControlButtons();
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
    this.isTabBarShown = false;
  }

  public showTabBar() {
    this.tabBar.setTabbarHidden(false);
    this.toggleTabButton(true);
    this.isTabBarShown = true;
  }

  public getTabMarginBottom(): string {
    return $(this.TAB_CLASS).css(Constants.CSS_MARGIN_BOTTOM);
  }

  private hideControlButtonsEvent() {
    this.hideControlButtons();
  }

  private hideControlButtons() {
    this.showFontCtls = false;
    this.showLineHeightCtls = false;
  }

  /**
   * Manipulates the tab show/hide button.
   * @param showTab 
   */
  private toggleTabButton(showTab: boolean) {
    if (showTab) {
      $(this.SHOW_TAB_BTN_CLASS).css('display', 'none');
      $(this.HIDE_TAB_BTN_CLASS).css({
        'display': 'block'
      });
    } else {
      $(this.SHOW_TAB_BTN_CLASS).css('display', 'block');
      $(this.HIDE_TAB_BTN_CLASS).css('display', 'none');
    }
  }

  subscribeToEvents() {
    this.events.subscribe(Constants.EVENT_KEYBOARD_OPEN_LNDSCP, () => {
      this.hideTabBar();
    });
    this.events.subscribe(Constants.EVENT_HIDE_CONTROL_BUTTONS, () => {
      this.hideControlButtonsEvent();
    });
  }

  public toggleFontCtls() {
    this.showFontCtls = !this.showFontCtls;
  }

  public toggleLineHeightCtls() {
    this.showLineHeightCtls = !this.showLineHeightCtls;
  }

  public fireFontChangedEvent(op: number) {
    this.events.publish(Constants.EVENT_FONT_CHANGED,
      this.getOperator(op));
  }

  public fireLineHeightChangedEvent(op: number) {
    this.events.publish(Constants.EVENT_LINE_HEIGHT_CHANGED,
      this.getOperator(op));
  }

  private getOperator(op: number): Operator {
    return op > 0 ? Operator.INC : Operator.DEC;
  }
}

