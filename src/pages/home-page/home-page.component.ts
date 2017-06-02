import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surahIndex';

@Component({
  selector: 'home-page',
  templateUrl: 'home-page.html'
})
export class HomePage {

  surahIndex: SurahIndex[];
  
  // public navCtrl: NavController
  constructor() {
  }


}
