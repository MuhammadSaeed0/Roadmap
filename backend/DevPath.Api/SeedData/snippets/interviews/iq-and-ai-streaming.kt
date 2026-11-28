// Challenge: complete parse() so it turns SSE lines into text deltas and stops at [DONE].
fun parse(lines: Sequence<String>): Sequence<String> = sequence {
    for (line in lines) {
        if (!line.startsWith("data: ")) continue          // ignore comments, ids, blank lines
        val data = line.removePrefix("data: ").trim()
        if (data == "[DONE]") return@sequence
        yield(Json.decodeFromString<Delta>(data).text)
    }
}

@Test fun parsesDeltasAndStopsAtDone() {
    val lines = sequenceOf("data: {\"text\":\"Hel\"}", "", "data: {\"text\":\"lo\"}", "data: [DONE]", "data: {\"text\":\"x\"}")
    assertEquals(listOf("Hel", "lo"), parse(lines).toList())
}
