import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { QuranPageService } from '../../app/service/quran-page/quran-page.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'quran-page',
  templateUrl: 'quran-page.html'
})
export class QuranPageComponent implements OnInit {

  private PAGE_NUMBER_PARAM: string = 'pageNumber';
  private currentPageNumber: number;
  pageContent: string;

  constructor(private quranPageService: QuranPageService, private navCtl: NavController, private navParams: NavParams) {
  }

  ngOnInit() {
    this.fetchPageContent(this.navParams.get(this.PAGE_NUMBER_PARAM));
  }

  fetchPageContent(pageNumber: number) {
    this.quranPageService.fetchPageContent(pageNumber)
      .subscribe(content => {
        this.pageContent = content;
        this.currentPageNumber = pageNumber;
      });
  }

  swipeEvent(e) {
    if (e.direction == 2) { // right to left - previous
      console.debug('swipe event - previous page');
      this.fetchPageContent(this.currentPageNumber - 1);
    } else if (e.direction == 4) {
      console.debug('swipe event - next page');
      this.fetchPageContent(this.currentPageNumber + 1);
    }
  }

}