@Database(
    entities = [NoteEntity::class, TagEntity::class],
    version = 3,
    exportSchema = true,                            // commit app/schemas/*.json
    autoMigrations = [AutoMigration(from = 1, to = 2)],   // adds the pinned column
)
abstract class AppDatabase : RoomDatabase()

val MIGRATION_2_3 = object : Migration(2, 3) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("CREATE TABLE tags (noteId TEXT NOT NULL, name TEXT NOT NULL, PRIMARY KEY(noteId, name))")
        db.query("SELECT id, tags FROM notes").use { c ->
            while (c.moveToNext()) {
                val id = c.getString(0)
                c.getString(1).orEmpty().split(',').map(String::trim).filter(String::isNotEmpty).forEach { tag ->
                    db.execSQL("INSERT OR IGNORE INTO tags VALUES (?, ?)", arrayOf(id, tag))
                }
            }
        }
        db.execSQL("ALTER TABLE notes DROP COLUMN tags")
    }
}

@RunWith(AndroidJUnit4::class)
class MigrationTest {
    @get:Rule val helper = MigrationTestHelper(InstrumentationRegistry.getInstrumentation(), AppDatabase::class.java)

    @Test fun tagsSurviveMigration2To3() {
        helper.createDatabase("test.db", 2).use {
            it.execSQL("INSERT INTO notes (id, title, body, updatedAt, pinned, tags) VALUES ('n1', 'T', 'B', 0, 0, 'work, home')")
        }
        val db = helper.runMigrationsAndValidate("test.db", 3, true, MIGRATION_2_3)
        db.query("SELECT COUNT(*) FROM tags").use { it.moveToFirst(); assertEquals(2, it.getInt(0)) }
    }
}
