import { Component } from '@angular/core';
import { computed, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  template: `
    <h1>To do ({{ remaining() }} left)</h1>
    <input #title placeholder="New task"> <button type="button" (click)="add(title.value); title.value = ''">Add</button>
    <ul>
      @for (t of tasks(); track t.id) {
        <li (click)="toggle(t.id)" [style.text-decoration]="t.done ? 'line-through' : 'none'">{{ t.title }}</li>
      }
    </ul>
  `,
})
export class AppComponent {
  readonly tasks = signal([{ id: 1, title: 'Learn signals', done: false }]);
  readonly remaining = computed(() => this.tasks().filter(t => !t.done).length);

  add(title: string): void {
    if (!title.trim()) return;
    this.tasks.update(list => [...list, { id: Date.now(), title, done: false }]);
  }

  toggle(id: number): void {
    this.tasks.update(list => list.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }
}
