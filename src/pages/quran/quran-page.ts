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
  private toast: Toast;

  constructor(private quranPageService: QuranService, private tafsirService: TafsirService,
    private quranIndexService: IndexService, private toastCtl: ToastController,
    private events: Events, private orientation: ScreenOrientation,
    private platform: Platform) {
    this.subscribeToEvents();
  }

  ionViewDidLoad() {
    this.resizeOnStartUp();
  }

  /**
   * Called every time the view is rendered (navigated to from another page)
   * use case; when selecting surah from content page and on opening application.
   */
  ionViewDidEnter() {
    this.quranPageService.getPageNumber().then(val => {
      if (val === null) {
        this.loadPage(1);
      } else {
        this.loadPage(val);
      }
    });
  }

  ionViewWillLeave() {
    this.dismissToast();
  }

  /**
   * Fired whenever the tab is reclicked without being on another tab.
   */
  ionSelected() {
    this.showInfo();
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
      self.showInfo();
      self.initBootstrapPopover();
    });
  }

  private scrollToTop() {
    this.content.scrollToTop();
  }

  private resizeOnStartUp() {
    this.quranPageService.getLineHeight(this.isAndroid(), this.isPortrait())
      .then(val => {
        this.resizeLineHeight(val);
      });

    this.quranPageService.getFontSize(this.isPortrait())
      .then(val => {
        this.resizeFont(val);
      })
  }

  private loadPage(pageNumber: number) {
    this.currentPageNumber = pageNumber;
    this.findQuranPageByPageNumber(pageNumber).then(val => {
      this.executeWhenDocIsReady();
    });
  }

  public swipeEvent(event: any): void {
    let pageNumber: number = this.calculatePageNumber(event);

    if (pageNumber === -1) {
      return;
    }

    if (QuranService.isValidPageNumber(pageNumber)) {
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
    this.orientation.onChange().subscribe(() =>
      this.orientationChangedEvent()
    );
  }

  public findQuranPageByPageNumber(pageNumber: number): Promise<any> {
    return new Promise((resolve) => {
      this.quranPageService.findPageContentByPageNumber(pageNumber)
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
    this.gozeAndHezb = `الجـزء ${metadata.goze} - ${metadata.hezb.replace('الحزب', 'الحـزب')}`;
  }

  /**
   * It has an advantage over the ionic popover in that the popover position comes on top
   * of the span rather that in a static position as ionic popover
   */
  initBootstrapPopover() {
    let tafsirAnchors: JQuery<HTMLElement> = $('[data-toggle="popover"]');
    if (tafsirAnchors.length === 0) { // content not displayed yet
      return;
    }
    tafsirAnchors.popover();
  }

  public showInfo(): void {
    this.dismissToast();
    this.toast = this.toastCtl.create({
      message: this.getToastMsg(),
      duration: 3000,
      position: 'middle'
    });
    this.toast.present();
  }

  private dismissToast() {
    if (this.toast != null) {
      this.toast.subscribe(() => {
        this.toast.dismiss();
      });
    }
  }

  private getToastMsg(): string {
    return `ســــــورة ${this.surahName} - (${this.gozeAndHezb})${NEW_LINE}` +
      `${this.platform.is(Constants.PLATFORM_ANDROID) ? '' : '  '}`;
  }

  private fontChangedEvent(operator: Operator) {
    operator === Operator.INC ? this.increaseFont() :
      this.decreaseFont();
  }

  private lineHeightChangedEvent(operator: Operator) {
    operator === Operator.INC ? this.increaseLineHeight() :
      this.decreaseLineHeight();
  }

  private orientationChangedEvent() {
    this.quranPageService.getLineHeight(this.isAndroid(), this.isPortrait())
      .then(val => {
        this.resizeLineHeight(val);
      })

    this.quranPageService.getFontSize(this.isPortrait())
      .then(val => this.resizeFont(val));
  }

  /**
  * Set line heights for both orientation in order to be available 
  * @param lineHeight 
  */
  private resizeLineHeight(size: number) {
    size = NumberUtils.toPrecision(size, 3);

    if (!this.isValidLineHeight(size)) {
      return;
    }

    this.quranPageService.saveLineHeight(Number(size), this.isAndroid(), this.isPortrait());
    this.setLineHeightStyle(size);
  }

  private isValidLineHeight(size: number): boolean {
    console.debug(`Is valid line height: ${size}`);
    if ((this.isPortrait() &&
      NumberUtils.isBetween(size, this.getMinPortraitPlatformLineHeightSize(),
        this.getMaxPortraitPlatformLineHeightSize())) ||
      (!this.isPortrait() &&
        NumberUtils.isBetween(size, this.getMinLandscapePlatformLineHeightSize(),
          this.getMaxLandscapePlatformLineHeightSize()))) {
      return true;
    }
    return false;
  }

  private setLineHeightStyle(size: number) {
    console.debug(`Set line height style: ${size}`);
    $(PAGE_SELECTOR_CLASS).css(Constants.CSS_LINE_HEIGHT, size + LINE_HEIGHT_UNIT);
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
    $(MUSHAF_CONTAINER_CLASS).css(Constants.CSS_FONT_SIZE, size + FONT_UNIT);
  }

  private isValidFontSize(size: number): boolean {
    return NumberUtils.isBetween(size, MIN_QURAN_FONT_SIZE, MAX_QURAN_FONT_SIZE);
  }

  private getMinPortraitPlatformLineHeightSize(): number {
    return this.isAndroid() ?
      PORTRAIT_MIN_LINE_HEIGHT_SIZE_ANDROID :
      PORTRAIT_MIN_LINE_HEIGHT_SIZE_IOS;
  }

  private getMinLandscapePlatformLineHeightSize(): number {
    return this.isAndroid() ?
      LANDSCAPE_MIN_LINE_HEIGHT_SIZE_ANDROID :
      LANDSCAPE_MIN_LINE_HEIGHT_SIZE_IOS;
  }

  private getMaxPortraitPlatformLineHeightSize(): number {
    return this.isAndroid() ?
      PORTRAIT_MAX_LINE_HEIGHT_SIZE_ANDROID :
      PORTRAIT_MAX_LINE_HEIGHT_SIZE_IOS;
  }

  private getMaxLandscapePlatformLineHeightSize(): number {
    return this.isAndroid() ?
      LANDSCAPE_MAX_LINE_HEIGHT_SIZE_ANDROID :
      LANDSCAPE_MAX_LINE_HEIGHT_SIZE_IOS;
  }

  private isPortrait(): boolean {
    return AppUtils.isPortrait(this.orientation);
  }

  private isAndroid(): boolean {
    return this.platform.is(Constants.PLATFORM_ANDROID);
  }
}

const MUSHAF_CONTAINER_CLASS = '.mushaf-container';
const PAGE_SELECTOR_CLASS = 'page-quran';
const PROPORTION: number = 0.1;

const LINE_HEIGHT_UNIT: string = 'vh';
const FONT_UNIT: string = 'vw';
const NEW_LINE = '\n';

const PORTRAIT_MIN_LINE_HEIGHT_SIZE_ANDROID: number = 3;
const PORTRAIT_MAX_LINE_HEIGHT_SIZE_ANDROID: number = 10;

const LANDSCAPE_MIN_LINE_HEIGHT_SIZE_ANDROID: number = 10;
const LANDSCAPE_MAX_LINE_HEIGHT_SIZE_ANDROID: number = 32;

const PORTRAIT_MIN_LINE_HEIGHT_SIZE_IOS: number = 1;
const PORTRAIT_MAX_LINE_HEIGHT_SIZE_IOS: number = 8;

const LANDSCAPE_MIN_LINE_HEIGHT_SIZE_IOS: number = 5;
const LANDSCAPE_MAX_LINE_HEIGHT_SIZE_IOS: number = 20;

const MIN_QURAN_FONT_SIZE: number = 1;
const MAX_QURAN_FONT_SIZE: number = 7;
