import { Component, ViewChild } from '@angular/core';
import { Content, Toast } from 'ionic-angular';
import { QuranPageService } from '../../app/service/quran-page/quran-page.service';
import { QuranIndexService } from '../../app/service/quran-index/quran-index.service';
import { Tafsir } from '../../app/domain/tafsir';
import { TafsirService } from '../../app/service/tafsir/tafsir.service';
import { QuranPageMetadata } from '../../app/domain/quran-page-metadata';
import { QuranPageHelper } from './quran.helper';
import { AppUtils } from "../../app/util/app-utils/app-utils";
import { NumberUtils } from "../../app/util/number-utils/number-utils";
import { Storage } from '@ionic/storage';
import * as Constants from '../../app/all/constants';
import { ToastController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Operator } from '../../app/all/constants';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
//declare var $: JQueryStatic;

@Component({
  selector: 'page-quran',
  templateUrl: 'quran.html'
})
export class QuranPage {

  @ViewChild(Content) content: Content;
  private pageContent: string = '';
  private currentPageNumber: number = -1;
  private gozeAndHezb: string = '';
  private surahName: string = '';
  private toast: Toast;
  private firstRun: boolean = true;

  constructor(private quranPageService: QuranPageService, private tafsirService: TafsirService,
    private storage: Storage, private quranIndexService: QuranIndexService,
    private toastCtl: ToastController, private events: Events, private orientation: ScreenOrientation) {
    this.subscribeToEvents();
  }

  /**
   * Called every time the view is rendered (navigated to from another page)
   * use case; when selecting surah from content page and on opening application.
   */
  ionViewDidEnter() {
    this.getSavedPageNumber().then(val => {
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

  private getSavedPageNumber(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.storage.get(Constants.PAGE_NUMBER).then(val => {
        resolve(val);
      });
    });
  }

  /**
   * It works without using document ready, but it's just a better timing for showing the toast..
   */
  private executeWhenDocIsReady() {
    let self = this;
    $(function () {
      self.scrollToTop();
      self.firstTimeRun();
      self.showInfo();
      self.initBootstrapPopover();
    });
  }

  private scrollToTop() {
    this.content.scrollToTop();
  }

  /**
   * A workaround as the lifecycle hooks either run before view is rendered or called multiple times
   */
  private firstTimeRun() {
    if (!this.firstRun) {
      return;
    }
    this.resizeLineHeight(this.getSavedLineHeight());
    this.resizeFont(this.getSavedFontSize());
    this.firstRun = false;
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

    this.savePageNumber(pageNumber).then((val) => {
      this.loadPage(val);
    });
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

  private savePageNumber(pageNumber: number): Promise<number> {
    return new Promise((resolve, reject) => {
      if (AppUtils.isValidPageNumber(pageNumber)) {
        this.storage.set(Constants.PAGE_NUMBER, pageNumber).then(val => {
          resolve(pageNumber);
        });
      }
    });
  }

  private subscribeToEvents(): void {
    this.events.subscribe(Constants.EVENT_FONT_CHANGED, (operator: Operator) => {
      this.fontChangedEvent(operator);
    });
    /*
    this.events.subscribe(Constants.EVENT_TOGGLE_TAB, (status: Status) => {
      this.toggleTabEvent(status);
    });
    */
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
            this.pageContent = QuranPageHelper.surrondEachLineInDiv(this.pageContent);
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
      message: `ســــــورة ${this.surahName} - (${this.gozeAndHezb})\nصــــــفحة ${this.currentPageNumber}`,
      duration: 3000,
      position: 'middle'
    });
    this.toast.present();
  }

  private dismissToast() {
    if (this.toast != null) {
      this.toast.dismiss();
    }
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
    this.resizeLineHeight(this.getSavedLineHeight());
    this.resizeFont(this.getSavedFontSize());
  }

  /*
  private toggleTabEvent(status: Status) {
    console.debug(`Toggle tab event: ${status}`);
    if (!AppUtils.isPortrait(this.orientation)) {
      return;
    }

    let savedLineHeight = this.getSavedLineHeight();
    let size: number = (status === Status.HIDDEN) ?
      savedLineHeight + TAB_BAR_HEIGHT_PROPORTION :
      savedLineHeight - TAB_BAR_HEIGHT_PROPORTION;

    this.resizeLineHeight(size);
  }
  */

  /**
  * Set line heights for both orientation in order to be available 
  * @param lineHeight 
  */
  private resizeLineHeight(size: number) {
    size = NumberUtils.toPrecision(size, 3);

    if (!this.isValidLineHeight(size)) {
      return;
    }

    this.saveLineHeight(Number(size));
    this.setLineHeightStyle(size);
  }

