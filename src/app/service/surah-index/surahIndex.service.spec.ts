import { TestBed, inject } from '@angular/core/testing';
import { SurahIndex } from '../../domain/surahIndex';
import { SurahIndexService } from './surahIndex.service';
import { File } from '@ionic-native/file';
import * as constants from '../../domain/constants';

describe('SurahIndexService', () => {

  let surahIndexService: SurahIndexService;
  let file: File;

  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ 
        File,
        SurahIndexService        
      ]
    });
  });

  beforeEach(() => {
    surahIndexService = TestBed.get(SurahIndexService);
    file = TestBed.get(File);
  });

  it('should inject SurahIndexService', inject([ SurahIndexService ], (service) => {
    expect(service).toBeTruthy();
  }));

  it('should be able deserialize surah indexes json strings', () => {
    let quranIndex: string = `{"key":"الفَاتِحَةِ","value":1}
    {"key":"البَقَرَةِ","value":2}`;
    let surahIndexes: SurahIndex[] = surahIndexService.asSurahIndexes(quranIndex);
    expect(surahIndexes).toBeTruthy();
    console.log(surahIndexes);
    expect(surahIndexes.length).toBe(2);
  });

});
