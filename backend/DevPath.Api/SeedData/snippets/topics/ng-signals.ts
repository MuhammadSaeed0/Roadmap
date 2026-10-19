import { Component, computed, effect, signal } from '@angular/core';

@Component({
  selector: 'app-topic-filter',
  template: `
    <input [value]="query()" (input)="query.set($any($event.target).value)" placeholder="Filter…" />
    <p>{{ filtered().length }} of {{ topics().length }} topics</p>
  `,
})
export class TopicFilterComponent {
  readonly topics = signal<{ id: number; title: string }[]>([]);
  readonly query = signal('');

  // Recomputed only when topics() or query() change
  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    return this.topics().filter(t => t.title.toLowerCase().includes(q));
  });

  constructor() {
    // Side effect: keep the last query in localStorage
    effect(() => localStorage.setItem('lastQuery', this.query()));
  }
}
