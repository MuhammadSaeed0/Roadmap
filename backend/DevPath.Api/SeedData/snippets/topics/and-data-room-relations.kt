@Entity(tableName = "orders")
data class OrderEntity(@PrimaryKey val id: Long, val placedAt: Instant)

@Entity(
    tableName = "order_items",
    foreignKeys = [ForeignKey(OrderEntity::class, ["id"], ["orderId"], onDelete = ForeignKey.CASCADE)],
    indices = [Index("orderId")],
)
data class OrderItemEntity(@PrimaryKey(autoGenerate = true) val id: Long = 0, val orderId: Long, val name: String, val qty: Int)

data class OrderWithItems(
    @Embedded val order: OrderEntity,
    @Relation(parentColumn = "id", entityColumn = "orderId") val items: List<OrderItemEntity>,
)

class Converters {
    @TypeConverter fun toInstant(ms: Long?): Instant? = ms?.let(Instant::ofEpochMilli)
    @TypeConverter fun fromInstant(i: Instant?): Long? = i?.toEpochMilli()
}

@Dao
interface OrderDao {
    @Transaction
    @Query("SELECT * FROM orders WHERE id = :id")
    fun observe(id: Long): Flow<OrderWithItems?>

    @Insert suspend fun insertOrder(o: OrderEntity)
    @Insert suspend fun insertItems(items: List<OrderItemEntity>)

    @Transaction                                    // all or nothing
    suspend fun save(order: OrderEntity, items: List<OrderItemEntity>) {
        insertOrder(order)
        insertItems(items)
    }
}
