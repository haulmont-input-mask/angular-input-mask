import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputMaskModule} from '../../../src/input-mask';
import {KaInputComponent} from './input/input.component';


@NgModule({
  declarations: [
    AppComponent,
    KaInputComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    InputMaskModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
