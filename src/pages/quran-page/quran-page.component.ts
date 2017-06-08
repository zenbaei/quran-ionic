import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { QuranPageService } from '../../app/service/quran-page/quranPage.service';
import * as Constants from '../../app/all/constants';
import { Observable } from 'rxjs';

@Component({
  selector: 'quran-page',
  templateUrl: 'quran-page.html'
})
export class QuranPageComponent implements OnInit {

  private PAGE_NUMBER_PARAM: string = 'pageNumber';
  pageContent: Observable<string>;

  constructor(private quranPageService: QuranPageService, private navCtl: NavController, private navParams: NavParams) {   
  }

  ngOnInit() {
    this.fetchPageContent();
  }

  private fetchPageContent() {
    let pageNumber: number = this.navParams.get(this.PAGE_NUMBER_PARAM);
    this.pageContent = this.quranPageService.fetchPageContent(pageNumber);
  }

}