import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GoToPopoverPage } from './go-to-popover';

@NgModule({
  declarations: [
    GoToPopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(GoToPopoverPage),
  ],
  exports: [
    GoToPopoverPage
  ],
  entryComponents: [
    GoToPopoverPage
  ]
})
export class GoToPopoverPageModule {}
