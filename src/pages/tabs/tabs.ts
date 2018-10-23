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
import { BookmarkMenuPopoverPage } from '../bookmark-menu-popover/bookmark-menu-popover';

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
  surahName: string = 'surahName'; //if not initialized it won't show up
  pageNumber: string = '';
  isTabCtlEnabled: boolean = true;
  showFontCtls: boolean = false;
  showLineHeightCtls: boolean = false;
  firstClick: boolean = true; // ios rotation workaround
  tabMarginHeight: string;

  constructor(private popoverCtrl: PopoverController, private cdRef: ChangeDetectorRef,
    private orientation: ScreenOrientation, private events: Events) {
    this.subscribeToEvents();
  }

  ionViewDidEnter() {
    // TODO: change into event
    this.saveParamForContentPage();
    $(() => {
      this.tabMarginHeight = this.getTabMarginBottom();
      this.toggleTabButton(true);
    });
  }

  ngAfterViewChecked() {
    this.setPageInfo();
    this.cdRef.detectChanges();
  }

  setPageInfo() {
    this.pageNumber = sessionStorage.getItem(Constants.PAGE_NUMBER);
    let quran = JSON.parse(sessionStorage.getItem(this.pageNumber));
    this.surahName = (quran) ? quran.surahName : '';
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
    if (tab.root == QuranPage || tab.index == 3 ||
         (lastSelection == 't0-0' && (tab.index == 2 || tab.index == 4))) {
      this.isTabCtlEnabled = true;
    } else {
      this.isTabCtlEnabled = false;
      this.hideControlButtons();
    }
  }

  getTabMarginBottom(): string {
    return $(this.TAB_CLASS).css(Constants.CSS_MARGIN_BOTTOM);
  }

  showGoToPopover() {
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

  toggleOrientation() {
    if (!this.firstClick) {
      this.orientation.unlock(); // on ios will revert to the previous physical mobile rotation
      this.firstClick = true;
      return;
    }

    if (AppUtils.isPortrait(this.orientation)) {
      this.orientation.lock(this.orientation.ORIENTATIONS.LANDSCAPE);
    } else {
      this.orientation.lock(this.orientation.ORIENTATIONS.PORTRAIT);
    }

    this.firstClick = false;
  }

  public hideTabBar() {
    this.tabBar.setTabbarHidden(true);
    this.toggleTabButton(false);
    this.fireToggleTabEvent(Constants.Status.HIDDEN);
  }

  public showTabBar() {
    this.tabBar.setTabbarHidden(false);
    this.toggleTabButton(true);
    this.fireToggleTabEvent(Constants.Status.SHOWN);
  }

  private fireToggleTabEvent(status: Constants.Status): void {
    this.events.publish(Constants.EVENT_TOGGLE_TAB, status);
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
        'display': 'block',
        'bottom': (Number(this.tabMarginHeight.replace('px', '')) + 2) + 'px'
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

  public showBookmarkPopover() {
    let popover = this.popoverCtrl.create(BookmarkMenuPopoverPage, {
      'tabBar': this.tabBar
    }, { cssClass: 'custom-popover' });
    popover.present();
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

