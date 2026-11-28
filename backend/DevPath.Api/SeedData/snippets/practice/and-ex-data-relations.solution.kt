@Entity(
    tableName = "order_items",
    foreignKeys = [ForeignKey(OrderEntity::class, ["id"], ["orderId"], onDelete = ForeignKey.CASCADE)],
    indices = [Index("orderId")],
)
data class OrderItemEntity(@PrimaryKey(autoGenerate = true) val id: Long = 0, val orderId: Long, val name: String)

@Dao
interface OrderDao {
    @Transaction
    @Query("SELECT * FROM orders WHERE id = :id")
    fun observe(id: Long): Flow<OrderWithItems?>

    @Insert suspend fun insertOrder(o: OrderEntity)
    @Insert suspend fun insertItems(items: List<OrderItemEntity>)

    @Transaction
    suspend fun save(order: OrderEntity, items: List<OrderItemEntity>) {
        insertOrder(order)
        insertItems(items)
    }
}
