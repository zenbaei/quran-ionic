import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { QuranIndexComponent } from '../pages/quran-index/quran-index.component';
import { QuranPageComponent } from '../pages/quran-page/quran-page.component';
import { PopoverComponent } from '../pages/popover/popover.component';
import { ListPage } from '../pages/list/list';
import { QuranIndexService } from './service/quran-index/quran-index.service';
import { QuranPageService } from './service/quran-page/quran-page.service';
import { TafsirService } from './service/tafsir/tafsir.service';
import { HttpRequest } from './core/http/http-request';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpModule } from '@angular/http';
import { ArabicNumberPipe } from '../pipes/arabic-number/arabic-number';

@NgModule({
  declarations: [
    MyApp,
    QuranIndexComponent,
    ListPage,
    QuranPageComponent,
    PopoverComponent,
    ArabicNumberPipe
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    QuranIndexComponent,
    QuranPageComponent,
    PopoverComponent,
    ListPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    QuranIndexService,
    QuranPageService,
    TafsirService,
    HttpRequest,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }



