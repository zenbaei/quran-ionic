import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surahIndex';

@Component({
  selector: 'quran-index',
  templateUrl: 'quran-index.html'
})
export class QuranIndexComponent {

  surahIndex: SurahIndex[];
  
  // public navCtrl: NavController
  constructor() {
  }


}
