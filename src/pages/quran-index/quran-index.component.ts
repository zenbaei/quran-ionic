import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surahIndex';
import { SurahIndexService } from '../../app/service/surah-index/surahIndex.service';

@Component({
  selector: 'quran-index',
  templateUrl: 'quran-index.html'
})
export class QuranIndexComponent implements OnInit {

  surahIndex: SurahIndex[];

  // public navCtrl: NavController
  constructor() {
  }

  ngOnInit(): void {
    /*
    this.surahIndexService.getQuranIndex().then(surahIdxArr => {
      this.surahIndex = surahIdxArr;
    });
    */
  }
}
