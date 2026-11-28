@Entity(tableName = "messages", indices = [Index("chatId")])
data class MessageEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val chatId: String,
    val role: Role,                           // USER or ASSISTANT
    val content: String,
    val state: MessageState,                  // SENDING, STREAMING, DONE, FAILED, STOPPED
    val createdAt: Long,
    val feedback: Int? = null,                // +1, -1 or null
)

class ChatRepository(private val dao: MessageDao, private val ai: AssistantRepository) {
    fun messages(chatId: String): Flow<List<MessageEntity>> = dao.observe(chatId)

    suspend fun send(chatId: String, text: String) {
        val now = System.currentTimeMillis()
        dao.insert(MessageEntity(chatId = chatId, role = Role.USER, content = text, state = MessageState.DONE, createdAt = now))
        val reply = MessageEntity(chatId = chatId, role = Role.ASSISTANT, content = "", state = MessageState.STREAMING, createdAt = now + 1)
        dao.insert(reply)
        val history = dao.lastTurns(chatId, limit = 10)               // trimmed context
        try {
            ai.stream(history).collect { delta -> dao.appendContent(reply.id, delta) }
            dao.setState(reply.id, MessageState.DONE)
        } catch (e: CancellationException) {
            dao.setState(reply.id, MessageState.STOPPED); throw e
        } catch (e: Exception) {
            dao.setState(reply.id, MessageState.FAILED)
        }
    }
}
