import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surahIndex';

@Component({
  selector: 'surah-index',
  templateUrl: 'surah-index.html'
})
export class SurahIndexComponent {

  surahIndex: SurahIndex[];
  
  // public navCtrl: NavController
  constructor() {
  }


}
