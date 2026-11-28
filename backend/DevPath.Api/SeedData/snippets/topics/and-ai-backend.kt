// App side: one endpoint per feature, the user's token, never a provider key.
interface AiApi {
    @POST("ai/summarise")
    suspend fun summarise(@Body body: SummariseRequest): SummaryDto      // { noteId }
}

class SummaryRepository(private val api: AiApi) {
    suspend fun summarise(noteId: String): Result<String, AiError> = try {
        Result.Ok(api.summarise(SummariseRequest(noteId)).summary)
    } catch (e: HttpException) {
        Result.Err(when (e.code()) {
            429 -> AiError.QuotaReached          // per-user limit on the server
            422 -> AiError.Blocked               // safety filter
            503 -> AiError.Busy
            else -> AiError.Unknown
        })
    }
}

// Server side (Ktor, sketch): auth, quota, fixed prompt, secret key, max tokens.
// post("/ai/summarise") {
//     val uid = call.verifiedUid()                                   // Firebase ID token
//     if (!quota.tryConsume(uid, feature = "summarise")) return@post call.respond(HttpStatusCode.TooManyRequests)
//     val note = notes.load(uid, call.receive<SummariseRequest>().noteId)
//     val text = llm.complete(
//         system = "Summarise the user's note in at most 5 bullet points. Plain text.",
//         user = note.body, maxOutputTokens = 300, apiKey = secrets["LLM_API_KEY"])
//     usage.record(uid, "summarise", text.inputTokens, text.outputTokens)
//     call.respond(SummaryDto(text.content))
// }
