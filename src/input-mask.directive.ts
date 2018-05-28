import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {InputmaskMaskFormat, InputmaskPipe, InputmaskPreset, MaskConfig} from './interfaces';
import {InputMaskElement} from './input-mask-element';

const NOOP = () => {
};
const CHANGE_FUNCTION = (value: string) => {
};

@Directive({
  selector: '[inputMask]',
  exportAs: 'inputMask',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputMaskDirective), multi: true }
  ]
})
export class InputMaskDirective implements ControlValueAccessor, OnChanges {

  textMaskConfig: MaskConfig = {
    mask: undefined,
    guide: false,
    placeholderChar: '_',
    pipe: undefined,
    keepCharPositions: false
  };

  @Input()
  set inputMask(mask: InputmaskMaskFormat) {
    this.textMaskConfig.mask = mask;
  }

  @Input()
  set inputMaskPipe(pipe: InputmaskPipe) {
    this.textMaskConfig.pipe = pipe;
  }

  @Input()
  set inputMaskPreset(preset: InputmaskPreset) {
    this.inputMask = preset.mask;
    if (preset.pipe) {
      this.inputMaskPipe = preset.pipe;
    }
    if (preset.guide !== undefined) {
      this.textMaskConfig.guide = preset.guide;
    }
    if (preset.keepCharPositions !== undefined) {
      this.textMaskConfig.keepCharPositions = preset.keepCharPositions;
    }
    if (preset.placeholderChar) {
      this.textMaskConfig.placeholderChar = preset.placeholderChar;
    }
  }

  private textMaskInputElement: InputMaskElement;

  private inputElement: HTMLInputElement;
  // сохраняет последнее значение для сравнения
  private lastValue: string;

  private propagateTouched = NOOP;

  private propagateChange = CHANGE_FUNCTION;

  constructor(private renderer: Renderer2,
              private element: ElementRef) {
  }

  @HostListener('input') onInput(value: string): void {
    this.setValue(value);
  }

  @HostListener('blur') onBlur(): void {
    this.propagateTouched();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setupMask(true);
    if (this.textMaskInputElement !== undefined) {
      this.textMaskInputElement.update(this.inputElement.value);
    }
  }

  writeValue(value: string): void {
    this.setupMask(true);
    // установить начальное значение для случаев, когда маска отключена
    const normalizedValue = value == null ? '' : value;
    this.renderer.setProperty(this.inputElement, 'value', normalizedValue);

    if (this.textMaskInputElement !== undefined) {
      this.textMaskInputElement.update(value);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.propagateTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.renderer.setProperty(this.element.nativeElement, 'disabled', isDisabled);
  }

  setValue(value: string): void {
    this.setupMask(true);

    if (this.textMaskInputElement !== undefined) {
      this.textMaskInputElement.update(value);

      // обновленное значение
      const currentValue = this.inputElement.value;

      // Если новое значение отличается от старого, вызов ngModelChange
      if (this.lastValue !== currentValue) {
        this.lastValue = currentValue;
        this.propagateChange(currentValue);
      }
    }
  }

  private setupMask(create: boolean = false): void {
    if (!this.inputElement) {
      if (this.element.nativeElement.tagName === 'INPUT') {
        this.inputElement = this.element.nativeElement;
      } else {
        //  Когда директива используется для враппера инпута
        this.inputElement = this.element.nativeElement.getElementsByTagName('INPUT')[0];
      }
    }

    if (this.inputElement && create && !this.textMaskInputElement) {
      this.textMaskInputElement = new InputMaskElement(this.inputElement, this.textMaskConfig);
    }

  }

}
