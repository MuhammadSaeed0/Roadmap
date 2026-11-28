class TripPlanner(private val flags: RemoteConfigFlags) {
    // Model name and instruction come from Remote Config, so they change without a release.
    private val model = Firebase.ai(backend = GenerativeBackend.googleAI()).generativeModel(
        modelName = flags.aiModelName,                               // e.g. a current Gemini Flash model
        systemInstruction = content { text(flags.tripSystemInstruction) },
        generationConfig = generationConfig {
            responseMimeType = "application/json"
            responseSchema = Schema.obj(mapOf(
                "stops" to Schema.array(Schema.obj(mapOf(
                    "time" to Schema.string(), "place" to Schema.string(), "why" to Schema.string(),
                ))),
            ))
        },
    )

    suspend fun plan(city: String, interests: List<String>): TripPlan {
        val response = model.generateContent("City: $city. Interests: ${interests.joinToString()}.")
        return Json.decodeFromString(response.text ?: error("Empty response"))     // validate the shape
    }

    fun streamTips(city: String): Flow<String> =
        model.generateContentStream("Three short tips for a first visit to $city.").map { it.text.orEmpty() }
}

// App Check must be installed and enforced for the AI service (see the Firebase setup topic).
