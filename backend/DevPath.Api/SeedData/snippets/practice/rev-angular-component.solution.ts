@Component({
  selector: 'app-orders',
  template: `
    <h2>Orders ({{ total() }})</h2>
    @if (state().kind === 'loading') { <app-skeleton /> }
    @else if (state().kind === 'error') { <app-error-state (retry)="reload()" /> }
    @else if (orders().length === 0) { <app-empty-state /> }
    @else {
      @for (o of orders(); track o.id) {
        <app-order-row [order]="o" (delete)="confirmDelete(o)" />
      }
    }
  `,
})
export class OrdersComponent {
  private readonly api = inject(OrdersApi);            // typed service, base URL configured once
  readonly orders = signal<OrderListItem[]>([]);
  readonly state = signal<{ kind: 'loading' | 'ready' | 'error' }>({ kind: 'loading' });
  readonly total = computed(() => this.orders().reduce((s, o) => s + o.amount, 0));

  constructor() {
    interval(5000).pipe(startWith(0), switchMap(() => this.api.list()), takeUntilDestroyed())
      .subscribe({ next: r => { this.orders.set(r); this.state.set({ kind: 'ready' }); },
                   error: () => this.state.set({ kind: 'error' }) });
  }
}
