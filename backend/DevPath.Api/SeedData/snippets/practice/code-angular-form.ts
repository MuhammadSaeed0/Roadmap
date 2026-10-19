@Component({
  selector: 'app-customer-form',
  imports: [ReactiveFormsModule],
  template: `
    <form>
      <!-- TODO: name, email, phone with validation messages -->
      <button type="submit">Save</button>
    </form>
  `,
})
export class CustomerFormComponent {
  readonly saving = signal(false);
  // TODO: form definition and submit()
}
