import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MyApp } from '../../app/app.component';
import { IonicModule } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surahIndex';

import { SurahIndexComponent } from './surah-index.component';

describe('SurahIndexComponent', () => {
  let component: SurahIndexComponent;
  let fixture: ComponentFixture<SurahIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyApp, SurahIndexComponent ],
      
      imports: [ IonicModule.forRoot(MyApp) ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurahIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
