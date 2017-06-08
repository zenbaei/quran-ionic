import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MyApp } from '../../app/app.component';
import { IonicModule } from 'ionic-angular';
import { SurahIndex } from '../../app/domain/surahIndex';
import { QuranPageService } from '../../app/service/quran-page/quranPage.service';
import { QuranPageComponent } from './quran-page.component';
import { HttpModule } from '@angular/http';
import { HttpRequest } from '../../app/core/http/httpRequest';
import { Observable } from 'rxjs';

describe('QuranPageComponent', () => {
    let component: QuranPageComponent;
    let fixture: ComponentFixture<QuranPageComponent>;
    let quranPageService: QuranPageService;
    let surahIndexes: SurahIndex[] = [new SurahIndex('fateha', 1), new SurahIndex('bakara', 2)];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MyApp, QuranPageComponent],
            providers: [QuranPageService, HttpRequest],
            imports: [IonicModule.forRoot(MyApp), HttpModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuranPageComponent);
        quranPageService = TestBed.get(QuranPageService);
        component = fixture.componentInstance;
        spyOn(quranPageService, 'fetchPageContent').and.returnValue(Observable.of(surahIndexes));
        fixture.detectChanges();
    });

});