// Design for testability: dependencies and time come in through the constructor.
class ReminderScheduler(
    private val repo: ReminderRepository,          // interface: real or fake
    private val clock: Clock,                      // java.time.Clock, fixed in tests
    private val io: CoroutineDispatcher,
) {
    suspend fun due(): List<Reminder> = withContext(io) {
        repo.all().filter { it.at <= clock.instant() }
    }
}

// A fake: a tiny working implementation, not a mock.
class FakeReminderRepository : ReminderRepository {
    val items = mutableListOf<Reminder>()
    var failWith: Exception? = null
    override suspend fun all(): List<Reminder> { failWith?.let { throw it }; return items.toList() }
}

@Test fun returnsOnlyDueReminders() = runTest {
    val now = Instant.parse("2026-11-28T09:00:00Z")
    val repo = FakeReminderRepository().apply {
        items += Reminder("a", at = now.minusSeconds(60))
        items += Reminder("b", at = now.plusSeconds(60))
    }
    val scheduler = ReminderScheduler(repo, Clock.fixed(now, ZoneOffset.UTC), StandardTestDispatcher(testScheduler))
    assertEquals(listOf("a"), scheduler.due().map { it.id })
}
