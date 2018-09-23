import { Component, ViewChild } from '@angular/core';
import { Content, Toast, Platform, Gesture } from 'ionic-angular';
import { QuranService } from '../../app/service/quran/quran-service';
import { AppUtils } from "../../app/util/app-utils/app-utils";
import * as Constants from '../../app/all/constants';
import { ToastController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Operator } from '../../app/all/constants';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { NumberUtils } from "../../app/util/number-utils/number-utils";
import { timer } from 'rxjs/observable/timer';
import { Storage } from '@ionic/storage';
import { Quran } from '../../app/domain/quran';


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
  private fontToast: Toast;
  private readonly EXTEND_LINE_HEIGHT_CLASS: string = 'line-height-extended';
  private isZoomed: boolean = false;

  constructor(private quranService: QuranService,
    private toastCtl: ToastController,
    private events: Events, private orientation: ScreenOrientation,
    private platform: Platform, private storage: Storage) {
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.orientationChangedEvent();
      this.subscribeToCordovaEvents();
      this.addFlipAnimation(); // when added to ionViewDidEnter then go to 'فهرس' and back again it throws exception, perhaps becoz it's intialized twice!
      //this.addPinchEvents();
    });
  }

  /**
   * Called every time the view is rendered (navigated to from another page)
   * use case; when selecting surah from content page and on opening application.
   */
  ionViewDidEnter() {
    this.loadSavedPageOnStart();
    this.subscribeToJsEvents();
  }

  ionViewWillLeave() {
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
  }

  /**
   * It's executed multiple times whenever the view is manipulated.
   */
  ngAfterViewChecked() { }

  loadSavedPageOnStart() {
    this.quranService.getSavedPageNumber().then(pageNumber => {
      $('#flipbook').turn('page', pageNumber);
      this.showInfoToast(this.getInfoMsg(pageNumber)); //doesn't work when navigating to not loaded page becoz fetching page is not done yet
      // $(this).turn('data').hover = true; adding data
    });
  }

  subscribeToJsEvents() {
    $(window).resize(() => {
      this.changeWidth();
    });
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

  private executeWhenPageIsTurned() {
    this.scrollToTop();
    this.initPopover();
    this.addOverflowEvent();
  }

  private addFlipAnimation() {
    let self = this;
    $("#flipbook").turn({
      width: '100%',
      height: '100%',
      display: 'single',
      elevation: 50,
      acceleration: true,
      gradients: true,
      autoCenter: true,
      duration: 3000,
      pages: 604,
      when: {
        turning: function (e, page, view) {
          self.ionViewWillLeave();
          self.saveCurrentPageNumber(page);
        },
        missing: function (e, pages) {
          for (var i = 0; i < pages.length; i++) {
            self.addPage(pages[i], $(this));
          }
        },
        end: function (e, pages) {
          self.executeWhenPageIsTurned();
        }
      }
    });
  }

  private addPage(page, book) {
    var element = $('<div/>', {});

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
    this.events.subscribe(Constants.EVENT_FONT_CHANGED, (operator: Operator) => {
      this.fontChangedEvent(operator);
    });
    this.events.subscribe(Constants.EVENT_LINE_HEIGHT_CHANGED, (operator: Operator) => {
      this.lineHeightChangedEvent(operator)
    });
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

  private getInfoMsg(pageNumber: number): string {
    var quran = JSON.parse(sessionStorage.getItem(pageNumber.toString()));
    if (!quran) {
      return '';
    }
    var gozeAndHezb = `الجـزء ${quran.goze} - ${quran.hezb}`;
    return `${quran.surahName} - (${gozeAndHezb})`;
  }

  private fontChangedEvent(operator: Operator) {
    this.showFontChangeWarning();
    operator === Operator.INC ? this.increaseFont() :
      this.decreaseFont();
  }

  private lineHeightChangedEvent(operator: Operator) {
    operator === Operator.INC ? this.increaseLineHeight() :
      this.decreaseLineHeight();
  }

  private orientationChangedEvent() {
    console.debug(`Orientation is: ${this.orientation.type}`);
    this.ionViewWillLeave();

    /*
    this.quranPageService.getLineHeight(this.isAndroid(), this.isPortrait())
      .then(val => {
        this.resizeLineHeight(val);
      })

    this.quranPageService.getFontSize(this.isPortrait())
      .then(val => this.resizeFont(val));
    */
  }

  changeWidth() {
    timer(100).subscribe(() => {
      var width = $('#flipbook').css('width');
      $('.page').css('width', width)
    });
  }

  /**
  * Sets line heights for both orientation
  * @param lineHeight 
  */
  private resizeLineHeight(size: number) {
    size = NumberUtils.toPrecision(size, 3);

    if (!this.isValidLineHeight(size)) {
      return;
    }

    this.quranService.saveLineHeight(Number(size), this.isPortrait());
    this.setLineHeightStyle(size);
  }

  private isValidLineHeight(size: number): boolean {
    if (NumberUtils.isBetween(size, MIN_LINE_HEIGHT_SIZE,
      MAX_LINE_HEIGHT_SIZE)) {
      return true;
    }
    return false;
  }

  private setLineHeightStyle(size: number) {
    console.debug(`Set line height style: ${size}`);
    $(PAGE_SELECTOR_ELEMENT).css(Constants.CSS_LINE_HEIGHT, size + LINE_HEIGHT_UNIT);
  }

  public increaseLineHeight(): void {
    this.quranService.getLineHeight(this.isAndroid(), this.isPortrait())
      .then(val => {
        this.resizeLineHeight(val + PROPORTION);
      });
  }

  public decreaseLineHeight(): void {
    this.quranService.getLineHeight(this.isAndroid(), this.isPortrait())
      .then(val => {
        this.resizeLineHeight(val - PROPORTION);
      });
  }

  public increaseFont() {
    this.quranService.getFontSize(this.isPortrait())
      .then(val => this.resizeFont(val + PROPORTION))
  }

  public decreaseFont() {
    this.quranService.getFontSize(this.isPortrait())
      .then(val => this.resizeFont(val - PROPORTION))
  }

  private resizeFont(size: number) {
    size = NumberUtils.toPrecision(size, 3);

    if (!this.isValidFontSize(size)) {
      return;
    }

    this.quranService.saveFontSize(size, this.isPortrait());
    this.setFontSizeStyle(size);
  }

  private setFontSizeStyle(size: number) {
    console.debug(`Set font size: ${size}`);
    $(FONT_SELECTOR_ID).css(Constants.CSS_FONT_SIZE, size + FONT_UNIT);
  }

  private isValidFontSize(size: number): boolean {
    return NumberUtils.isBetween(size, MIN_QURAN_FONT_SIZE, MAX_QURAN_FONT_SIZE);
  }

  private isPortrait(): boolean {
    return AppUtils.isPortrait(this.orientation);
  }

  private isAndroid(): boolean {
    return this.platform.is(Constants.PLATFORM_ANDROID);
  }

  private showFontChangeWarning(): void {
    this.storage.get(IS_FONT_CHANGE_WARNING_DISPLAYED).then(val => {
      if (val != null) {
        return;
      }
      this.fontToast = this.toastCtl.create({
        message: this.getFontChangeWarningMsg(),
        showCloseButton: true,
        closeButtonText: 'إغلاق',
        position: 'middle'
      });
      this.fontToast.present();
      this.storage.set(IS_FONT_CHANGE_WARNING_DISPLAYED, 'y');
    });
  }

  /**
   * This flag is used in the html to set the corresponding css class.
   */
  tabToggledEventAction(status: Constants.Status) {
    if (!this.isPortrait()) {
      return;
    }
    if (status === Constants.Status.HIDDEN) {
      $('#flipbook').addClass(this.EXTEND_LINE_HEIGHT_CLASS);
    } else {
      $('#flipbook').removeClass(this.EXTEND_LINE_HEIGHT_CLASS);
    }
    timer(100).subscribe(() => {
      var height = $('#flipbook').css('height');
      $('.page').css('height', height);
    });
  }

  private addOverflowEvent(): void {
    $('.mushaf-container').bind('overflow', this.OnOverflowChanged);
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

  private getFontChangeWarningMsg(): string {
    let platformMsg: string = false ? //this.isAndroid()
      `عندها سيظهر لك ثلاث نقاط '...' فقم` :
      'عندها قم';

    return `برجاء الإنتباه عند تكبير الخط أنه قد تتجاوز بعض سطور المصحف إطار الشاشة وذلك نظرا لإختلاف أطوال السطور. `
      + `${platformMsg} بتصغير الخط مرة اخرى ليظهر لك السطر كاملا.`;
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

const FONT_SELECTOR_ID = '#font-selector';
const PAGE_SELECTOR_ELEMENT = 'page-quran';
const PROPORTION: number = 0.1;

const LINE_HEIGHT_UNIT: string = 'vh';
const FONT_UNIT: string = 'vw';

const MIN_LINE_HEIGHT_SIZE: number = 1;
const MAX_LINE_HEIGHT_SIZE: number = 32;

const MIN_QURAN_FONT_SIZE: number = 1;
const MAX_QURAN_FONT_SIZE: number = 7;

const IS_FONT_CHANGE_WARNING_DISPLAYED: string = 'isFontChangeWarningDisplayed';