import { Component, ViewChild } from '@angular/core';
import { Content, Toast } from 'ionic-angular';
import { QuranPageService } from '../../app/service/quran-page/quran-page.service';
import { QuranIndexService } from '../../app/service/quran-index/quran-index.service';
import { Tafsir } from '../../app/domain/tafsir';
import { TafsirService } from '../../app/service/tafsir/tafsir.service';
import { QuranPageMetadata } from '../../app/domain/quran-page-metadata';
import { QuranPageHelper } from './quran.helper';
import { AppUtils } from "../../app/util/app-utils/app-utils";
import { Storage } from '@ionic/storage';
import * as Constants from '../../app/all/constants';
import { ToastController } from 'ionic-angular';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-quran',
  templateUrl: 'quran.html'
})
export class QuranPage {
  @ViewChild(Content) content: Content;

  private pageContent: string = '';
  private currentPageNumber: number = -1;
  private extendLineHeight: boolean = false;
  private gozeAndHezb: string = '';
  private surahName: string = '';
  private toast: Toast;
  readonly MUSHAF_CONTAINER_CLASS = '.mushaf-container';

  constructor(private quranPageService: QuranPageService, private tafsirService: TafsirService,
    private storage: Storage, private quranIndexService: QuranIndexService,
    private toastCtl: ToastController, private events: Events) {
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
  ngAfterViewChecked() {
  }

  getSavedPageNumber(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.storage.get(Constants.PAGE_NUMBER).then(val => {
        resolve(val);
      });
    });
  }

  /**
   * It works without using document ready, but it's just a better timing for showing the toast..
   */
  executeWhenDocIsReady() {
    let self = this;
    $(function () {
      self.scrollToTop();
      self.resizeFont();
      self.showInfo();
      self.initBootstrapPopover();
    });
  }

  /**
   * This flag is used in the html to set the corresponding css class.
   */
  setContentLineHeightFlag(status: Constants.TabStatus) {
    if (status === Constants.TabStatus.HIDDEN) {
      this.extendLineHeight = true;
    } else {
      this.extendLineHeight = false;
    }
  }

  scrollToTop() {
    this.content.scrollToTop();
  }

  loadPage(pageNumber: number) {
    this.currentPageNumber = pageNumber;
    this.findQuranPageByPageNumber(pageNumber).then(val => {
      this.executeWhenDocIsReady();
    });
  }

  swipeEvent(event: any) {
    let pgNu: number;

    if (event.direction === 2) {
      pgNu = this.currentPageNumber - 1;
    } else if (event.direction === 4) {
      pgNu = this.currentPageNumber + 1;
    } else {
      return;
    }

    this.savePageNumber(pgNu).then((val) => {
      this.loadPage(val);
    });
  }

  savePageNumber(pageNumber: number): Promise<number> {
    return new Promise((resolve, reject) => {
      if (AppUtils.isValidPageNumber(pageNumber)) {
        this.storage.set(Constants.PAGE_NUMBER, pageNumber).then(val => {
          resolve(pageNumber);
        });
      }
    });
  }

  private subscribeToEvents(): void {
    this.events.subscribe(Constants.EVENT_FONT_CHANGED, () => {
      this.resizeFont();
    });
    this.events.subscribe(Constants.EVENT_TOGGLE_TAB, (status: Constants.TabStatus) => {
      this.setContentLineHeightFlag(status)
    });
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
        .subscribe(metadataArr => {
          metadataArr.forEach(meta => {
            this.findTafsirByMetadata(meta).then(val => {
              if (meta.surahNumber === metadataArr[metadataArr.length - 1].surahNumber) { // last one
                this.setGozeAndHezbAndSurahName(metadataArr[0]); //always display first surah name
                resolve();
              }
            });
          })
        });
    });
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

  showInfo() {
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

  resizeFont() {
    let fontSize: string = localStorage.getItem(Constants.QURAN_FONT_SIZE);
    $(this.MUSHAF_CONTAINER_CLASS).css(Constants.CSS_FONT_SIZE, fontSize + 'vw');
  }
}