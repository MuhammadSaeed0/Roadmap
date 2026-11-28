class WritingAssistant {
    private val client = OkHttpClient()

    suspend fun improve(text: String, tone: String): String = withContext(Dispatchers.IO) {
        val body = """{"model":"big-model","messages":[
            {"role":"system","content":"You are a writing assistant. Tone: $tone"},
            {"role":"user","content":${Json.encodeToString(text)}}]}"""
        val request = Request.Builder()
            .url("https://api.provider.example/v1/chat")
            .header("Authorization", "Bearer ${BuildConfig.PROVIDER_KEY}")
            .post(body.toRequestBody("application/json".toMediaType()))
            .build()
        val response = client.newCall(request).execute()
        if (!response.isSuccessful) error(response.body!!.string())     // shown to the user
        Json.parseToJsonElement(response.body!!.string()).jsonObject["text"]!!.jsonPrimitive.content
    }
}
