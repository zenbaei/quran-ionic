import { Component, ViewChild } from '@angular/core';
import { Content, Toast, Platform, Gesture } from 'ionic-angular';
import { QuranService } from '../../app/service/quran/quran-service';
import { AppUtils } from "../../app/util/app-utils/app-utils";
import * as Constants from '../../app/all/constants';
import { ToastController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { timer } from 'rxjs/observable/timer';
import { Quran } from '../../app/domain/quran';

declare var $: any;

@Component({
  selector: 'page-quran',
  templateUrl: 'quran-page.html'
})
export class QuranPage {

  @ViewChild(Content) content: Content;
  @ViewChild('container') container;
  private gesture: Gesture;
  private infoToast: Toast;
  private readonly EXTEND_LINE_HEIGHT_CLASS: string = 'line-height-extended';
  private isZoomed: boolean = false;

  constructor(private quranService: QuranService,
    private toastCtl: ToastController,
    private events: Events, private orientation: ScreenOrientation,
    private platform: Platform) {
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.orientationChangedEvent();
      this.subscribeToCordovaEvents();
      this.initTurnJs(); // when added to ionViewDidEnter then go to 'فهرس' and back again it throws exception, perhaps becoz it's intialized twice!
      //this.addPinchEvents();
    });
  }

  /**
   * Called every time the view is rendered (navigated to from another page)
   * use case; when selecting surah from content page and on opening application.
   */
  ionViewDidEnter() {
    this.loadSavedPageOnStart();
    this.subscribeToJsEvents();
  }

  ionViewWillLeave() {
    this.dismissInfoToast();
    this.clearPopover();
  }

  /**
   * Fires whenever the tab is reclicked without being on another tab.
   * Called when using go to functionality as well.
   */
  ionSelected() {
    // ionViewWillLeave is called
    this.loadSavedPageOnStart();
  }

  /**
   * It's executed multiple times whenever the view is manipulated.
   */
  ngAfterViewChecked() { }

  loadSavedPageOnStart() {
    this.quranService.getSavedPageNumber().then(pageNumber => {
      $('#flipbook').turn('page', pageNumber);
      this.showInfoToast(this.getInfoMsg(pageNumber)); //doesn't work when navigating to not loaded page becoz fetching page is not done yet
      // $(this).turn('data').hover = true; adding data
    });
  }

  subscribeToJsEvents() {
    $(window).resize(() => {
      this.updateFlibookSize();
    });
  }

  addPinchEvents() {
    // working but only the font is not increased
    this.gesture = new Gesture(this.container.nativeElement);
    this.gesture.listen();

    this.gesture.on('doubletap', (e: Event) => {
      this.isZoomed = !this.isZoomed;
      if (this.isZoomed) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }

      console.log(e.type);
    });

    this.gesture.on('pinchout', () => {
      console.log('pinchout');
      //this.zoomIn();
    });
    this.gesture.on('pinchout', () => {
      console.log('pinchout');
      //this.zoomIn();

    });
  }

  private zoomIn() {
    $("#flipbook").turn('zoom', 2);
  }

  private zoomOut() {
    $("#flipbook").turn('zoom', 1);
  }

  private executeWhenPageIsTurned() {
    this.scrollToTop();
    this.initPopover();
    this.addOverflowEvent();
    this.updateFlibookSize();
  }

  private initTurnJs() {
    let self = this;
    $("#flipbook").turn({
      width: '100%',
      height: '100%',
      display: 'single',
      elevation: 50,
      acceleration: true,
      gradients: true,
      autoCenter: true,
      duration: 2000,
      pages: 604,
      when: {
        turning: function (e, page, view) {
          self.ionViewWillLeave();
          self.saveCurrentPageNumber(page);
        },
        missing: function (e, pages) {
          for (var i = 0; i < pages.length; i++) {
            self.addPage(pages[i], $(this));
          }
        },
        end: function (e, pages) {
          self.executeWhenPageIsTurned();
        }
      }
    });
  }

  private addPage(page, book) {
    var element = $('<div/>', {});

    if (book.turn('addPage', element, page)) {
      this.quranService.find(page, this.isAndroid()).subscribe((quran) => {
        this.savePageInfo(quran);
        let innerDiv = `<div id="border" class="${this.evaluateBorderClasses(page)}">
            <div style="background-color: aliceblue" class="${this.evaluatePaddingClasses(page)}">
              <div id="font-selector" class="${this.evaluateContentClasses(page)}">
                ${quran.data}
              </div>
            </div>
          </div>`
        element.html(innerDiv);
      });
    }
  }

  saveCurrentPageNumber(page: number) {
    this.quranService.savePageNumber(page);
    sessionStorage.setItem(Constants.PAGE_NUMBER, page.toString()); //used in tabs.ts, using value from sqllite doesnt work
  }

  savePageInfo(quran: Quran) {
    let info = {
      surahName: quran.surahName,
      pageNumber: quran.pageNumber,
      goze: quran.goze,
      hezb: quran.hezb
    }
    sessionStorage.setItem(quran.pageNumber.toString(), JSON.stringify(info));
  }

  evaluateBorderClasses(page: number): string {
    let classes: string = '';

    if (page < 3) {
      classes = 'mushaf-container-fateha';
    } else {
      classes = 'mushaf-container';
    }

    return classes;
  }

  evaluatePaddingClasses(page: number): string {
    if (page < 3) {
      return 'fateha-padding'
    } else {
      return 'mushaf-padding';
    }
  }

  evaluateContentClasses(page: number): string {
    let classes: string = 'ios-justify';
    if (page == 604) {
      classes += ', moaouzat-content';
    }
    return classes;
  }

  private scrollToTop() {
    this.content.scrollToTop();
  }

  public swipeEvent(event: any): void {
    if (event.direction === 2) {
      $('#flipbook').turn('previous');
    } else if (event.direction === 4) {
      $('#flipbook').turn('next');
    }
  }

  public tapEvent(event: any): void {
    this.events.publish(Constants.EVENT_HIDE_CONTROL_BUTTONS);
  }

  private subscribeToCordovaEvents(): void {
    this.events.subscribe(Constants.EVENT_TOGGLE_TAB, (status: Constants.Status) => {
      this.tabToggledEventAction(status)
    });
    this.orientation.onChange().subscribe(() =>
      timer(100).subscribe(() =>
        this.orientationChangedEvent()
      )
    );
  }

  /**
   * It has an advantage over the ionic popover in that the popover position comes on top
   * of the span rather that in a static position as ionic popover
   */
  initPopover() {
    let tafsirAnchors: JQuery<HTMLElement> = $('[data-toggle="popover"]');
    if (tafsirAnchors.length === 0) { // content not displayed yet
      return;
    }

    tafsirAnchors.popover({
      trigger: 'focus',
      container: 'body'
    });
  }

  private clearPopover() {
    let tafsirAnchors: JQuery<HTMLElement> = $('[data-toggle="popover"]');
    if (tafsirAnchors.length === 0) { // content not displayed yet
      return;
    }
    tafsirAnchors.popover("hide");
  }

  public showInfoToast(msg: string): void {
    this.infoToast = this.toastCtl.create({
      message: msg,
      duration: 3000,
      position: 'middle'
    });
    this.infoToast.present();
  }

  private dismissInfoToast() {
    if (this.infoToast) {
      this.infoToast.dismiss();
      this.infoToast = null;
    }
  }

  private getInfoMsg(pageNumber: number): string {
    var quran = JSON.parse(sessionStorage.getItem(pageNumber.toString()));
    if (!quran) {
      return '';
    }
    var gozeAndHezb = `الجـزء ${quran.goze} - ${quran.hezb}`;
    return `${quran.surahName} - (${gozeAndHezb})`;
  }

  private orientationChangedEvent() {
    console.debug(`Orientation is: ${this.orientation.type}`);
    this.ionViewWillLeave();
    this.checkTabStatus();
  }

  private isPortrait(): boolean {
    return AppUtils.isPortrait(this.orientation);
  }

  private isAndroid(): boolean {
    return this.platform.is(Constants.PLATFORM_ANDROID);
  }

  tabToggledEventAction(status: Constants.Status) {
    sessionStorage.setItem(IS_TAB_HIDDEN, status.toString());//saving status in case of changing orientatin
    if (!this.isPortrait()) {
      return;
    }
    if (status === Constants.Status.HIDDEN) {
      $('#flipbook').addClass(this.EXTEND_LINE_HEIGHT_CLASS);
    } else {
      $('#flipbook').removeClass(this.EXTEND_LINE_HEIGHT_CLASS);
    }
    
    this.updateFlibookSize();
  }

  checkTabStatus() {
    let isTabHidden: string = sessionStorage.getItem(IS_TAB_HIDDEN);
    let status: Constants.Status = Constants.Status.SHOWN;
    if (isTabHidden == Constants.Status.HIDDEN.toString()) {
      status = Constants.Status.HIDDEN;
    }
    this.tabToggledEventAction(status);
  }

  private updateFlibookSize() {
    //timer(100).subscribe(() => {
      var pageNu = $('#flipbook').turn('page');
      var height = $(`.p${pageNu} #border`).css('height');
      console.log(height);
     $('#flipbook').turn('size', 'auto', height);
    //});
  }

  private addOverflowEvent(): void {
    $('.mushaf-container').bind('overflow', this.OnOverflowChanged);
  }

  private OnOverflowChanged(event): void {
    if (event.type == "overflow") {
      switch (event.detail) {
        case 0:
          alert("The vertical scrollbar has appeared.");
          break;
        case 1:
          alert("The horizontal scrollbar has appeared.");
          break;
        case 2:
          alert("The horizontal and vertical scrollbars have both appeared.");
          break;
      }
    }
    else {
      switch (event.detail) {
        case 0:
          alert("The vertical scrollbar has disappeared.");
          break;
        case 1:
          alert("The horizontal scrollbar has disappeared.");
          break;
        case 2:
          alert("The horizontal and vertical scrollbars have both disappeared.");
          break;
      }
    }
  }

  /*
  var formatted = formatData(JSON.stringify(quran, null, '\t'));
function formatData(data) {
    var result = stringUtils.replaceAll(data, B, L1);
    result = stringUtils.replaceAll(result, BT, L2);
    result = stringUtils.replaceAll(result, BTT, L3);
    result = stringUtils.replaceAll(result, ANCHOR_OPENING, L3 + ANCHOR_OPENING);
    result = stringUtils.replaceAll(result, ANCHOR_CLOSING, L3 + ANCHOR_CLOSING + L3);
    result = stringUtils.replaceAll(result, ANCHOR_BODY, ANCHOR_BODY + L4);

    return result;
}
*/

}

const IS_TAB_HIDDEN = 'isTabHidden';
