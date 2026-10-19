// Shared state lives in a service; any component can read or change it
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<{ id: number; text: string; kind: 'success' | 'error' }[]>([]);
  private nextId = 1;

  show(text: string, kind: 'success' | 'error' = 'success'): void {
    const id = this.nextId++;
    this.toasts.update(t => [...t, { id, text, kind }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}

// A page:   inject(ToastService).show('Saved');
// The shell renders:  @for (t of toasts.toasts(); track t.id) { <div>{{ t.text }}</div> }
