import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MyApp } from '../../app/app.component';
import { IonicModule } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surah-index';
import { QuranIndexService } from '../../app/service/quran-index/quran-index.service';
import { QuranIndexComponent } from './quran-index.component';
import { HttpModule } from '@angular/http';
import { HttpRequest } from '../../app/core/http/http-request';
import { Observable } from 'rxjs';
import { NavController } from 'ionic-angular';
import { NavMock } from '../../mocks';

describe('QuranIndexComponent', () => {
  let component: QuranIndexComponent;
  let fixture: ComponentFixture<QuranIndexComponent>;
  let quranIndexService: QuranIndexService;
  let surahIndexes: SurahIndex[] = [new SurahIndex('fateha', 1), new SurahIndex('bakara', 2)];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyApp, QuranIndexComponent],
      providers: [QuranIndexService, HttpRequest,
        {
          provide: NavController,
          useClass: NavMock
        }
      ],
      imports: [IonicModule.forRoot(MyApp), HttpModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuranIndexComponent);
    quranIndexService = TestBed.get(QuranIndexService);
    component = fixture.componentInstance;
    spyOn(quranIndexService, 'getQuranIndex').and.returnValue(Observable.of(surahIndexes));
    fixture.detectChanges();
  });

  it('Given QuranIndexComponent is provided When it is referenced Then it should be defined', () => {
    expect(component).toBeDefined();
  });

  it('Given SurahIndex array is provided When QuranIndexComponent template is loaded Then it should have a list of surah index buttons', async(() => {
    component.ngOnInit();
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      let surahIndexButtons: DebugElement[] = fixture.debugElement.queryAll(By.css('li'));

      expect(surahIndexButtons).toBeDefined();
      expect(surahIndexButtons.length).toBe(2);
      expect(surahIndexButtons[1].nativeElement.textContent.trim()).toBe('bakara');
    });
  }));

/*  
    it('Given QuranIndexComponent have 2 SurahIndex buttons When button is clicked Then goToPage should be called', async(() => {
      component.ngOnInit();
      fixture.whenStable().then(() => {
        fixture.detectChanges();
  
        spyOn(component, 'goToPage').and.returnValue(Observable.of('Hi'));
        let surahIndexButtons: DebugElement[] = fixture.debugElement.queryAll(By.css('li button'));

        expect(surahIndexButtons.length).toBe(2);
        expect(surahIndexButtons[0].nativeElement.textContent.trim()).toBe('fateha');

        surahIndexButtons[0].triggerEventHandler('click', null);
        
        fixture.whenStable().then(() => {
        expect(component.goToPage).toHaveBeenCalled();
        });
       // fixture.detectChanges();
        //expect(component.goToPage).toHaveBeenCalledWith(1);
      });
    }));


  it('should be able to launch wishlist page', () => {

    let navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'push');

    let de: DebugElement = fixture.debugElement.queryAll(By.css('li button'))[0];
    expect(de.nativeElement.textContent.trim()).toBe('fateha');
    de.triggerEventHandler('click', null);

    expect(navCtrl.push).toHaveBeenCalled();

  });
*/
});
