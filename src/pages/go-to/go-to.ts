import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QuranIndexService } from '../../app/service/quran-index/quran-index.service';
import { QuranPage } from '../quran/quran';


/**
 * Generated class for the GoToPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage({
  name: 'GoToPage',
  segment: 'goTo'
})
@Component({
  selector: 'page-go-to',
  templateUrl: 'go-to.html',
})
export class GoToPage {
  pageNumber: number;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
   // console.log('ionViewDidLoad GoToPage');
  }

  goToPage() {
    this.navCtrl.push(QuranPage.name, {
      'pageNumber': this.pageNumber
    });
  }

}
