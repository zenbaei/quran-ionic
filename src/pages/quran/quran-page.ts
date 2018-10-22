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
  private turnJsEndNuOfCalls: number = 0;

  constructor(private quranService: QuranService,
    private toastCtl: ToastController,
    private events: Events, private orientation: ScreenOrientation,
    private platform: Platform) {
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.subscribeToCordovaEvents();
      this.initTurnJs(); // when added to ionViewDidEnter then go to 'فهرس' and back again it throws exception, perhaps becoz it's intialized twice!
      this.init();
      //this.addPinchEvents();
      //this.subscribeToJsEvents();
    });
  }

  //set content high (line size then not pass border)
  //set border high (window)
  //set flipbook high (window)

  //figuring the content high is done once at start

  //setting the content high is done:
  //1- at start
  //2- toggle tab
  //3- change orientation  

  /**
   * Called every time the view is rendered (navigated to from another page)
   * use case; when selecting surah from content page and on opening application.
   */
  ionViewDidEnter() {
    this.loadSavedPageOnStart();

    //TODO: change it timer(300).subscribe(() => this.showInfoToast(this.getInfoMsg()));
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

  loadSavedPageOnStart(): Promise<any> {
    return this.quranService.getSavedPageNumber().then(pageNumber => {
      this.goToPage(pageNumber);
      return;
    });
  }

  /*
  subscribeToJsEvents() {
    $(window).resize(() => {
      this.resizeHeights();
    });
  }
  */

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
  }

  private async init() {
    console.log('init');
    this.lineHeight = await this.quranService.getLineHeight(false);
    this.lineHeightExtended = await this.quranService.getLineHeight(true);
    this.runAfterContentIsReady(() => {
      if (!this.lineHeight) {
        this.startAutoLineHeightDetection();
      }
      this.resizeHeights();
    });
  }

  runAfterContentIsReady = (callback) => {
    var start = () => {
      if (!isFlipbookContentReady()) {
        return timer(100).subscribe(() => {
          start();
        });
      }
      callback();
    }

    var isFlipbookContentReady = () => {
      var pages = $(`#flipbook .page #content`);
      if (!pages || pages.length == 0) {
        return false;
      }
      return true;
    }

    start();
  }

  startAutoLineHeightDetection = () => {
    var pageSample = 3;

    var start = () => {
      console.log('start auto line height resize');
      if (!this.isPortrait()) {
        this.orientation.lock(this.orientation.ORIENTATIONS.PORTRAIT);
      }

      // start loading
      this.goToPage(pageSample);

      this.lineHeightExtended = detectSuitableLineHeight(pageSample, true);
      this.quranService.saveLineHeight(this.lineHeightExtended, true);

      //called after extended to be the last line-height applied
      this.lineHeight = detectSuitableLineHeight(pageSample, false);
      this.quranService.saveLineHeight(this.lineHeight, false);

      console.debug(`Final line-height: ${this.lineHeight}, extended line height: ${this.lineHeightExtended}`);

      this.goToPage(1);
      // end loading
    }

    var detectSuitableLineHeight = (pageNuSample: number, isFullPage: boolean) => {
      this.setBorderHeight('auto');

      var maxHeight = this.getAvailableWindowHeight(isFullPage);

      let overflowedCssLineHeight = increaseLineHeightUntilOverflowed(this.getBorderHeight(pageNuSample),
        maxHeight, this.getCurrentCssLineHeight());

      let appropriateLineHeight = decreaseLineHeightToFirstPointBeforeMax(this.getBorderHeight(pageNuSample),
        maxHeight, overflowedCssLineHeight);

      return appropriateLineHeight;
    }

    var increaseLineHeightUntilOverflowed = (currentBorderHeight, maxHeight, currentCssLineHeight) => {
      console.debug(`increaseLineHeightUntilOverflowed: 
        current content height: ${currentBorderHeight}, 
        current line height ${currentCssLineHeight}, 
        max content height: ${maxHeight}`);

      if (currentBorderHeight > maxHeight) {
        return currentCssLineHeight;
      }

      var val = Number(currentCssLineHeight.replace('px', '')) + PROPORTION;
      var newLineHeight = NumberUtils.toPrecision(val, 3) + 'px';
      this.setLineHeight(newLineHeight);
      return increaseLineHeightUntilOverflowed(this.getBorderHeight(3),
        maxHeight, newLineHeight);
    }

    var decreaseLineHeightToFirstPointBeforeMax = (currentBorderHeight, maxHeight, currentCssLineHeight) => {
      if (currentBorderHeight < maxHeight) {
        return currentCssLineHeight;
      }
      let val: number = Number(currentCssLineHeight.replace('px', '')) - PROPORTION;
      let newLineHeight: string = NumberUtils.toPrecision(val, 3) + 'px';
      this.setLineHeight(newLineHeight);
      return decreaseLineHeightToFirstPointBeforeMax(this.getBorderHeight(3),
        maxHeight, newLineHeight);
    }

    start();
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
          console.log('turning')
        },
        missing: function (e, pages) {
          for (var i = 0; i < pages.length; i++) {
            self.addPage(pages[i], $(this));
          }
          console.log('missing')
        },
        end: function (e, pages) {
          console.log('end');
          self.turnJsEndNuOfCalls++;
          if (self.turnJsEndNuOfCalls == 2) { // event is fired twice!
            self.executeOnEveryPage();
            self.turnJsEndNuOfCalls = 0;
          }
        }
      }
    });
  }

  private addPage(page, book) {
    var element = $(`<div style="background-color:white"/>`); // background helps with short page (nu 2) back

    if (book.turn('addPage', element, page)) {
      this.quranService.find(page, this.isAndroid()).subscribe((quran) => {
        this.savePageInfo(quran);
        let innerDiv = `<div class="mushaf-border ${this.evaluateBorderClasses(page)}">
            <div id="content" style="background-color: aliceblue" class="${this.evaluatePaddingClasses(page)}">
              <div class="${this.evaluateContentClasses(page)}">
                ${quran.data}
              </div>
            </div>
          </div>`
        element.html(innerDiv);
      });
    }
  }

  goToPage(pageNu) {
    $('#flipbook').turn('page', pageNu);
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
    if (!msg) {
      return;
    }
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
    var quran = JSON.parse(sessionStorage.getItem(this.getCurrentPage().toString()));
    if (!quran) {
      return;
    }
    var gozeAndHezb = `الجـزء ${quran.goze} - ${quran.hezb}`;
    return `${quran.surahName} - (${gozeAndHezb})`;
  }

  private orientationChangedEvent() {
    console.debug(`Orientation is: ${this.orientation.type}`);
    this.clean();
    this.resizeHeights();
  }

  resizeHeights = () => {
    var self = this;

    function start() {
      console.log('resize heights');
      resizeLineHeight();
      resizeBorderAndFlipbookHeight();
    }

    function resizeLineHeight() {
      var val;

      if (self.isPortrait()) {
        val = self.isTabHidden() ? self.lineHeight : self.lineHeightExtended;
      } else {
        val = self.isAndroid() ? ANDROID_LAND_LINE_HEIGHT : IOS_LAND_LINE_HEIGHT;
      }

      self.setLineHeight(val);
    }

    function resizeBorderAndFlipbookHeight() {
      var val;
      if (self.isPortrait()) {
        val = self.isTabHidden() ? self.getAvailableWindowHeight(true) : self.getAvailableWindowHeight(false);
      } else {
        val = self.getContentHeight();
      }

      self.setBorderHeight(val);

      $('#flipbook').turn('size', 'auto', val);
    }

    start();
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
    this.resizeHeights();
  }

  isTabHidden(): boolean {
    let isTabHidden: string = sessionStorage.getItem(IS_TAB_HIDDEN);
    return isTabHidden == Constants.Status.HIDDEN.toString() ?
      true : false;
  }

  private addOverflowEvent(): void {
    $('.mushaf-container').bind('overflow', this.OnOverflowChanged);
  }

  /**
   * 
   * @param isTabHidden for extended view when tab is hidden
   */
  getAvailableWindowHeight(isTabHidden: boolean) {
    let tabbar = $('.tabbar').css('height').replace('px', '');
    let height = this.platform.height();
    return isTabHidden ? height : height - tabbar;
  }

  getBorderHeight(pageNu) {
    return $(`.p${pageNu} .mushaf-border`).css('height').replace('px', '');
  }

  getCurrentCssLineHeight() {
    return $(`#flipbook`).css('line-height');
  }

  setLineHeight(val) {
    $('#flipbook').css('line-height', val);
  }

  setBorderHeight(val) {
    $('.mushaf-border').each((i, element) => {
      $(element).css('height', val);
    });
  }

  getContentHeight() {
    var pageNu = this.getCurrentPage();
    console.log('pages: ' + $(`.page`).length);
    console.log('content: ' + $(`.p${pageNu} #content`).length);
    return $(`.p${pageNu} #content`).css('height').replace('px', '');
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
