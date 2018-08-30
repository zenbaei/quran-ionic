import { Component, ViewChild } from '@angular/core';
import { Content, Toast, Platform } from 'ionic-angular';
import { QuranService } from '../../app/service/quran/quran-service';
import { IndexService } from '../../app/service/index/index-service';
import { Tafsir } from '../../app/domain/tafsir';
import { TafsirService } from '../../app/service/tafsir/tafsir-service';
import { QuranPageMetadata } from '../../app/domain/quran-page-metadata';
import { QuranPageHelper } from './quran-page-helper';
import { AppUtils } from "../../app/util/app-utils/app-utils";
import * as Constants from '../../app/all/constants';
import { ToastController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Operator } from '../../app/all/constants';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { NumberUtils } from "../../app/util/number-utils/number-utils";
import { timer } from 'rxjs/observable/timer';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-quran',
  templateUrl: 'quran-page.html'
})
export class QuranPage {

  @ViewChild(Content) content: Content;
  private pageContent: string = '';
  private currentPageNumber: number = -1;
  private gozeAndHezb: string = '';
  private surahName: string = '';
  private infoToast: Toast;
  private fontToast: Toast;
  private extendLineHeight: boolean = false;

  constructor(private quranPageService: QuranService, private tafsirService: TafsirService,
    private quranIndexService: IndexService, private toastCtl: ToastController,
    private events: Events, private orientation: ScreenOrientation,
    private platform: Platform, private storage: Storage) {
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.orientationChangedEvent();
      this.subscribeToEvents();
    });
  }

  /**
   * Called every time the view is rendered (navigated to from another page)
   * use case; when selecting surah from content page and on opening application.
   */
  ionViewDidEnter() {
    this.quranPageService.getPageNumber().then(val => {
      let pgNu: number = (val === null) ? 1 : val;
      this.loadPage(pgNu).then(() => {
        this.showInfoToast();
      });
    });
  }

  ionViewWillLeave() {
    this.dismissInfoToast();
    this.clearPopover();
  }

  /**
   * Fires whenever the tab is reclicked without being on another tab.
   */
  ionSelected() {
    this.dismissInfoToast();
    this.ionViewDidEnter();
  }

  /**
   * It's executed multiple times whenever the view is manipulated.
   */
  ngAfterViewChecked() { }

  /**
   * It works without using document ready, but it's just a better timing for showing the toast..
   */
  private executeWhenDocIsReady() {
    let self = this;
    $(function () {
      self.scrollToTop();
      self.initPopover();
      self.addOverflowEvent();
    });
  }

  private scrollToTop() {
    this.content.scrollToTop();
  }

  private loadPage(pageNumber: number): Promise<any> {
    this.currentPageNumber = pageNumber;
    return new Promise((resolve) => {
      this.findQuranPageByPageNumber(pageNumber).then(val => {
        this.executeWhenDocIsReady();
        resolve();
      });
    });
  }

  public swipeEvent(event: any): void {
    let pageNumber: number = this.calculatePageNumber(event);

    if (pageNumber === -1) {
      return;
    }

    if (QuranService.isValidPageNumber(pageNumber)) {
      this.clearPopover();
      this.dismissInfoToast();
      this.quranPageService.savePageNumber(pageNumber);
      this.loadPage(pageNumber);
    }
  }

  public tapEvent(event: any): void {
    this.events.publish(Constants.EVENT_HIDE_CONTROL_BUTTONS);
  }

  private calculatePageNumber(event: any): number {
    if (event.direction === 2) {
      return this.currentPageNumber - 1;
    } else if (event.direction === 4) {
      return this.currentPageNumber + 1;
    } else {
      return -1;
    }
  }

  private subscribeToEvents(): void {
    this.events.subscribe(Constants.EVENT_FONT_CHANGED, (operator: Operator) => {
      this.fontChangedEvent(operator);
    });
    this.events.subscribe(Constants.EVENT_LINE_HEIGHT_CHANGED, (operator: Operator) => {
      this.lineHeightChangedEvent(operator)
    });
    this.events.subscribe(Constants.EVENT_TOGGLE_TAB, (status: Constants.Status) => {
      this.setContentLineHeightFlag(status)
    });
    this.orientation.onChange().subscribe(() =>
      timer(100).subscribe(() =>
        this.orientationChangedEvent()
      )
    );
  }

  public findQuranPageByPageNumber(pageNumber: number): Promise<any> {
    return new Promise((resolve) => {
      this.quranPageService.findPageContentByPageNumber(pageNumber, this.isAndroid())
        .subscribe(content => {
          this.pageContent = content;
          this.findMetadataByPageNumber(pageNumber).then(val => {
            this.pageContent = QuranPageHelper.surrondEachLineInDiv(this.pageContent, pageNumber);
            resolve();
          });
        });
    });
  }

  private findMetadataByPageNumber(pageNumber: number): Promise<any> {
    return new Promise((resolve) => {
      this.quranPageService.findPageMetadataByPageNumber(pageNumber)
        .subscribe(metas => {
          this.processMetadatas(metas).then(() => {
            this.setGozeAndHezbAndSurahName(metas[0]); //always display first surah name
            resolve();
          });
        });
    });
  }

  private processMetadatas(metas: QuranPageMetadata[]): Promise<any> {
    return new Promise((resolve) => {
      metas.forEach(meta => {
        this.findTafsirByMetadata(meta).then(() => {
          if (this.isLastMetadata(meta, metas)) {
            resolve();
          }
        });
      });
    });
  }

  private isLastMetadata(meta: QuranPageMetadata, metas: QuranPageMetadata[]): boolean {
    if (metas[metas.length - 1].surahNumber === meta.surahNumber) {
      return true;
    }
    return false;
  }

  private findTafsirByMetadata(metadata: QuranPageMetadata): Promise<any> {
    return new Promise((resolve) => {
      this.tafsirService.findTafsirBySurahNumber(metadata.surahNumber)
        .subscribe(tafsirArr => {
          tafsirArr.filter(tafsir => this.isTafsirWithinCurrentPageAyahRange(tafsir, metadata))
            .forEach(tafsir => this.pageContent = QuranPageHelper.patchTafsirOnContent(tafsir, this.pageContent));
          resolve();
        });
    });
  }

  private isTafsirWithinCurrentPageAyahRange(tafsir: Tafsir, metadata: QuranPageMetadata): boolean {
    if (tafsir.ayahNumber >= metadata.fromAyah && tafsir.ayahNumber <= metadata.toAyah) {
      return true;
    }
    return false;
  }

  private setGozeAndHezbAndSurahName(metadata: QuranPageMetadata) {
    this.surahName = this.quranIndexService.surahIndexArr[(metadata.surahNumber - 1)].surahName;
    sessionStorage.setItem(Constants.SURAH_NAME, this.surahName);
    sessionStorage.setItem(Constants.PAGE_NUMBER, this.currentPageNumber.toString());
    this.gozeAndHezb = `الجزء ${metadata.goze} - ${metadata.hezb}`;
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

  public showInfoToast(): void {
    this.infoToast = this.toastCtl.create({
      message: this.getInfoMsg(),
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
    return `${this.surahName} - (${this.gozeAndHezb})`;
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

    this.clearPopover();
    this.dismissInfoToast();

    /*
    this.quranPageService.getLineHeight(this.isAndroid(), this.isPortrait())
      .then(val => {
        this.resizeLineHeight(val);
      })

    this.quranPageService.getFontSize(this.isPortrait())
      .then(val => this.resizeFont(val));
    */
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

    this.quranPageService.saveLineHeight(Number(size), this.isPortrait());
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
    this.quranPageService.getLineHeight(this.isAndroid(), this.isPortrait())
      .then(val => {
        this.resizeLineHeight(val + PROPORTION);
      });
  }

  public decreaseLineHeight(): void {
    this.quranPageService.getLineHeight(this.isAndroid(), this.isPortrait())
      .then(val => {
        this.resizeLineHeight(val - PROPORTION);
      });
  }

  public increaseFont() {
    this.quranPageService.getFontSize(this.isPortrait())
      .then(val => this.resizeFont(val + PROPORTION))
  }

  public decreaseFont() {
    this.quranPageService.getFontSize(this.isPortrait())
      .then(val => this.resizeFont(val - PROPORTION))
  }

  private resizeFont(size: number) {
    size = NumberUtils.toPrecision(size, 3);

    if (!this.isValidFontSize(size)) {
      return;
    }

    this.quranPageService.saveFontSize(size, this.isPortrait());
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
  setContentLineHeightFlag(status: Constants.Status) {
    this.extendLineHeight = (status === Constants.Status.HIDDEN) ?
      true : false;
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