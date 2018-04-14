import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GoToPage } from './go-to';

@NgModule({
  declarations: [
    GoToPage,
  ],
  imports: [
    IonicPageModule.forChild(GoToPage),
  ],
  exports: [
    GoToPage
  ]
})
export class GoToPageModule {}
