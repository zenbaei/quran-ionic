import { Pipe, PipeTransform } from '@angular/core';
import { ArabicUtils } from '../../app/util/arabic-utils/arabic-utils';

@Pipe({ name: 'arabic' })
export class ArabicNumberPipe implements PipeTransform {

  /**
   * @see ArabicUtils#toArabicNumber
   */
  transform(value: string, ...args): string {
    return ArabicUtils.toArabicNumber(Number.parseInt(value));
  }
}
