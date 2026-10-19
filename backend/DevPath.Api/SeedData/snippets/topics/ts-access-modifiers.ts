@Component({
  selector: 'app-topic-list',
  template: `@for (t of topics(); track t.id) { <li>{{ t.titleEn }}</li> }`,
})
export class TopicListComponent {
  private readonly api = inject(ApiService);          // internal: template can't use it
  protected readonly topics = signal<TopicSummary[]>([]);   // template needs it

  #cache = new Map<number, TopicSummary>();           // truly private at runtime too

  protected async refresh(): Promise<void> {
    this.topics.set(await this.api.getTopics());
  }
}
