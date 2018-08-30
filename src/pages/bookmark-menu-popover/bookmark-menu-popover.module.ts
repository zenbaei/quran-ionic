import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookmarkMenuPopoverPage } from './bookmark-menu-popover';

@NgModule({
  declarations: [
    BookmarkMenuPopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(BookmarkMenuPopoverPage),
  ]
})
export class BookmarkMenuPopoverPageModule {}
