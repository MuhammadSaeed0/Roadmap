interface ProductRepository {
    fun observeProduct(id: Int): Flow<Product?>
    suspend fun refreshProduct(id: Int): Result<Unit>
}

class OfflineFirstProductRepository @Inject constructor(
    private val dao: ProductDao,                // local: the single source of truth
    private val api: ShopApi,                   // remote
    @IoDispatcher private val io: CoroutineDispatcher,
) : ProductRepository {

    override fun observeProduct(id: Int): Flow<Product?> =
        dao.observe(id).map { it?.toDomain() }

    override suspend fun refreshProduct(id: Int): Result<Unit> = withContext(io) {
        runCatching {
            val dto = api.product(id)               // ProductDto from JSON
            dao.upsert(dto.toEntity())              // the UI updates through observeProduct
        }.onFailure { if (it is CancellationException) throw it }
    }
}

private fun ProductEntity.toDomain() = Product(id, name, priceCents / 100.0)
private fun ProductDto.toEntity() = ProductEntity(id, title, (price * 100).roundToInt())
