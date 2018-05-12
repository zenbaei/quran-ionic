import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { QuranPageService } from '../../app/service/quran-page/quran-page.service';
import { QuranIndexService } from '../../app/service/quran-index/quran-index.service';
import { Tafsir } from '../../app/domain/tafsir';
import { TafsirService } from '../../app/service/tafsir/tafsir.service';
import { QuranPageMetadata } from '../../app/domain/quran-page-metadata';
import { QuranPageHelper } from './quran.helper';
import { AppUtils } from "../../app/util/app-utils/app-utils";
import { Storage } from '@ionic/storage';
import * as Constants from '../../app/all/constants';
import { ArabicUtils } from '../../app/util/arabic-utils/arabic-utils';

@Component({
  selector: 'page-quran',
  templateUrl: 'quran.html'
})
export class QuranPage {

  private pageContent: string;
  private currentPageNumber: number = -1;

  constructor(private quranPageService: QuranPageService, private tafsirService: TafsirService,
    private storage: Storage, private navParams: NavParams, private quranIndexService: QuranIndexService) {
  }

  /**
   * Called every time the view is rendered (navigated to from another page)
   * use case; when selecting surah from content page and on opening application.
   */
  ionViewDidEnter() {
    this.getPageNumberFromStorageAndLoad();
  }

  /**
   * This will be called after reselecting(re-tap or re-click) Quran tab from tabs page.
   * use case; after using go-to-popover.
   */
  ionSelected(){
    this.getPageNumberFromStorageAndLoad();
  }

  getPageNumberFromStorageAndLoad() {
    this.storage.get(Constants.PAGE_NUMBER_PARAM).then(val => {
      if (val === null) {
        this.loadPage(1);
      } else {
        this.loadPage(val);
      }
    });
  }

  ngAfterViewChecked() {
    // had to do this check to avoid calling before the view is rendered
    // also when added to ionViewDidEnter, it's called before rendering the view
    if (this.currentPageNumber > 0) { // means it has been set by loadPage
      this.initBootstrapPopover();
    }
  }

  loadPage(pageNumber: number) {
    if (!AppUtils.isValidPageNumber(pageNumber)) {
      return;
    }
    this.storage.set(Constants.PAGE_NUMBER_PARAM, pageNumber).then(val => {
      this.currentPageNumber = pageNumber;
      this.findQuranPageByPageNumber(pageNumber);
    });
  }

  swipeEvent(event: any) {
    if (event.direction === 2) {
      this.loadPage(this.currentPageNumber - 1);
    } else if (event.direction === 4) {
      this.loadPage(this.currentPageNumber + 1);
    }
  }

  public findQuranPageByPageNumber(pageNumber: number): void {
    this.quranPageService.findPageContentByPageNumber(pageNumber)
      .subscribe(content => {
        this.pageContent = content;
        this.findMetadataByPageNumber(pageNumber);
      });
  }

  private findMetadataByPageNumber(pageNumber: number): void {
    this.quranPageService.findPageMetadataByPageNumber(pageNumber)
      .subscribe(metadataArr => {
        metadataArr.forEach(metadata => this.findTafsirByMetadata(metadata));
        this.setGozeAndHezbAndSurahName(metadataArr[0]);
      });
  }

  private findTafsirByMetadata(metadata: QuranPageMetadata): void {
    this.tafsirService.findTafsirBySurahNumber(metadata.surahNumber)
      .subscribe(tafsirArr => {
        tafsirArr.filter(tafsir => this.isTafsirWithinCurrentPageAyahRange(tafsir, metadata))
          .forEach(tafsir => this.pageContent = QuranPageHelper.patchTafsirOnContent(tafsir, this.pageContent));
        this.pageContent = QuranPageHelper.surrondEachLineInDiv(this.pageContent);
      });
  }

  private isTafsirWithinCurrentPageAyahRange(tafsir: Tafsir, metadata: QuranPageMetadata): boolean {
    if (tafsir.ayahNumber >= metadata.fromAyah && tafsir.ayahNumber <= metadata.toAyah) {
      return true;
    }
    return false;
  }

  private setGozeAndHezbAndSurahName(metadata: QuranPageMetadata) {
    sessionStorage.setItem(Constants.GOZE, ArabicUtils.toArabicNumber(metadata.goze));
    sessionStorage.setItem(Constants.SURAH_NAME, this.quranIndexService.surahIndexArr[(metadata.surahNumber - 1)].surahName);  
    this.setAndConvertHezbNumberToArabic(metadata);
  }

  private setAndConvertHezbNumberToArabic(metadata: QuranPageMetadata) {
    let enNum: string = metadata.hezb.substring(metadata.hezb.length - 2).trim();
    let arNum: string = ArabicUtils.toArabicNumber(Number(enNum));
    let hezb: string = metadata.hezb.substring(0, metadata.hezb.length - 2).trim();
    sessionStorage.setItem(Constants.HEZB, `${hezb} ${arNum}`);
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

  public writeHtmlToFile(): void {
    let tafsirAnchors: JQuery<HTMLElement> = $('[data-toggle="popover"]');
    if (tafsirAnchors.length === 0) { // content not displayed yet
      return;
    }
    //let div: JQuery<HTMLElement> = $('.mushaf-content');
  }

}