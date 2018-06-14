import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsPage } from '../pages/tabs/tabs';
import { Insomnia } from '@ionic-native/insomnia';
import { timer } from 'rxjs/observable/timer';
import { QuranService } from './service/quran/quran-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any = TabsPage;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
    public insomnia: Insomnia, public quranService: QuranService) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.insomnia.keepAwake();
	  //this.quranService.doVarMigration();
      timer(4000).subscribe(() => {
        this.splashScreen.hide();
      });
    });
  }
  
}
