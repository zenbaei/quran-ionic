import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { QuranIndexComponent } from '../pages/quran-index/quran-index.component';
import { ListPage } from '../pages/list/list';
import { FileReader } from './core/io/file/FileReader';
import { SurahIndexService } from './service/surah-index/surahIndex.service';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file';

@NgModule({
  declarations: [
    MyApp,
    QuranIndexComponent,
    ListPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    QuranIndexComponent,
    ListPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    File,
    FileReader,
    SurahIndexService,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
