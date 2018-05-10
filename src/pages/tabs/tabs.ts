import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PopoverController, Tabs } from 'ionic-angular';
import { ContentPage } from '../content/content';
import { QuranPage } from '../quran/quran';
import { GoToPopoverPage } from '../go-to-popover/go-to-popover';
import * as Constants from '../../app/all/constants';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('mushafTabs') mushafTabs: Tabs;

  tab1Root = QuranPage;
  tab2Root = ContentPage;
  params = {}; // this object is passed through [rootParams] in tabs.html
  gozeAndHezb: string = '1'; // if not intialized by any value then it won't show on tabs!
  surahName: string = '1';

  constructor(private popoverCtrl: PopoverController, private cdRef: ChangeDetectorRef) {
  }

  ionViewDidEnter() {
    this.params = {
      mushafTabs: this.mushafTabs
    }
  }

  ngAfterViewChecked() {
    this.gozeAndHezb = `الجزء ${localStorage.getItem(Constants.GOZE)} - ${localStorage.getItem(Constants.HEZB)}`;
    this.surahName = `سورة ${localStorage.getItem(Constants.SURAH_NAME)}`;
    this.cdRef.detectChanges();
  }

  showGoToPopoverPage() {
    let popover = this.popoverCtrl.create(GoToPopoverPage, {
      'mushafTabs': this.mushafTabs
    });
    popover.present();
  }
}
