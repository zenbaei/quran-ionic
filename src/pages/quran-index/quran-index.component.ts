import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surahIndex';
import { SurahIndexService } from '../../app/service/surah-index/surahIndex.service';
import * as Constants from '../../app/all/constants';
import { FileReader } from '../../app/core/io/file/FileReader';

@Component({
  selector: 'quran-index',
  templateUrl: 'quran-index.html'
})
export class QuranIndexComponent implements OnInit {

  surahIndexes: Promise<SurahIndex[]>;

  // public navCtrl: NavController
  constructor(private surahIndexService: SurahIndexService) {
  }

  ngOnInit(): void {
    this.surahIndexes = this.surahIndexService.getQuranIndex();
  }
}
