import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MyApp } from '../../app/app.component';
import { IonicModule } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surahIndex';
import { SurahIndexService } from '../../app/service/surah-index/surahIndex.service';
import { QuranIndexComponent } from './quran-index.component';
import { HttpModule } from '@angular/http';
import { HttpRequest } from '../../app/core/http/httpRequest';
import { Observable } from 'rxjs';

describe('QuranIndexComponent', () => {
  let component: QuranIndexComponent;
  let fixture: ComponentFixture<QuranIndexComponent>;
  let surahIndexService: SurahIndexService;
  let surahIndexes: SurahIndex[] = [new SurahIndex('fateha', 1), new SurahIndex('bakara', 2)];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyApp, QuranIndexComponent],
      providers: [ SurahIndexService, HttpRequest ],
      imports: [ IonicModule.forRoot(MyApp), HttpModule ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuranIndexComponent);
    surahIndexService = TestBed.get(SurahIndexService);
    component = fixture.componentInstance;
    spyOn(surahIndexService, 'getQuranIndex').and.returnValue(Observable.of(surahIndexes));
    fixture.detectChanges();
  });

  it('Given QuranIndexComponent is provided When it is referenced Then it should be defined', () => {
    expect(component).toBeDefined();
  });

  it('Given SurahIndex array is provided When QuranIndexComponent template is loaded Then it should have a list of surah index links', async(() => {
    component.ngOnInit();
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      let surahIndexLinks: DebugElement[] = fixture.debugElement.queryAll(By.css('a'));

      expect(surahIndexLinks).toBeDefined();
      expect(surahIndexLinks.length).toBe(2);
      expect(surahIndexLinks[1].nativeElement.textContent).toBe('bakara');
      expect(surahIndexLinks[1].nativeElement.href).toContain('/2');
    });
  }));

});
