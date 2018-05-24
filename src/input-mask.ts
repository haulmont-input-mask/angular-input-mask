import { NgModule } from '@angular/core';
import { InputMaskDirective } from './input-mask.directive';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    InputMaskDirective
  ],
  exports: [
    InputMaskDirective
  ]
})
export class InputMaskModule {
}
