import { InputmaskPipe, PipeReturn } from './interfaces';

const maxYearDefault = 2100;
const minYearDefault = 1900;
const maxDay = 31;
const maxMonth = 12;
const maxShortYear = 99;
const maxHour = 23;
const maxMinute = 59;
const maxSecond = 59;
const radix = 10;

const dateLength = 3;
const indexYear = 2;
const indexMonth = 1;
const indexDay = 0;

export interface CreatePipeCheckDateConfig {
  maxYear?: number;
  minYear?: number;
  maxDate?: Date;
}

export function createPipeCheckDate(dateFormat: string = 'dd.mm.yyyy', config?: CreatePipeCheckDateConfig): InputmaskPipe {
  return function(conformedValue: string): PipeReturn {

    const indexesOfPipedChars = [];
    const dateFormatArray = dateFormat.split(/[^dmyHMS]+/);

    const maxYear = (config && config.maxYear) ? config.maxYear : maxYearDefault;
    const minYear = (config && config.minYear) ? config.minYear : minYearDefault;
    const maxDate = (config && config.maxDate) ? config.maxDate : null;

    const maxValue = {
      'dd': maxDay,
      'mm': maxMonth,
      'yy': maxShortYear,
      'yyyy': maxYear,
      'HH': maxHour,
      'MM': maxMinute,
      'SS': maxSecond
    };
    const minValue = { 'dd': 1, 'mm': 1, 'yy': 0, 'yyyy': minYear, 'HH': 0, 'MM': 0, 'SS': 0 };
    const conformedValueArr = conformedValue.split('');

    // Проверка первых символов ( дописывает 0 где нужно )
    dateFormatArray.forEach((format) => {
      const position = dateFormat.indexOf(format);
      const maxFirstDigit = parseInt(maxValue[format].toString().substr(0, 1), radix);

      if (parseInt(conformedValueArr[position], radix) > maxFirstDigit) {
        conformedValueArr[position + 1] = conformedValueArr[position];
        conformedValueArr[position] = '0';
        indexesOfPipedChars.push(position);
      }
    });

    // Проверка разрядов даты на валидность
    const isInvalid = dateFormatArray.some((format) => {
      const position = dateFormat.indexOf(format);
      const length = format.length;
      const textValue = conformedValue.substr(position, length).replace(/\D/g, '');
      const value = parseInt(textValue, radix);

      const result = value > maxValue[format] || (textValue.length === length && value < minValue[format]);

      // Отсечение лет меньше minYear и больше maxYear, с условием их частичного ввода
      if (!result && format === 'yyyy' && value) {

        const completeLength = textValue.length;

        const completeYearMin = parseInt(minYear.toString().substr(0, completeLength), radix);
        const completeYearMax = parseInt(maxYear.toString().substr(0, completeLength), radix);

        return (value < completeYearMin) || (value > completeYearMax);
      }

      return result;
    });

    if (isInvalid) {
      return false;
    }

    if (maxDate) {
      const dateArr = conformedValue.split('.');
      if (dateArr.length === dateLength) {
        const inputDate = new Date(
          parseInt(dateArr[indexYear], radix),
          parseInt(dateArr[indexMonth], radix) - 1,
          parseInt(dateArr[indexDay], radix)
        );
        if (!isNaN(inputDate.getTime()) && inputDate > maxDate) {
          return false;
        }
      }
    }

    return {
      value: conformedValueArr.join(''),
      indexesOfPipedChars
    };
  };
}
