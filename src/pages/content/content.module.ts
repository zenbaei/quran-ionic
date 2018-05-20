import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentPage } from './content';
import { ArabicNumberPipe } from '../../pipes/arabic-number/arabic-number.pipe';

@NgModule({
  declarations: [
    ContentPage,
    ArabicNumberPipe
  ],
  imports: [
    IonicPageModule.forChild(ContentPage),
  ],
  exports: [
    ContentPage,
    ArabicNumberPipe
  ]
})
export class ContentPageModule {}
