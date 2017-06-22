import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { QuranPageService } from '../../app/service/quran-page/quran-page.service';
import { Tafsir } from '../../app/domain/tafsir';
import { TafsirService } from '../../app/service/tafsir/tafsir.service';
import { QuranPageMetadata } from '../../app/domain/quran-page-metadata';
import { Observable } from 'rxjs';

@Component({
  selector: 'quran-page',
  templateUrl: 'quran-page.html'
})
export class QuranPageComponent implements OnInit {

  private PAGE_NUMBER_PARAM: string = 'pageNumber';
  private currentPageNumber: number;
  private pageContent: string;

  constructor(private quranPageService: QuranPageService, private tafsirService: TafsirService, private navCtl: NavController, private navParams: NavParams) {
  }

  ngOnInit() {
    this.findPageContentByPageNumber(this.navParams.get(this.PAGE_NUMBER_PARAM));
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
        // this.findMetadataByPageNumber(pageNumber);
        this.patchTafsirOnContent(null);
      });
  }

  private findMetadataByPageNumber(pageNumber: number): void {
    this.quranPageService.findPageMetadataByPageNumber(pageNumber)
      .subscribe(metadataArr => {
        metadataArr.forEach(metadata => this.findTafsirByMetadata(metadata))
      });
  }

  private findTafsirByMetadata(metadata: QuranPageMetadata): void {
    this.tafsirService.findTafsirBySurahOrder(metadata.surahOrder)
      .subscribe(tafsirArr => {
        tafsirArr.filter(tafsir =>
          tafsir.ayahNumber >= metadata.fromAray || tafsir.ayahNumber <= metadata.toAyah)
          .forEach(tafsir => this.patchTafsirOnContent(tafsir));
      });
  }

  private patchTafsirOnContent(tafsir: Tafsir): void {
    let subString: string = this.pageContent.substr(0, 10);
    let div: string = `<div class="red">${subString}</div>`;
    this.pageContent = div + this.pageContent;
  }

}