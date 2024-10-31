import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getValueByKeyForEnum',
  standalone: true, // Esto convierte el pipe en standalone
})
export class GetValueByKeyForEnumPipe implements PipeTransform {
  transform(
    value: string,
    enumType: Record<string, string | number>
  ): string | undefined {
    if (!enumType || !value) {
      return undefined;
    }

    // Busca el valor y asegura que se trate como un string.
    const entry = Object.entries(enumType).find(([key]) => key === value);

    return entry ? String(entry[1]) : undefined;
  }
}
