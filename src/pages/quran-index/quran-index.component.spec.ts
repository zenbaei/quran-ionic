import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MyApp } from '../../app/app.component';
import { IonicModule } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surahIndex';
import { SurahIndexService } from '../../app/service/surah-index/surahIndex.service';
import { QuranIndexComponent } from './quran-index.component';
import { HttpModule } from '@angular/http';

describe('QuranIndexComponent', () => {
  let component: QuranIndexComponent;
  let fixture: ComponentFixture<QuranIndexComponent>;
  let surahIndexService: SurahIndexService;
  let surahIndexes: SurahIndex[] = [new SurahIndex('fateha', 1), new SurahIndex('bakara', 2)];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyApp, QuranIndexComponent],
      providers: [SurahIndexService],
      imports: [ IonicModule.forRoot(MyApp), HttpModule ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuranIndexComponent);
    surahIndexService = TestBed.get(SurahIndexService);
    component = fixture.componentInstance;
    spyOn(surahIndexService, 'getQuranIndex').and.returnValue(Promise.resolve(surahIndexes));
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have a list of surah index links when the page is loaded', async(() => {
    component.ngOnInit();
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      let surahIndexLinks: DebugElement[] = fixture.debugElement.queryAll(By.css('a'));

      expect(surahIndexLinks).toBeDefined();
      expect(surahIndexLinks.length).toBe(2);
      //expect(surahIndexLinks[1].nativeElement.textContent).toBe('bakara');
      //expect(surahIndexLinks[1].nativeElement.href.indexOf('/2')).toBeGreaterThan(0);
    });
  }));

});
