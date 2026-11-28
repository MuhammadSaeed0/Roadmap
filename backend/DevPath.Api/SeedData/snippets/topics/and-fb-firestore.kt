data class Task(
    @DocumentId val id: String = "",
    val title: String = "",
    val done: Boolean = false,
    val position: Long = 0,
    @ServerTimestamp val updatedAt: Timestamp? = null,
)

class TaskRepository(private val db: FirebaseFirestore) {
    private fun tasks(boardId: String) = db.collection("boards").document(boardId).collection("tasks")

    fun observe(boardId: String): Flow<List<Task>> =
        tasks(boardId).orderBy("position").limit(100)
            .snapshots()                                 // real-time, served from cache when offline
            .map { snap -> snap.toObjects<Task>() }

    suspend fun add(boardId: String, title: String, position: Long) {
        tasks(boardId).add(Task(title = title, position = position)).await()   // queued offline
    }

    suspend fun claim(boardId: String, taskId: String, uid: String) = db.runTransaction { tx ->
        val ref = tasks(boardId).document(taskId)
        val owner = tx.get(ref).getString("owner")
        check(owner == null) { "Already claimed" }
        tx.update(ref, "owner", uid)
    }.await()
}

// firestore.rules (excerpt)
// match /boards/{boardId}/tasks/{taskId} {
//   allow read, write: if request.auth != null
//     && request.auth.uid in get(/databases/$(database)/documents/boards/$(boardId)).data.members;
// }
