class TaskRepository(
    private val db: AppDatabase,
    private val api: TaskApi,
    private val work: WorkManager,
) {
    // The UI only ever reads from Room.
    fun observeTasks(): Flow<List<Task>> = db.tasks().observeAll().map { rows -> rows.map { it.toDomain() } }

    suspend fun refresh() {
        val since = db.syncState().token()
        val changes = api.changesSince(since)                     // incremental pull
        db.withTransaction {
            db.tasks().upsertAll(changes.updated.map { it.toEntity() })
            db.tasks().deleteByIds(changes.deletedIds)            // server tombstones
            db.syncState().save(changes.nextToken)
        }
    }

    suspend fun complete(id: String) {
        db.withTransaction {                                      // local first, in one transaction
            db.tasks().markDone(id, updatedAt = System.currentTimeMillis())
            db.outbox().add(OutboxEntry(entityId = id, op = "complete"))
        }
        work.enqueueUniqueWork(
            "sync", ExistingWorkPolicy.REPLACE,
            OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))
                .build(),
        )
    }
}
