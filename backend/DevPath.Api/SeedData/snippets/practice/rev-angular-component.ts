@Component({
  selector: 'app-orders',
  template: `
    <h2>Orders ({{ total() }})</h2>
    @for (o of orders; track $index) {
      <div>{{ o.customer }} — {{ o.amount }} <button (click)="del(o.id)">x</button></div>
    }
  `,
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  constructor(private http: HttpClient) {}

  ngOnInit() {
    interval(5000).subscribe(() =>
      this.http.get<any[]>('http://localhost:5080/api/orders').subscribe(r => (this.orders = r)));
  }
  total() { return this.orders.reduce((s, o) => s + o.amount, 0); }
  del(id: number) { this.http.delete('http://localhost:5080/api/orders/' + id).subscribe(); }
}
