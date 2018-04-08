import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the TafsirPopoverPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-tafsir-popover',
  templateUrl: 'tafsir-popover.html',
})
export class TafsirPopoverPage {

  tafsir: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.tafsir = this.navParams.data.el.tafsir;
    console.log('ionViewDidLoad TafsirPopoverPage');
  }

}
