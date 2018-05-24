/*
*  Оригинал: https://github.com/text-mask/text-mask/tree/master/angular2
* */

import adjustCaretPosition from './adjust-caret-position';
import conformToMask from './conform-to-mask';

import { convertMaskToPlaceholder, isNumber, isString } from './conver-mask-to-placeholder';
import { ConformToMaskConfig, MaskConfig, PipeResult } from './interfaces';
import { emptyString } from './constants';

const strFunction = 'function';

const strNone = 'none';

const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

export class InputMaskElement {

  state = {
    previousConformedValue: '',
    previousPlaceholder: undefined
  };

  constructor(public inputElement: HTMLInputElement,
              public config: MaskConfig) {
  }

  update(inputValue: string) {
    let rawValue = inputValue;
    // если `rawValue`` undefined`, получить из `inputElement`
    if (typeof rawValue === 'undefined') {
      rawValue = this.inputElement.value;
    }

    // Если `rawValue` равно` state.previousConformedValue`, нам ничего не нужно менять.
    // Эта проверка предназначена для обработки контролируемых компонентов ангуляра,
    // которые повторяют вызов `update` для каждого рендеринга.
    if (rawValue === this.state.previousConformedValue) {
      return;
    }

    let placeholder;

    let mask;

    // Создание placeholder на основе маски
    if (this.config.mask instanceof Array) {
      placeholder = convertMaskToPlaceholder(this.config.mask, this.config.placeholderChar);
    }

    // В компонентах, которые поддерживают реактивность, можно отключить маскирование,
    // передав `false` для` mask` после инициализации. См. Https://github.com/text-mask/text-mask/pull/359
    if (this.config.mask === false) {
      return;
    }

    // Мы проверяем предоставленный `rawValue` перед тем, как двигаться дальше.
    // Если это что-то, с чем мы не сможем работать, оно будет бросать исключение.

    const safeRawValue = this.getSafeRawValue(rawValue);

    // `selectionEnd` указывает нам, где позиция каретки после ввода пользователем
    const { selectionEnd: currentCaretPosition } = this.inputElement;

    // Запомнить `previousConformedValue` и `previousPlaceholder` с предыдущего вызова `update`
    const { previousConformedValue, previousPlaceholder } = this.state;

    mask = this.config.mask;

    // Объект настроек для conformToMask - функции согласования нового значения с маской
    const conformToMaskConfig: ConformToMaskConfig = {
      guide: this.config.guide,
      previousConformedValue: previousConformedValue,
      placeholderChar: this.config.placeholderChar,
      placeholder: placeholder,
      currentCaretPosition: currentCaretPosition,
      keepCharPositions: this.config.keepCharPositions
    };

    const conformedValue = conformToMask(safeRawValue, mask, conformToMaskConfig);

    // Следующие строки предназначены для поддержки функции `pipe`.
    const piped = typeof this.config.pipe === strFunction;

    let pipeResults: PipeResult = { value: '' };

    // Если `pipe` функция - вызвать её
    if (piped) {
      // `pipe` получает согласованное значение и конфигурацию, с которыми вызывалась` matchingToMask`.
      const pipeResult = this.config.pipe(conformedValue, { rawValue: safeRawValue, ...conformToMaskConfig });

      // `pipeResults` должен быть объектом. Но мы разрешаем автору pipe просто возвращать `false` для предотвращения ввода.
      // Или верните только строку - она будет взята за новое согласованное значение
      // Если `pipe` возвращает` false` или строку, блок ниже превращает его в объект,
      // с которым может работать остальная часть кода.
      if (typeof pipeResult === 'boolean') {
        // Если `pipe` отклоняет согласованное значение, мы используем предыдущее и устанавливаем `reject` в` true`.
        pipeResults = { value: previousConformedValue, rejected: true };
      } else if (typeof pipeResult === 'string') {
        pipeResults = { value: pipeResult };
      } else {
        pipeResults = pipeResult;
      }
    }

    // Если был применён pipe, его результат более приоритетен
    const finalConformedValue = (piped) ? pipeResults.value : conformedValue;

    // После определения согласованного значения нам нужно знать, где установить позицию каретки.
    // `adjustCaretPosition` скажет нам.
    const adjustedCaretPosition = adjustCaretPosition({
      previousConformedValue,
      previousPlaceholder,
      conformedValue: finalConformedValue,
      placeholder,
      rawValue: safeRawValue,
      currentCaretPosition,
      placeholderChar: this.config.placeholderChar,
      indexesOfPipedChars: pipeResults.indexesOfPipedChars
    });

    // Текстовая маска устанавливает пустую строк в значение инпута, когда срабатывает условие ниже. Это обеспечивает лучший UX.
    const inputValueShouldBeEmpty = finalConformedValue === placeholder && adjustedCaretPosition === 0;
    const emptyValue = this.config.showMask ? placeholder : emptyString;
    const inputElementValue = (inputValueShouldBeEmpty) ? emptyValue : finalConformedValue;

    this.state.previousConformedValue = inputElementValue; // сохранить значение для доступа в следующий раз
    this.state.previousPlaceholder = placeholder;

    // В некоторых случаях этот метод `update` будет повторно вызываться с необработанным значением,
    // которое уже было согласовано и установлено в` inputElement.value`.
    // Нижеследующая проверка защищает от необходимости перезаписи состояния инпута. См. Https://github.com/text-mask/text-mask/issues/231
    if (this.inputElement.value === inputElementValue) {
      return;
    }
    // Установка значения в инпут
    this.inputElement.value = inputElementValue;
    // Установка позиции каретки
    this.safeSetSelection(this.inputElement, adjustedCaretPosition);
  }

  getSafeRawValue(inputValue: string): string {
    if (isString(inputValue)) {
      return inputValue;
    } else if (isNumber(inputValue)) {
      return String(inputValue);
    } else if (inputValue === undefined || inputValue === null) {
      return emptyString;
    } else {
      throw new Error(
        `В значении ожидается строка или число, а получено \n\n ${JSON.stringify(inputValue)}`
      );
    }
  }

  safeSetSelection(element: HTMLInputElement, selectionPosition: number): void {
    if (document.activeElement === element) {
      if (isAndroid) {
        this.defer(() => element.setSelectionRange(selectionPosition, selectionPosition, strNone), 0);
      } else {
        element.setSelectionRange(selectionPosition, selectionPosition, strNone);
      }
    }
  }

  defer(arg, time): number {
    if (typeof requestAnimationFrame !== 'undefined') {
      return requestAnimationFrame(arg);
    } else {
      return setTimeout(arg, time);
    }
  }

}
