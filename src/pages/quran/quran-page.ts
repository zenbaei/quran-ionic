import { Component, ViewChild } from '@angular/core';
import { Content, Toast, Platform, Gesture } from 'ionic-angular';
import { QuranService } from '../../app/service/quran/quran-service';
import { AppUtils } from "../../app/util/app-utils/app-utils";
import * as Constants from '../../app/all/constants';
import { ToastController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { timer } from 'rxjs/observable/timer';
import { Quran } from '../../app/domain/quran';
import { NumberUtils } from '../../app/util/number-utils/number-utils';

declare var $: any;

@Component({
  selector: 'page-quran',
  templateUrl: 'quran-page.html'
})
export class QuranPage {

  @ViewChild(Content) content: Content;
  @ViewChild('container') container;
  private gesture: Gesture;
  private infoToast: Toast;
  private isZoomed: boolean = false;
  private lineHeight: string;
  private lineHeightExtended: string;

  constructor(private quranService: QuranService,
    private toastCtl: ToastController,
    private events: Events, private orientation: ScreenOrientation,
    private platform: Platform) {
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.subscribeToCordovaEvents();
      this.initTurnJs(); // when added to ionViewDidEnter then go to 'فهرس' and back again it throws exception, perhaps becoz it's intialized twice!
      //this.addPinchEvents();
      this.subscribeToJsEvents();
      $().ready(() => { //not enough
        timer(500).subscribe(() => {
          this.executeOnEveryPage(); //when displaying page 1 first time turnjs end is not fired
          this.startAutoLineHeightResize();
        })
      });
    });
  }

  /**
   * Called every time the view is rendered (navigated to from another page)
   * use case; when selecting surah from content page and on opening application.
   */
  ionViewDidEnter() {
    this.loadSavedPageOnStart();
    timer(300).subscribe(() => this.showInfoToast(this.getInfoMsg()));
  }

  ionViewWillLeave() {
    this.clean();
  }

  clean() {
    this.dismissInfoToast();
    this.clearPopover();
  }

  /**
   * Fires whenever the tab is reclicked without being on another tab.
   * Called when using go to functionality as well.
   */
  ionSelected() {
    // ionViewWillLeave is called
    this.loadSavedPageOnStart();
    this.showInfoToast(this.getInfoMsg());
  }

  /**
   * It's executed multiple times whenever the view is manipulated.
   */
  ngAfterViewChecked() { }

  loadSavedPageOnStart() {
    this.quranService.getSavedPageNumber().then(pageNumber => {
      $('#flipbook').turn('page', pageNumber);
      // $(this).turn('data').hover = true; adding data
    });
  }

  subscribeToJsEvents() {
    $(window).resize(() => {
      this.resizeFlibookHeightAsContent();
    });
  }

  getCurrentPage(): number {
    return $('#flipbook').turn('page');
  }

  addPinchEvents() {
    // working but only the font is not increased
    this.gesture = new Gesture(this.container.nativeElement);
    this.gesture.listen();

    this.gesture.on('doubletap', (e: Event) => {
      this.isZoomed = !this.isZoomed;
      if (this.isZoomed) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }

      console.log(e.type);
    });

    this.gesture.on('pinchout', () => {
      console.log('pinchout');
      //this.zoomIn();
    });
    this.gesture.on('pinchout', () => {
      console.log('pinchout');
      //this.zoomIn();

    });
  }

  private zoomIn() {
    $("#flipbook").turn('zoom', 2);
  }

  private zoomOut() {
    $("#flipbook").turn('zoom', 1);
  }

  private executeOnEveryPage() {
    this.scrollToTop();
    this.initPopover();
    this.addOverflowEvent();
    this.resizeFlibookHeightAsContent();
  }

  async startAutoLineHeightResize() {
    console.debug('start auto line height resize');
    if (this.lineHeight) {
      return;
    }

    this.lineHeight = await this.quranService.getLineHeight(false);
    this.lineHeightExtended = await this.quranService.getLineHeight(true);

    if (this.lineHeight) {
      this.applyLineHeight(this.lineHeight);
      this.resizeFlibookHeightAsContent();
      return;
    }

    if (!this.isPortrait()) {
      this.orientation.lock(this.orientation.ORIENTATIONS.PORTRAIT);
    }

    // start loading
    $('#flipbook').turn('page', 3);

    this.lineHeightExtended = this.detectSuitableLineHeight(3, true);
    this.quranService.saveLineHeight(this.lineHeightExtended, true);

    //called after extended to be the last line-height applied
    this.lineHeight = this.detectSuitableLineHeight(3, false);
    this.quranService.saveLineHeight(this.lineHeight, false);

    console.debug(`Final line-height: ${this.lineHeight}, extended line height: ${this.lineHeightExtended}`);

    $('#flipbook').turn('page', 1);
    // end loading

  }

  private initTurnJs() {
    let self = this;
    $("#flipbook").turn({
      width: '100%',
      height: '100%',
      display: 'single',
      elevation: 50,
      acceleration: true,
      gradients: true,
      autoCenter: true,
      duration: 2000,
      pages: 604,
      when: {
        turning: function (e, page, view) {
          self.clean();
          self.saveCurrentPageNumber(page);
        },
        missing: function (e, pages) {
          for (var i = 0; i < pages.length; i++) {
            self.addPage(pages[i], $(this));
          }
        },
        end: function (e, pages) {
          console.debug('Turnjs end event');
          self.executeOnEveryPage();
        }
      }
    });
  }

  private addPage(page, book) {
    var element = $(`<div style="background-color:white"/>`); // background helps with short page (nu 2) back

    if (page == 'didntfigureyet') {
      var hardCover = `<div class="hard">
    <img src="/assets/img/madina.jpg" alt="Smiley face" height="100%" width="100%"> </div><div class="hard"></div>`;
      element.html(hardCover)
      // book.turn('addPage', $('<div />').html(hardCover), 1);
    }

    if (book.turn('addPage', element, page)) {
      this.quranService.find(page, this.isAndroid()).subscribe((quran) => {
        this.savePageInfo(quran);
        let innerDiv = `<div id="border" class="${this.evaluateBorderClasses(page)}">
            <div style="background-color: aliceblue" class="${this.evaluatePaddingClasses(page)}">
              <div id="font-selector" class="${this.evaluateContentClasses(page)}">
                ${quran.data}
              </div>
            </div>
          </div>`
        element.html(innerDiv);
      });
    }
  }

  saveCurrentPageNumber(page: number) {
    this.quranService.savePageNumber(page);
    sessionStorage.setItem(Constants.PAGE_NUMBER, page.toString()); //used in tabs.ts, using value from sqllite doesnt work
  }

  savePageInfo(quran: Quran) {
    let info = {
      surahName: quran.surahName,
      pageNumber: quran.pageNumber,
      goze: quran.goze,
      hezb: quran.hezb
    }
    sessionStorage.setItem(quran.pageNumber.toString(), JSON.stringify(info));
  }

  evaluateBorderClasses(page: number): string {
    let classes: string = '';

    if (page < 3) {
      classes = 'mushaf-container-fateha';
    } else {
      classes = 'mushaf-container';
    }

    return classes;
  }

  evaluatePaddingClasses(page: number): string {
    if (page < 3) {
      return 'fateha-padding'
    } else {
      return 'mushaf-padding';
    }
  }

  evaluateContentClasses(page: number): string {
    let classes: string = 'ios-justify';
    if (page == 604) {
      classes += ', moaouzat-content';
    }
    return classes;
  }

  private scrollToTop() {
    this.content.scrollToTop();
  }

  public swipeEvent(event: any): void {
    if (event.direction === 2) {
      $('#flipbook').turn('previous');
    } else if (event.direction === 4) {
      $('#flipbook').turn('next');
    }
  }

  public tapEvent(event: any): void {
    this.events.publish(Constants.EVENT_HIDE_CONTROL_BUTTONS);
  }

  private subscribeToCordovaEvents(): void {
    this.events.subscribe(Constants.EVENT_TOGGLE_TAB, (status: Constants.Status) => {
      this.tabToggledEventAction(status)
    });
    this.orientation.onChange().subscribe(() =>
      timer(100).subscribe(() =>
        this.orientationChangedEvent()
      )
    );
  }

  /**
   * It has an advantage over the ionic popover in that the popover position comes on top
   * of the span rather that in a static position as ionic popover
   */
  initPopover() {
    let tafsirAnchors: JQuery<HTMLElement> = $('[data-toggle="popover"]');
    if (tafsirAnchors.length === 0) { // content not displayed yet
      return;
    }

    tafsirAnchors.popover({
      trigger: 'focus',
      container: 'body'
    });
  }

  private clearPopover() {
    let tafsirAnchors: JQuery<HTMLElement> = $('[data-toggle="popover"]');
    if (tafsirAnchors.length === 0) { // content not displayed yet
      return;
    }
    tafsirAnchors.popover("hide");
  }

  public showInfoToast(msg: string): void {
    this.infoToast = this.toastCtl.create({
      message: msg,
      duration: 3000,
      position: 'middle'
    });
    this.infoToast.present();
  }

  private dismissInfoToast() {
    if (this.infoToast) {
      this.infoToast.dismiss();
      this.infoToast = null;
    }
  }

  private getInfoMsg(): string {
    var page = this.getCurrentPage().toString();
    var quran = JSON.parse(sessionStorage.getItem(page));
    if (!quran) {
      return;
    }
    var gozeAndHezb = `الجـزء ${quran.goze} - ${quran.hezb}`;
    return `${quran.surahName} - (${gozeAndHezb})`;
  }

  private orientationChangedEvent() {
    console.debug(`Orientation is: ${this.orientation.type}`);
    this.clean();
    this.applyOrientationLineHeight();
    this.resizeFlibookHeightAsContent();
  }

  private isPortrait(): boolean {
    return AppUtils.isPortrait(this.orientation);
  }

  private isAndroid(): boolean {
    return this.platform.is(Constants.PLATFORM_ANDROID);
  }

  tabToggledEventAction(status: Constants.Status) {
    sessionStorage.setItem(IS_TAB_HIDDEN, status.toString());//saving status in case of changing orientatin
    if (!this.isPortrait()) {
      return;
    }
    if (status === Constants.Status.HIDDEN) {
      this.applyLineHeight(this.lineHeightExtended);
    } else {
      this.applyLineHeight(this.lineHeight);
    }

    this.resizeFlibookHeightAsContent();
  }

  applyOrientationLineHeight() {
    if (this.isPortrait()) {
      this.isTabHidden() ? this.applyLineHeight(this.lineHeightExtended) :
        this.applyLineHeight(this.lineHeight);
    } else {
      this.isAndroid() ? this.applyLineHeight(ANDROID_LAND_LINE_HEIGHT) :
        this.applyLineHeight(IOS_LAND_LINE_HEIGHT);
    }
  }

  isTabHidden(): boolean {
    let isTabHidden: string = sessionStorage.getItem(IS_TAB_HIDDEN);
    return isTabHidden == Constants.Status.HIDDEN.toString() ?
      true : false;
  }

  private resizeFlibookHeightAsContent() {
    //timer(100).subscribe(() => {
    var pageNu = this.getCurrentPage();
    var height = (pageNu < 3 && this.isPortrait()) ? this.getFullPossibleHeight() :
      this.getCurrentContentHeight(pageNu) + 'px';

    if (!height) {
      return;
    }

    $('#flipbook').turn('size', 'auto', height);
    //});
  }

  private addOverflowEvent(): void {
    $('.mushaf-container').bind('overflow', this.OnOverflowChanged);
  }

  /**
   * To avoid having first 2 pages height shorter than others.
   * @param heightStr 
   */
  getFullPossibleHeight(): string {    
    return this.getMaxContentHeight(this.isTabHidden()) + 'px';
  }

  detectSuitableLineHeight(pageNuSample: number, isFullPage: boolean): string {
    var maxContentHeight = this.getMaxContentHeight(isFullPage);

    let overflowedCssLineHeight = this.increaseLineHeightUntilOverflowed(this.getCurrentContentHeight(pageNuSample),
      maxContentHeight, this.getCurrentCssLineHeight());

    let appropriateLineHeight = this.decreaseLineHeightToFirstPointBeforeMax(this.getCurrentContentHeight(pageNuSample),
      maxContentHeight, overflowedCssLineHeight);

    return appropriateLineHeight;
  }

  /**
   * 
   * @param isFullPage for extended view when tab is hidden
   */
  getMaxContentHeight(isFullPage: boolean) {
    let tabbar = $('.tabbar').css('height').replace('px', '');
    let height = this.platform.height();
    return isFullPage ? height : height - tabbar;
  }

  getCurrentContentHeight(pageNu) {
    return $(`.p${pageNu} #border`).css('height').replace('px', '');
  }

  getCurrentCssLineHeight() {
    return $(`#flipbook`).css('line-height');
  }

  increaseLineHeightUntilOverflowed(currentContentHeight, maxContentHeight, currentCssLineHeight) {
    console.debug(`current content height: ${currentContentHeight}, 
      current line height ${currentCssLineHeight}, 
      max content height: ${maxContentHeight}`);

    if (currentContentHeight > maxContentHeight) {
      return currentCssLineHeight;
    }

    var val = Number(currentCssLineHeight.replace('px', '')) + PROPORTION;
    var newLineHeight = NumberUtils.toPrecision(val, 3) + 'px';
    this.applyLineHeight(newLineHeight);
    return this.increaseLineHeightUntilOverflowed(this.getCurrentContentHeight(3),
      maxContentHeight, newLineHeight);
  }

  applyLineHeight(val) {
    $('#flipbook').css('line-height', val);
  }

  decreaseLineHeightToFirstPointBeforeMax(currentContentHeight, maxContentHeight, currentCssLineHeight) {
    if (currentContentHeight < maxContentHeight) {
      return currentCssLineHeight;
    }
    let val: number = Number(currentCssLineHeight.replace('px', '')) - PROPORTION;
    let newLineHeight: string = NumberUtils.toPrecision(val, 3) + 'px';
    this.applyLineHeight(newLineHeight);
    return this.decreaseLineHeightToFirstPointBeforeMax(this.getCurrentContentHeight(3),
      maxContentHeight, newLineHeight);
  }

  private OnOverflowChanged(event): void {
    if (event.type == "overflow") {
      switch (event.detail) {
        case 0:
          alert("The vertical scrollbar has appeared.");
          break;
        case 1:
          alert("The horizontal scrollbar has appeared.");
          break;
        case 2:
          alert("The horizontal and vertical scrollbars have both appeared.");
          break;
      }
    }
    else {
      switch (event.detail) {
        case 0:
          alert("The vertical scrollbar has disappeared.");
          break;
        case 1:
          alert("The horizontal scrollbar has disappeared.");
          break;
        case 2:
          alert("The horizontal and vertical scrollbars have both disappeared.");
          break;
      }
    }
  }

  /*
  var formatted = formatData(JSON.stringify(quran, null, '\t'));
function formatData(data) {
    var result = stringUtils.replaceAll(data, B, L1);
    result = stringUtils.replaceAll(result, BT, L2);
    result = stringUtils.replaceAll(result, BTT, L3);
    result = stringUtils.replaceAll(result, ANCHOR_OPENING, L3 + ANCHOR_OPENING);
    result = stringUtils.replaceAll(result, ANCHOR_CLOSING, L3 + ANCHOR_CLOSING + L3);
    result = stringUtils.replaceAll(result, ANCHOR_BODY, ANCHOR_BODY + L4);

    return result;
}
*/

}

const IS_TAB_HIDDEN = 'isTabHidden';
const PROPORTION = 0.1;
const ANDROID_LAND_LINE_HEIGHT = '17vh';
const IOS_LAND_LINE_HEIGHT = '9vh';
