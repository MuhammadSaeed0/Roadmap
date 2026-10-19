import { firstValueFrom } from 'rxjs';

async function loadDashboard(http: HttpClient): Promise<Dashboard | null> {
  try {
    // Await an Observable that emits once (HttpClient requests do)
    return await firstValueFrom(http.get<Dashboard>('/api/dashboard'));
  } catch (error) {
    console.error('Could not load the dashboard', error);
    return null;
  }
}

// Sequential (slow): each waits for the previous
const a = await fetchA();
const b = await fetchB();

// Concurrent (fast): start both, then wait
const [x, y] = await Promise.all([fetchA(), fetchB()]);
