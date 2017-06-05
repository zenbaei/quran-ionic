import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MyApp } from '../../app/app.component';
import { IonicModule } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surahIndex';
import { SurahIndexService } from '../../app/service/surah-index/surahIndex.service';
import { FileReader } from '../../app/core/io/file/FileReader';
import { QuranIndexComponent } from './quran-index.component';
import { File } from '@ionic-native/file';

describe('QuranIndexComponent', () => {
  let component: QuranIndexComponent;
  let fixture: ComponentFixture<QuranIndexComponent>;
  let fileReader: FileReader;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyApp, QuranIndexComponent ],
      providers: [ SurahIndexService, FileReader, File ],
      imports: [ IonicModule.forRoot(MyApp) ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuranIndexComponent);
    fileReader = TestBed.get(FileReader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    spyOn(fileReader, 'readAsText').and.returnValue(Promise.resolve(true));
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have a list of surah index links when the page is loaded', () => {
    let fatehaSurahIndex: SurahIndex = new SurahIndex('fateha', 1);
    let bakaraSurahIndex: SurahIndex = new SurahIndex('bakara', 2);
    
    component.surahIndex = [fatehaSurahIndex, bakaraSurahIndex];
    fixture.detectChanges();
    let surahIndexLinks: DebugElement[] =  fixture.debugElement.queryAll(By.css('a'));

    expect(surahIndexLinks).toBeTruthy();
    expect(surahIndexLinks[1].nativeElement.textContent).toBe('bakara');

    expect(surahIndexLinks[1].nativeElement.href.indexOf('/2')).toBeGreaterThan(0);
  });


});
