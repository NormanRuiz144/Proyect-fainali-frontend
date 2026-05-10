import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InteractionComponent } from './shared/component/interaction.ts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InteractionComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('proyecto_final_frontend');
}
