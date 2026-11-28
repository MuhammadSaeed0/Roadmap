@Entity(tableName = "notes", indices = [Index("updatedAt")])
data class NoteEntity(
    @PrimaryKey val id: String,
    val title: String,
    val body: String,
    val updatedAt: Long,
)

@Dao
interface NoteDao {
    @Query("SELECT * FROM notes ORDER BY updatedAt DESC")
    fun observeAll(): Flow<List<NoteEntity>>            // emits again after every change

    @Query("SELECT * FROM notes WHERE title LIKE '%' || :q || '%'")
    suspend fun search(q: String): List<NoteEntity>

    @Upsert suspend fun upsert(note: NoteEntity)

    @Query("DELETE FROM notes WHERE id = :id")
    suspend fun deleteById(id: String)
}

@Database(entities = [NoteEntity::class], version = 1, exportSchema = true)
abstract class AppDatabase : RoomDatabase() {
    abstract fun notes(): NoteDao
}

// Built once, for example in a Hilt @Singleton provider.
val db = Room.databaseBuilder(context, AppDatabase::class.java, "app.db").build()
