import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TafsirPopoverPage } from './tafsir-popover';

@NgModule({
  declarations: [
    TafsirPopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(TafsirPopoverPage),
  ],
  exports: [
    TafsirPopoverPage
  ]
})
export class TafsirPopoverPageModule {}
