// environment-like config in one place
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => 'http://localhost:5080/api',
});

@Injectable({ providedIn: 'root' })
export class TopicsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  complete(topicId: number) {
    // Angular → PUT /api/topics/12/progress → TopicService → EF Core → UPDATE TopicProgress ...
    return this.http.put(`${this.base}/topics/${topicId}/progress`, {
      status: 'Completed', knowledge: 'Unassessed', confidence: 3,
    });
  }
}
