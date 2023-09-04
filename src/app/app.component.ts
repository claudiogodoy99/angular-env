import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  template: `Variavel de ambiente = {{variavel}}`,
})
export class AppComponent{
  variavel = environment.variavel;
}
