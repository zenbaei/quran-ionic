import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  
  constructor(private sanitized: DomSanitizer) { }
  
  transform(value: string, ...args): SafeHtml {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}