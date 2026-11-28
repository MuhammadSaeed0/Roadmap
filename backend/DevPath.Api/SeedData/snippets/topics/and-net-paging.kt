@OptIn(ExperimentalPagingApi::class)
class PhotoMediator(private val db: AppDatabase, private val api: PhotoApi) : RemoteMediator<Int, PhotoEntity>() {

    override suspend fun load(loadType: LoadType, state: PagingState<Int, PhotoEntity>): MediatorResult {
        val cursor = when (loadType) {
            LoadType.REFRESH -> null
            LoadType.PREPEND -> return MediatorResult.Success(endOfPaginationReached = true)
            LoadType.APPEND -> db.remoteKeys().next() ?: return MediatorResult.Success(endOfPaginationReached = true)
        }
        return try {
            val page = api.photos(cursor = cursor, limit = state.config.pageSize)
            db.withTransaction {
                if (loadType == LoadType.REFRESH) { db.photos().clear(); db.remoteKeys().clear() }
                db.remoteKeys().save(page.nextCursor)
                db.photos().insertAll(page.items.map { it.toEntity() })
            }
            MediatorResult.Success(endOfPaginationReached = page.nextCursor == null)
        } catch (e: IOException) {
            MediatorResult.Error(e)
        }
    }
}

class FeedViewModel(db: AppDatabase, api: PhotoApi) : ViewModel() {
    @OptIn(ExperimentalPagingApi::class)
    val photos: Flow<PagingData<Photo>> = Pager(
        config = PagingConfig(pageSize = 30),
        remoteMediator = PhotoMediator(db, api),
        pagingSourceFactory = { db.photos().pagingSource() },
    ).flow.map { data -> data.map { it.toDomain() } }.cachedIn(viewModelScope)
}

@Composable
fun Feed(vm: FeedViewModel) {
    val items = vm.photos.collectAsLazyPagingItems()
    LazyColumn {
        items(items.itemCount, key = items.itemKey { it.id }) { i -> items[i]?.let { PhotoRow(it) } }
        if (items.loadState.append is LoadState.Error) item { RetryRow(onRetry = items::retry) }
    }
}
