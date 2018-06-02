import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { ContentPage } from '../pages/content/content';
import { ContentPageModule } from '../pages/content/content.module';
import { TabsPage } from '../pages/tabs/tabs';
import { IndexService } from './service/index/index-service';
import { QuranService } from './service/quran/quran-service';
import { IonicStorageModule } from '@ionic/storage';
import { TafsirService } from './service/tafsir/tafsir-service';
import { HttpRequest } from './core/http/http-request';
import { GoToPopoverPageModule } from '../pages/go-to-popover/go-to-popover.module';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpModule } from '@angular/http';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Insomnia } from '@ionic-native/insomnia';
import { QuranPage } from '../pages/quran/quran-page';
import { SafeHtmlPipe } from '../pipes/safe-html/safe-html.pipe';

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    QuranPage,
    SafeHtmlPipe
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    ContentPageModule,
    GoToPopoverPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    QuranPage,
    ContentPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    IndexService,
    QuranService,
    TafsirService,
    HttpRequest,
    ScreenOrientation,
    Insomnia,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }



