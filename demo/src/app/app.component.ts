import {Component} from '@angular/core';
import {createPipeCheckDate, InputmaskPreset, PipeResult} from '../../../src';
import {FormBuilder, FormGroup} from "@angular/forms";

export const MASK_YEAR = [/[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  readonly maxHour = 23;
  readonly maxMinute = 60;
  readonly timeStringLength = 2;
  readonly maxHourFirstDigit = 2;
  readonly maxMinuteFirstDigit = 5;

  readonly minuteLength = 2;

  form: FormGroup;

  number: string;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      time: '11:00',
      number: 10
    });
  }

  get preset(): InputmaskPreset {
    return {
      mask: MASK_YEAR,
      pipe: this.checkDate,
      guide: true,
      keepCharPositions: true
    };
  }

  checkDate(value: string): string {
    return value;
  }

  get presetToday(): InputmaskPreset {
    return {
      mask: MASK_YEAR,
      pipe: createPipeCheckDate('dd.mm.yyyy', {
        maxDate: new Date()
      })
    };
  }

  get presetTime(): InputmaskPreset {
    return {
      mask: [/[0-9]/, /[0-9:]/, /[0-9:]/, /[0-9]/, /[0-9]/],
      pipe: this.checkTime.bind(this)
    };
  }

  checkTime(value: string): boolean | string | PipeResult {

    if (!value) {
      return value;
    }

    const indexesOfPipedChars = [];

    let [hour, minute] = value.split(':');

    if (!hour) {
      hour = '';
    }

    if (!minute) {
      minute = '';
    }
    // Если первая цифра часа больше 2, до дописываем 0
    if (+hour.substr(0, 1) > this.maxHourFirstDigit) {
      hour = '0' + hour;
      // При добавлении символа, нам надо написать индекс добавленного символа в массив, для корректной работы inputMask
      indexesOfPipedChars.push(0);
    }
    // Если длина часа больше 2, значит пользователь начал ввод минут
    if (hour.length > this.timeStringLength) {
      // Если минуты уже введены, надо отбросить значение
      if (minute.length !== this.minuteLength) {
        minute = minute + hour.substr(this.timeStringLength);
      }
      hour = hour.substr(0, this.timeStringLength);
    }

    if (+hour > this.maxHour) {
      return false;
    }

    let conformedValue = hour;

    if (minute) {
      // Проверяем первую цифру минут, если больше 5, то дописываем 0
      if (minute.length === 1 && +minute > this.maxMinuteFirstDigit) {
        minute = '0' + minute;
        // Добавленный символ будет поле `:` , значит его индекс hour.length - 1 + 1  => hour.length
        indexesOfPipedChars.push(hour.length);
      }

      if (+minute > this.maxMinute) {
        return false;
      }

      conformedValue += ':' + minute;
    }

    return {
      value: conformedValue,
      indexesOfPipedChars
    };
  }

  setNumber(): void {
   this.form.controls['number'].patchValue('500');
  }

  resetNumber(): void {
    this.form.reset();
  }

}


