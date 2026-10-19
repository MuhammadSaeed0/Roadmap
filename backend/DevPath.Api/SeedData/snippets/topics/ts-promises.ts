function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

fetch('/api/health')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(body => console.log(body.status))
  .catch(error => console.error('Request failed', error))
  .finally(() => console.log('done'));

// Like Task.WhenAll
const [topics, progress] = await Promise.all([loadTopics(), loadProgress()]);
