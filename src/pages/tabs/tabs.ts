import { Component } from '@angular/core';

import { ContentPage } from '../content/content';
import { GoToPage } from '../go-to/go-to';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = ContentPage;
  tab2Root = GoToPage;
  //tab3Root = ContactPage;

  constructor() {

  }
}
