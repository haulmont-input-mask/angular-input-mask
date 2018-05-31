import { AfterViewInit, ContentChild, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { FormControlName } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export interface TimeDto {
  hour: number;
  minute: number;
}

const ERRORS_BY_PRIORITY = [
  'required',
  'minlength',
  'maxlength',
];

export abstract class BaseInput implements AfterViewInit {

  @ContentChild(FormControlName) control: FormControlName;

  name: string;

  formName: string;

  value: string | TimeDto;

  protected errorCode: string;

  protected sizeSubject = new Subject();

  private _disabled: boolean = false;

  @Input()
  @HostBinding('class.flat-item') flat: boolean = false;

  @Input()
  set disabled(isDisabled: boolean){
    this.setDisabledState(isDisabled);
  }
  get disabled(): boolean {
    return this._disabled;
  }

  constructor(protected element: ElementRef) {
  }

  @HostListener('change') onChangeComponent(): void {
    this.resetError();
  }

  @HostBinding('class.ka-valid-error') get checkValid(): boolean {
    return !!this.error;
  }

  get error(): string {
    return (this.errorCode) ? this.getErrorMessage(this.errorCode, this.name) : this.getErrorMessage(this.checkInvalid(), this.name);
  }

  set error(code: string) {
    this.errorCode = code;
  }

  resetError(): void {
    this.error = null;
  }

  checkInvalid(): string {
    return this.control && this.control.invalid && this.control.dirty
      ? this.getErrorCode()
      : null;
  }

  ngAfterViewInit(): void {
    this.registerName();
  }

  registerName(): void {
    if (this.control) {
      this.name = this.control.path.join('.');
    }
  }

  getErrorMessage(code: string, fieldName?: string): string {
    return null;
  }

  get minimalWidth(): number {
    return this.element.nativeElement.offsetWidth;
  }

  get width(): number {
    return this.element.nativeElement.offsetWidth;
  }

  get elementRef(): ElementRef {
    return this.element;
  }

  get changeSize(): Observable<{}> {
    return this.sizeSubject.asObservable();
  }

  close(): void {}

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
    if (this.control) {
      this.control.isDisabled = true;
    }
  }

  private getErrorCode(): string {
    for (const error of ERRORS_BY_PRIORITY) {
      if (error in this.control.errors) {
        return error;
      }
    }

    return 'required';
  }
}
