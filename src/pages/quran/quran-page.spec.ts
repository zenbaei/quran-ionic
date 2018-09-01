import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MyApp } from '../../app/app.component';
import { IonicModule, NavController, NavParams } from 'ionic-angular';
import { QuranIndex } from '../../app/domain/quran-index';
import { QuranService } from '../../app/service/quran/quran-service';
import { QuranPage } from './quran-page';
import { HttpModule } from '@angular/http';
import { HttpRequest } from '../../app/core/http/http-request';
import { Observable } from 'rxjs';
import * as $ from 'jquery';

describe('QuranPage', () => {
    let component: QuranPage;
    let fixture: ComponentFixture<QuranPage>;
    let quranPageService: QuranService;
    let surahIndexes: QuranIndex[] = [new QuranIndex('fateha', 1, 1), 
        new QuranIndex('bakara', 2, 1)];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MyApp, QuranPage],
            providers: [QuranService, HttpRequest, NavController, NavParams],
            imports: [IonicModule.forRoot(MyApp), HttpModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuranPage);
        quranPageService = TestBed.get(QuranService);
        component = fixture.componentInstance;
        spyOn(quranPageService, 'findPageContentByPageNumber').and.returnValue(Observable.of(surahIndexes));
        fixture.detectChanges();
    });

/*
    it('Given quran page is displaying content When swipe left is done Then previous method should be called', () => {

    });
*/
});