import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { ContentPage } from '../pages/content/content';
import { ContentPageModule } from '../pages/content/content.module';
import { TabsPage } from '../pages/tabs/tabs';
import { GoToPage } from '../pages/go-to/go-to';
import { QuranIndexService } from './service/quran-index/quran-index.service';
import { QuranPageService } from './service/quran-page/quran-page.service';
import { TafsirService } from './service/tafsir/tafsir.service';
import { HttpRequest } from './core/http/http-request';
import { File } from '@ionic-native/file';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpModule } from '@angular/http';

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    GoToPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    ContentPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    GoToPage,
    ContentPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    QuranIndexService,
    QuranPageService,
    TafsirService,
    HttpRequest,
    File,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }



