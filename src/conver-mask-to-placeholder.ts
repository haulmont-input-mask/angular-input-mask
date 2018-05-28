import { placeholderChar as defaultPlaceholderChar } from './constants';
import { InputmaskMaskFormat, PipeResult } from './interfaces';

export function convertMaskToPlaceholder(mask: InputmaskMaskFormat, placeholderChar = defaultPlaceholderChar): string {
  if (!mask) {
    return '';
  }
  if (mask.indexOf(placeholderChar) !== -1) {
    throw new Error(
      'Символ заполнитель не должен присутствовать в маске. ' +
      'Укажите символ, которого нет в вашей маске в качестве символа-заполнителя.\n\n' +
      `Полученный символ-заполнитель: ${JSON.stringify(placeholderChar)}\n\n` +
      `Маска, которая была получена,: ${JSON.stringify(mask)}`
    );
  }

  return mask.map((char) => {
    return (char instanceof RegExp) ? placeholderChar : char;
  }).join('');
}

export function isString(value: boolean | string | PipeResult | number): boolean {
  return typeof value === 'string' || value instanceof String;
}

export function isNumber(value: boolean | string | PipeResult | number): boolean {
  return typeof value === 'number' && !isNaN(value);
}
