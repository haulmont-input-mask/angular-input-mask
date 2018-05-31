import { Component, ElementRef, forwardRef, HostBinding, HostListener, Input } from '@angular/core';
import { BaseInput } from './base-input';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputmaskPipe } from '../../../../src';

const NOOP = _ => {
};

type ChangeValueListener = (value: string) => void;
type TouchInputListener = () => void;

@Component({
  selector: 'ka-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => KaInputComponent), multi: true },
    { provide: BaseInput, useExisting: KaInputComponent }
  ]
})
export class KaInputComponent extends BaseInput implements ControlValueAccessor {

  value: string;

  error: string;

  @Input() type: string = 'text';

  @Input() placeholder: string = '';

  @Input() icon: string = null;

  @Input() max: number;

  readonly inputMinimalWidth = 150;

  readonly radix = 10;

  private propagateChange = NOOP;

  constructor(element: ElementRef) {
    super(element);
  }

  writeValue(value: string): void {
    this.value = value;
  }

  @HostBinding('class.include-icon') get includeIcon(): boolean {
    return !!this.icon;
  }

  @HostListener('input') update(): void {
    this.updateValue(this.value);
  }

  updateValue(value: string): void {
    this.value = value;
    this.propagateChange(value);
    super.onChangeComponent();
  }

  registerOnChange(fn: ChangeValueListener): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fb: TouchInputListener): void {
  }

  get minimalWidth(): number {
    return this.inputMinimalWidth;
  }

  get isShowReset(): boolean {
    return !!this.value && !this.disabled;
  }

  numberMask(max: number): (string | RegExp)[] {
    const mask = [];
    const length = max.toString().length;
    for (let i = 0; i < length; i++) {
      mask.push(/[0-9]/);
    }
    return mask;
  }

  pipeNumber(max: number): InputmaskPipe {
    return function(value: string): string | boolean {
      if (parseInt(value, this.radix) > max) {
        return max.toString();
      } else {
        return value;
      }
    };
  }

}
