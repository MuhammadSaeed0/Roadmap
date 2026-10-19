@Component({
  selector: 'app-card',
  template: `
    <section class="card">
      <header><ng-content select="[card-title]" /></header>
      <div class="body"><ng-content /></div>
      <footer><ng-content select="[card-actions]" /></footer>
    </section>
  `,
  styles: `.card { border-radius: var(--radius); background: var(--surface); }`,
})
export class CardComponent {}

// Usage:
// <app-card>
//   <h3 card-title>Low stock</h3>
//   <p>5 products need reordering.</p>
//   <button card-actions type="button">Reorder</button>
// </app-card>
