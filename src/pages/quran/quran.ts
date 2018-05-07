import { Component, OnInit, ViewChild, ElementRef, } from '@angular/core';
import { NavController, NavParams, PopoverController, IonicPage } from 'ionic-angular';
import { QuranPageService } from '../../app/service/quran-page/quran-page.service';
import { Tafsir } from '../../app/domain/tafsir';
import { TafsirService } from '../../app/service/tafsir/tafsir.service';
import { QuranPageMetadata } from '../../app/domain/quran-page-metadata';
import { Observable } from 'rxjs';
import { ArabicUtils } from "../../app/util/arabic-utils/arabic-utils";
import { Search } from "../../app/util/search-utils/search";
import { StringUtils } from "../../app/util/string-utils/string-utils";
import { QuranPageHelper } from './quran.helper';
import { ContentPage } from '../content/content';
//import * as $ from 'jquery'; // it causes popover to throw error becoz of jquery lib conflicts
import * as bootstrap from 'bootstrap';
import { TafsirPopoverPage } from '../tafsir-popover/tafsir-popover';
import { AppUtils } from "../../app/util/app-utils/app-utils";


@IonicPage({
  segment: 'quran/:pageNumber',
  defaultHistory: ['ContentPage']
})

@Component({
  selector: 'page-quran',
  templateUrl: 'quran.html'
})
export class QuranPage implements OnInit {

  private readonly PAGE_NUMBER_PARAM: string = 'pageNumber';
  public pageContent: string;
  public current_page_number: number = 0;

  constructor(private quranPageService: QuranPageService, private tafsirService: TafsirService,
    private navCtl: NavController, private navParams: NavParams, private popoverCtrl: PopoverController) {
  }

  ngOnInit() {
    let pageNumber: number = Number(this.navParams.get(this.PAGE_NUMBER_PARAM));
    if (!pageNumber) { // when editing the url by hand with wrong entry like; /quran/sfd
      this.navCtl.push(ContentPage.name);
      return;
    }
    this.current_page_number = pageNumber;
    this.findQuranPageByPageNumber(pageNumber);
  }

  ngAfterViewChecked() {
    this.initBootstrapPopover();
  }

  swipeEvent(event: any) {
    let pageNumber: number = Number(this.navParams.get(this.PAGE_NUMBER_PARAM));
    
    if (event.direction === 2) {
      this.navigateToQuranPage(pageNumber - 1);
    } else if (event.direction === 4) {
      this.navigateToQuranPage(pageNumber + 1);
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
        metadataArr.forEach(metadata => this.findTafsirByMetadata(metadata))
      });
  }

  /*
  * ngOnInit will be called after pushing the page.
  */
  private navigateToQuranPage(pageNumber: number): void {
    if (!AppUtils.isValidPageNumber(pageNumber)) {
      return;
    }
    this.navCtl.pop();
    this.navCtl.push(QuranPage.name, {
      'pageNumber': pageNumber
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
    let div: JQuery<HTMLElement> = $('.mushaf-content');
  }

}