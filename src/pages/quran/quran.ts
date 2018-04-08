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
import { QuranPageHelper } from './quran.helper';
//import * as $ from 'jquery'; // it causes popover to throw error becoz of jquery lib conflicts
import * as bootstrap from 'bootstrap';
import { TafsirPopoverPage } from '../tafsir-popover/tafsir-popover';
import fstream from 'fstream';

@Component({
  selector: 'page-quran',
  templateUrl: 'quran.html'
})
export class QuranPage implements OnInit {

  private readonly PAGE_NUMBER_PARAM: string = 'pageNumber';
  private currentPageNumber: number;
  public pageContent: string;
  private popoverElementsInitializedOnPageNo: number; 
  private readonly FIRST_PAGE = 1;
  private readonly LAST_PAGE = 604;

  constructor(private quranPageService: QuranPageService, private tafsirService: TafsirService,
    private navCtl: NavController, private navParams: NavParams, private popoverCtrl: PopoverController) {
  }

  ngOnInit() {
    this.findQuranPageByPageNumber(this.navParams.get(this.PAGE_NUMBER_PARAM));
  }

  ngAfterViewChecked() {
    console.log('view checked:' + this.popoverElementsInitializedOnPageNo);
    // all this condition because this ngAfterViewChecked does load multiple time on same page
    if (!this.popoverElementsInitializedOnPageNo || this.currentPageNumber !== this.popoverElementsInitializedOnPageNo) {
      this.initPopoverElements();
      this.writeHtmlToFile();
    }
  }

  swipeEvent(event: any) {
    let goToPage: number;

    if (event.direction === 2) {
      console.debug('swipe event - previous page in arabic');
      if (this.currentPageNumber === this.FIRST_PAGE) {
        return;
      }
      goToPage = this.currentPageNumber - 1;
    } else if (event.direction === 4) {
      console.debug('swipe event - next page in arabic');
      if (this.currentPageNumber === this.LAST_PAGE) {
        return;
      }
      goToPage = this.currentPageNumber + 1;
    } else { //direction unidentified
      return;
    }

    this.findQuranPageByPageNumber(goToPage);
  }

  public findQuranPageByPageNumber(pageNumber: number): void {
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
          .forEach( tafsir => this.pageContent = QuranPageHelper.patchTafsirOnContent(tafsir, this.pageContent) );
          this.pageContent = QuranPageHelper.surrondEachLineInDiv(this.pageContent);
      });
  }

  private isTafsirWithinCurrentPageAyahRange(tafsir: Tafsir, metadata: QuranPageMetadata): boolean {
    if (tafsir.ayahNumber >= metadata.fromAyah && tafsir.ayahNumber <= metadata.toAyah) {
      return true;
    }
    return false;
  }

  
  /**
   * The javascript click event if attached to the the innerHtml it won't fire.
   * Therefore I have to set the event dynamically.
   */
  private initPopoverElements(): void {
    this.initBootstrapPopover();
  }

  initIonicPopover() {
    let tafsirAnchors: JQuery<HTMLElement> = $('.tafsir');
    var self = this;
    tafsirAnchors.each(function () {
      $(this).on("click", function () {
        let popover = self.popoverCtrl.create(TafsirPopoverPage, {
          el: this
        });
        popover.present();
      })
    });
    this.popoverElementsInitializedOnPageNo = this.currentPageNumber; // don't move in the common method
  }

  /**
   * It has an advantage over the ionic popover in that the popover position comes on top
   * of the span rather that in a static position as ionic popover
   */
  initBootstrapPopover() {
    let tafsirAnchors: JQuery<HTMLElement> = $('[data-toggle="popover"]');

    if (tafsirAnchors.length === 0) {
      return;
    }

    tafsirAnchors.popover();
    this.popoverElementsInitializedOnPageNo = this.currentPageNumber; // don't move in the common method
  }

  writeHtmlToFile() {
    let div: JQuery<HTMLElement> = $('.mushaf-content');
    //fsconsole.log(div.html());
    fstream
    .Writer({ path: "tmp/test"})
    .write("hello\n")
    .end();
  }
}