import { Component, OnInit } from '@angular/core';
import { NavParams, IonicPage } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surah-index';
import { QuranIndexService } from '../../app/service/quran-index/quran-index.service';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import * as Constants from '../../app/all/constants';

@IonicPage()
@Component({
  selector: 'page-content',
  templateUrl: 'content.html'
})
export class ContentPage implements OnInit {
  surahIndexes: Observable<SurahIndex[]>;

  constructor(private surahIndexService: QuranIndexService, private navParams: NavParams,
    private storage: Storage) {
  }

  ngOnInit(): void {
    this.surahIndexes = this.surahIndexService.surahIndexArray;
  }

  goToPage(pageNumber: number) {
    this.storage.set(Constants.PAGE_NUMBER, pageNumber).then(val => {
      this.navParams.data.mushafTabs.select(0);
    });
  }
}
