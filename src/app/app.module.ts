import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { ContentPage } from '../pages/content/content';
import { QuranPage } from '../pages/quran/quran';
import { ListPage } from '../pages/list/list';
import { TafsirPopoverPage } from '../pages/tafsir-popover/tafsir-popover';
import { QuranIndexService } from './service/quran-index/quran-index.service';
import { QuranPageService } from './service/quran-page/quran-page.service';
import { TafsirService } from './service/tafsir/tafsir.service';
import { HttpRequest } from './core/http/http-request';
import { File } from '@ionic-native/file';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpModule } from '@angular/http';
import { ArabicNumberPipe } from '../pipes/arabic-number/arabic-number.pipe';
import { SafeHtmlPipe } from '../pipes/safe-html/safe-html.pipe';

@NgModule({
  declarations: [
    MyApp,
    ContentPage,
    ListPage,
    QuranPage,
    ArabicNumberPipe,
    SafeHtmlPipe,
    TafsirPopoverPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ContentPage,
    QuranPage,
    ListPage,
    TafsirPopoverPage
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



