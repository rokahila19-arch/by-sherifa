import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fcfa' })
export class FcfaPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '';
    return value.toLocaleString('fr-FR').replace(/[  ]/g, ' ') + ' FCFA';
  }
}
