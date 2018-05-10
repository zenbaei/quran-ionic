import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { ContentPage } from '../pages/content/content';
import { ContentPageModule } from '../pages/content/content.module';
import { TabsPage } from '../pages/tabs/tabs';
import { QuranIndexService } from './service/quran-index/quran-index.service';
import { QuranPageService } from './service/quran-page/quran-page.service';
import { IonicStorageModule } from '@ionic/storage';
import { TafsirService } from './service/tafsir/tafsir.service';
import { HttpRequest } from './core/http/http-request';
import { File } from '@ionic-native/file';
import { GoToPopoverPageModule } from '../pages/go-to-popover/go-to-popover.module';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpModule } from '@angular/http';

import { QuranPage } from '../pages/quran/quran';

import { ArabicNumberPipe } from '../pipes/arabic-number/arabic-number.pipe';
import { SafeHtmlPipe } from '../pipes/safe-html/safe-html.pipe';

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    QuranPage,
    SafeHtmlPipe,
    ArabicNumberPipe
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
    QuranIndexService,
    QuranPageService,
    TafsirService,
    HttpRequest,
    File,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }



