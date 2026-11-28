data class ReaderSettings(val darkTheme: Boolean = false, val fontScale: Float = 1f)

private val Context.dataStore by preferencesDataStore(
    name = "settings",
    produceMigrations = { ctx -> listOf(SharedPreferencesMigration(ctx, "legacy_prefs")) },
)

class SettingsRepository(private val store: DataStore<Preferences>) {
    private object Keys {
        val DARK = booleanPreferencesKey("dark_theme")
        val FONT = floatPreferencesKey("font_scale")
    }

    val settings: Flow<ReaderSettings> = store.data
        .catch { e -> if (e is IOException) emit(emptyPreferences()) else throw e }
        .map { p -> ReaderSettings(p[Keys.DARK] ?: false, p[Keys.FONT] ?: 1f) }

    suspend fun setDarkTheme(enabled: Boolean) {
        store.edit { it[Keys.DARK] = enabled }      // atomic read-modify-write
    }
}
