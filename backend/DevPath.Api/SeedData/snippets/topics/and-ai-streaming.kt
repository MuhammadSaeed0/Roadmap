// Parse a server-sent events stream into text deltas.
fun OkHttpClient.streamAnswer(url: String, body: RequestBody): Flow<String> = callbackFlow {
    val call = newCall(Request.Builder().url(url).post(body).header("Accept", "text/event-stream").build())
    launch(Dispatchers.IO) {
        try {
            call.execute().use { response ->
                if (!response.isSuccessful) throw HttpException(response.code)
                val source = response.body!!.source()
                while (!source.exhausted()) {
                    val line = source.readUtf8Line() ?: break
                    if (line.startsWith("data: ")) {
                        val data = line.removePrefix("data: ")
                        if (data == "[DONE]") break
                        send(Json.decodeFromString<Delta>(data).text)
                    }
                }
            }
            close()
        } catch (e: Exception) { close(e) }
    }
    awaitClose { call.cancel() }                 // Stop button -> connection closed -> server stops
}

class AssistantViewModel(private val repo: AssistantRepository) : ViewModel() {
    private val _answer = MutableStateFlow(AnswerUi())
    val answer = _answer.asStateFlow()
    private var job: Job? = null

    fun ask(question: String) {
        job?.cancel()
        job = viewModelScope.launch {
            _answer.value = AnswerUi(streaming = true)
            repo.stream(question)
                .chunked(50.milliseconds)               // fewer recompositions
                .catch { e -> _answer.update { it.copy(error = e.toAiError()) } }
                .onCompletion { _answer.update { it.copy(streaming = false) } }
                .collect { parts -> _answer.update { it.copy(text = it.text + parts.joinToString("")) } }
        }
    }

    fun stop() = job?.cancel()
}
