object RatePrompter {
    fun shouldPrompt(): Boolean {
        val prefs = App.instance.getSharedPreferences("rate", Context.MODE_PRIVATE)
        if (prefs.getBoolean("declined", false)) return false
        val sessions = prefs.getInt("sessions", 0) + 1
        val first = prefs.getLong("first", System.currentTimeMillis())
        prefs.edit().putInt("sessions", sessions).putLong("first", first).apply()
        val days = (System.currentTimeMillis() - first) / 86_400_000
        return sessions >= 5 && days >= 3
    }
}
