import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';
import { QuranPageService } from '../../app/service/quran-page/quran-page.service';
import { Tafsir } from '../../app/domain/tafsir';
import { TafsirService } from '../../app/service/tafsir/tafsir.service';
import { QuranPageMetadata } from '../../app/domain/quran-page-metadata';
import { Observable } from 'rxjs';
import { ArabicUtils } from "../../app/util/arabic-utils/arabic-utils";
import { Search } from "../../app/util/search-utils/search";
import { StringUtils } from "../../app/util/string-utils/string-utils";
import { QuranPageComponentHelper } from './quran-page.component.helper';
//import * as $ from 'jquery'; // it causes popover to throw error becoz of jquery lib conflicts
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'quran-page',
  templateUrl: 'quran-page.html'
})
export class QuranPageComponent implements OnInit {

  private readonly PAGE_NUMBER_PARAM: string = 'pageNumber';
  private currentPageNumber: number;
  private pageContent: string;
  private popoverElementsInitialized: boolean = false;

  constructor(private quranPageService: QuranPageService, private tafsirService: TafsirService,
    private navCtl: NavController, private navParams: NavParams) {
  }

  ngOnInit() {
    this.findPageContentByPageNumber(this.navParams.get(this.PAGE_NUMBER_PARAM));
  }

  ngAfterViewChecked() {
    if (!this.popoverElementsInitialized) {
      this.initPopoverElements();
    }
  }

  swipeEvent(event: any) {
    if (event.direction == 2) { // right to left - previous
      console.debug('swipe event - previous page');
      this.findPageContentByPageNumber(this.currentPageNumber - 1);
    } else if (event.direction == 4) {
      console.debug('swipe event - next page');
      this.findPageContentByPageNumber(this.currentPageNumber + 1);
    }
  }

  private findPageContentByPageNumber(pageNumber: number): void {
    this.quranPageService.findPageContentByPageNumber(pageNumber)
      .subscribe(content => {
        this.pageContent = content;
        this.currentPageNumber = pageNumber;
        this.findMetadataByPageNumber(pageNumber);
      });
  }

  private findMetadataByPageNumber(pageNumber: number): void {
    this.quranPageService.findPageMetadataByPageNumber(pageNumber)
      .subscribe(metadataArr => {
        metadataArr.forEach(metadata => this.findTafsirByMetadata(metadata))
      });
  }

  private findTafsirByMetadata(metadata: QuranPageMetadata): void {
    this.tafsirService.findTafsirBySurahNumber(metadata.surahNumber)
      .subscribe(tafsirArr => {
        tafsirArr.filter(tafsir => this.isTafsirWithinCurrentPageAyahRange(tafsir, metadata))
          .forEach( tafsir => this.pageContent = QuranPageComponentHelper.patchTafsirOnContent(tafsir, this.pageContent) );
      });
  }

  private isTafsirWithinCurrentPageAyahRange(tafsir: Tafsir, metadata: QuranPageMetadata): boolean {
    if (tafsir.ayahNumber >= metadata.fromAray || tafsir.ayahNumber <= metadata.toAyah) {
      return true;
    }
    return false;
  }

  private initPopoverElements(): void {
    let popoverEl: JQuery<HTMLElement> = $('[data-toggle="popover"]');
    if (popoverEl.length === 0) {
      return;
    }
    console.debug('Initialize bootstrap popover elements');
    popoverEl.popover();
    this.popoverElementsInitialized = true;
  }

}