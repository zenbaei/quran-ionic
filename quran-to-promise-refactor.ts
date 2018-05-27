import { Component, ViewChild } from '@angular/core';
import { Content } from 'ionic-angular';
import { QuranPageService } from '../../app/service/quran-page/quran-page.service';
import { QuranIndexService } from '../../app/service/quran-index/quran-index.service';
import { Tafsir } from '../../app/domain/tafsir';
import { TafsirService } from '../../app/service/tafsir/tafsir.service';
import { QuranPageMetadata } from '../../app/domain/quran-page-metadata';
import { QuranPageHelper } from './quran.helper';
import { AppUtils } from "../../app/util/app-utils/app-utils";
import { Storage } from '@ionic/storage';
import * as Constants from '../../app/all/constants';
import { TabsPage } from '../tabs/tabs';
import { ToastController } from 'ionic-angular';
import { resolve } from 'path';
import { reject } from 'q';

@Component({
  selector: 'page-quran',
  templateUrl: 'quran.html'
})
export class QuranPage {
  @ViewChild(Content) content: Content;

  private pageContent: string = '';
  private currentPageNumber: number = -1;
  private isTabHidden: boolean = false;
  private gozeAndHezb: string = '';
  readonly MUSHAF_CONTAINER_CLASS = '.mushaf-container';

  constructor(private quranPageService: QuranPageService, private tafsirService: TafsirService,
    private storage: Storage, private quranIndexService: QuranIndexService,
    private toast: ToastController) {
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

  /**
   * Fired whenever the tab is clicked.
   */
  ionSelected() {
    this.showInfo();
    this.resizeFont();
  }

  /**
   * It's executed multiple times whenever the view is manipulated.
   */
  ngAfterViewChecked() {
    if (this.currentPageNumber < 0) {
      return; //async content are not loaded yet
    }
    this.initBootstrapPopover();
    this.setIsTabHidden();
  }

  getSavedPageNumber(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.storage.get(Constants.PAGE_NUMBER).then(val => {
        resolve(val);
      });
    });
  }

  executeWhenDocIsReady() {
    let self = this;
    $(function () {
      self.scrollToTop();
      self.showInfo();
      self.resizeFont();
    });
  }

  setIsTabHidden() {
    if (TabsPage.getTabMarginBottom() === '0px') {
      this.isTabHidden = true;
    } else {
      this.isTabHidden = false;
    }
  }

  scrollToTop() {
    this.content.scrollToTop();
  }

  loadPage(pageNumber: number) {
    this.currentPageNumber = pageNumber;
    this.findQuranPageByPageNumber(pageNumber);
    this.executeWhenDocIsReady();
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

  public findQuranPageByPageNumber(pageNumber: number): void {
    this.quranPageService.findPageContentByPageNumber(pageNumber)
      .subscribe(val => {
        this.findMetadataByPageNumber(pageNumber, val).then(cnt => {
          this.pageContent = cnt;
        });
      });
  }

  private findMetadataByPageNumber(pageNumber: number, rawContent: string): Promise<string> {
    let manipulatedContent: string = rawContent;
    return new Promise((resolve, reject) => {
      this.quranPageService.findPageMetadataByPageNumber(pageNumber)
        .subscribe(metadataArr => {
          metadataArr.forEach(metadata =>
            this.findTafsirByMetadata(metadata, manipulatedContent).then(updatedContent => {
              manipulatedContent = updatedContent;
            })
          );
          resolve(manipulatedContent);
          this.setGozeAndHezbAndSurahName(metadataArr[0]);
        });
    });
  }

  private findTafsirByMetadata(metadata: QuranPageMetadata, rawContent: string): Promise<string> {
    let manipulatedContent: string = '';
    return new Promise((resolve, reject) => {
      this.tafsirService.findTafsirBySurahNumber(metadata.surahNumber)
        .subscribe(tafsirArr => {
          tafsirArr.filter(tafsir => this.isTafsirWithinCurrentPageAyahRange(tafsir, metadata))
            .forEach(tafsir => manipulatedContent = QuranPageHelper.patchTafsirOnContent(tafsir, rawContent));
          QuranPageHelper.surrondEachLineInDiv(manipulatedContent);
          resolve(manipulatedContent);
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
    let surahName: string = this.quranIndexService.surahIndexArr[(metadata.surahNumber - 1)].surahName;
    sessionStorage.setItem(Constants.SURAH_NAME, surahName);
    sessionStorage.setItem(Constants.PAGE_NUMBER, this.currentPageNumber.toString());
    this.gozeAndHezb = `الجزء ${metadata.goze} - ${metadata.hezb}`;
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
    let toast = this.toast.create({
      message: `(${this.gozeAndHezb}) صفحة ${this.currentPageNumber}`,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  resizeFont() {
    let fontSize: string = localStorage.getItem(Constants.QURAN_FONT_SIZE);
    $(this.MUSHAF_CONTAINER_CLASS).css(Constants.CSS_FONT_SIZE, fontSize + 'vw');
  }
}