  private isValidLineHeight(size: number): boolean {
    console.debug(`Is valid line height: ${size}`);
    if (AppUtils.isPortrait(this.orientation) &&
      NumberUtils.isBetween(size, PORTRAIT_MIN_LINE_HEIGHT_SIZE, PORTRAIT_MAX_LINE_HEIGHT_SIZE) ||
      !AppUtils.isPortrait(this.orientation) &&
      NumberUtils.isBetween(size, LANDSCAPE_MIN_LINE_HEIGHT_SIZE, LANDSCAPE_MAX_LINE_HEIGHT_SIZE)) {
      return true;
    }
    return false;
  }

  private saveLineHeight(size: number): void {
    localStorage.setItem(this.getLineHeightKeyBasedOnOrientation(), size.toString());
  }

  private getSavedLineHeight(): number {
    let size: string =
      localStorage.getItem(this.getLineHeightKeyBasedOnOrientation());

    if (size == null) {
      return this.getDefaultLineHeight();
    }

    return Number(size);
  }

  private setLineHeightStyle(size: number) {
    console.debug(`Set line height style: ${size}`);
    $(PAGE_SELECTOR_CLASS).css(Constants.CSS_LINE_HEIGHT, size + LINE_HEIGHT_UNIT);
  }

  private getDefaultLineHeight(): number {
    console.debug('Get default line height');
    return AppUtils.isPortrait(this.orientation) ?
      DEFAULT_PORTRAIT_LINE_HEIGHT_SIZE :
      DEFAULT_LANDSCAPE_LINE_HEIGHT_SIZE;
  }

  private getLineHeightKeyBasedOnOrientation(): string {
    return AppUtils.isPortrait(this.orientation) ?
      PORTRAIT_LINE_HEIGHT_KEY :
      LANDSCAPE_LINE_HEIGHT_KEY;
  }

  public increaseLineHeight(): void {
    this.resizeLineHeight(this.getSavedLineHeight() + PROPORTION);
  }

  public decreaseLineHeight(): void {
    this.resizeLineHeight(this.getSavedLineHeight() - PROPORTION);
  }

  public increaseFont() {
    this.resizeFont(this.getSavedFontSize() + PROPORTION);
  }

  public decreaseFont() {
    this.resizeFont(this.getSavedFontSize() - PROPORTION);
  }

  private resizeFont(size: number) {
    size = NumberUtils.toPrecision(size, 3);

    if (!this.isValidFontSize(size)) {
      return;
    }

    this.saveFontSize(size);
    this.setFontSizeStyle(size);
  }

  private isValidFontSize(size: number): boolean {
    return NumberUtils.isBetween(size, MIN_QURAN_FONT_SIZE, MAX_QURAN_FONT_SIZE);
  }

  private saveFontSize(size: number) {
    console.debug(`save font size ${size}`);
    localStorage.setItem(this.getFontKeyBasedOnOrientation(), size.toString());
  }

  private getSavedFontSize(): number {
    let size: string =
      localStorage.getItem(this.getFontKeyBasedOnOrientation());
    if (size == null) {
      return DEFAULT_QURAN_FONT_SIZE;
    }
    return Number(size);
  }

  private getFontKeyBasedOnOrientation(): string {
    return AppUtils.isPortrait(this.orientation) ?
      Constants.PORTRAIT_QURAN_FONT_SIZE :
      Constants.LANDSCAPE_QURAN_FONT_SIZE;
  }

  private setFontSizeStyle(size: number) {
    $(MUSHAF_CONTAINER_CLASS).css(Constants.CSS_FONT_SIZE, size + FONT_UNIT);
  }
}

const MUSHAF_CONTAINER_CLASS = '.mushaf-container';
const PAGE_SELECTOR_CLASS = 'page-quran';
const PROPORTION: number = 0.1;
//const TAB_BAR_HEIGHT_PROPORTION: number = 0.6;
const PORTRAIT_LINE_HEIGHT_KEY: string = 'portraitLineHeightKey';
const LANDSCAPE_LINE_HEIGHT_KEY: string = 'landscapeLineHeightKey';
const LINE_HEIGHT_UNIT: string = 'vh';
const FONT_UNIT: string = 'vw';

const DEFAULT_PORTRAIT_LINE_HEIGHT_SIZE: number = 5.7;
const PORTRAIT_MIN_LINE_HEIGHT_SIZE: number = 3;
const PORTRAIT_MAX_LINE_HEIGHT_SIZE: number = 10;

const DEFAULT_LANDSCAPE_LINE_HEIGHT_SIZE: number = 17;
const LANDSCAPE_MIN_LINE_HEIGHT_SIZE: number = 10;
const LANDSCAPE_MAX_LINE_HEIGHT_SIZE: number = 32;

const DEFAULT_QURAN_FONT_SIZE: number = 3.7;
const MIN_QURAN_FONT_SIZE: number = 1;
const MAX_QURAN_FONT_SIZE: number = 7;


