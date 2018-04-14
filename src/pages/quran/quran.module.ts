import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuranPage } from './quran';

import { ArabicNumberPipe } from '../../pipes/arabic-number/arabic-number.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html/safe-html.pipe';

@NgModule({
  declarations: [
    QuranPage,
    ArabicNumberPipe,
    SafeHtmlPipe
  ],
  imports: [
    IonicPageModule.forChild(QuranPage),
  ],
  exports: [
    QuranPage
  ]
})
export class QuranPageModule {}
