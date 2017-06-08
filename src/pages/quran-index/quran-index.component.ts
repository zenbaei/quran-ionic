import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surahIndex';
import { QuranIndexService } from '../../app/service/quran-index/quranIndex.service';
import * as Constants from '../../app/all/constants';
import { Observable } from 'rxjs';
import { QuranPageComponent } from '../quran-page/quran-page.component';

@Component({
  selector: 'quran-index',
  templateUrl: 'quran-index.html'
})
export class QuranIndexComponent implements OnInit {

  surahIndexes: Observable<SurahIndex[]>;

  constructor(private surahIndexService: QuranIndexService, private navCtrl: NavController) {
  }

  ngOnInit(): void {
    this.surahIndexes = this.surahIndexService.getQuranIndex();
  }

  goToPage(pageNumber: number) {
    console.debug(`Go to page - pageNumber [${pageNumber}]`);
    this.navCtrl.push(QuranPageComponent, {
      pageNumber: pageNumber
    });
  }
}
