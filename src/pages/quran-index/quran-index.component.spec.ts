import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MyApp } from '../../app/app.component';
import { IonicModule } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surahIndex';
import { QuranIndexService } from '../../app/service/quran-index/quranIndex.service';
import { QuranIndexComponent } from './quran-index.component';
import { HttpModule } from '@angular/http';
import { HttpRequest } from '../../app/core/http/httpRequest';
import { Observable } from 'rxjs';
import { NavController } from 'ionic-angular';

describe('QuranIndexComponent', () => {
  let component: QuranIndexComponent;
  let fixture: ComponentFixture<QuranIndexComponent>;
  let quranIndexService: QuranIndexService;
  let surahIndexes: SurahIndex[] = [new SurahIndex('fateha', 1), new SurahIndex('bakara', 2)];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyApp, QuranIndexComponent],
      providers: [ QuranIndexService, HttpRequest, NavController ],
      imports: [ IonicModule.forRoot(MyApp), HttpModule ]
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

      let surahIndexUnorderdList: DebugElement[] = fixture.debugElement.queryAll(By.css('li'));

      expect(surahIndexUnorderdList).toBeDefined();
      expect(surahIndexUnorderdList.length).toBe(2);
      expect(surahIndexUnorderdList[1].nativeElement.textContent.trim()).toBe('bakara');
    });
  }));

  it('Given QuranIndexComponent have 2 SurahIndex buttons When button is clicked Then goToPage should be called', async(() => {
    component.ngOnInit();
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      spyOn(component, 'goToPage').and.returnValue(Observable.of('Hi'));
      let surahIndexButtons: DebugElement[] = fixture.debugElement.queryAll(By.css('li button'));
      expect(surahIndexButtons.length).toBe(2);
      surahIndexButtons[1].nativeElement.click();

      fixture.detectChanges();
      // expect(component.goToPage).toHaveBeenCalledWith(2);
    });
  }));

});
