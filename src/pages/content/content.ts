import { Component, OnInit } from '@angular/core';
import { NavController, IonicPage, Segment } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surah-index';
import { QuranIndexService } from '../../app/service/quran-index/quran-index.service';
import { Observable } from 'rxjs';
import { QuranPage } from '../quran/quran';

@IonicPage({
  segment: 'content'
})
@Component({
  selector: 'page-content',
  templateUrl: 'content.html'
})
export class ContentPage implements OnInit {

  surahIndexes: Observable<SurahIndex[]>;

  constructor(private surahIndexService: QuranIndexService, private navCtrl: NavController) {
  }

  ngOnInit(): void {
    this.surahIndexes = this.surahIndexService.getQuranIndex();
  }

  goToPage(pageNumber: number) {
    this.navCtrl.push(QuranPage.name, {
      pageNumber: pageNumber
    });
  }
}
