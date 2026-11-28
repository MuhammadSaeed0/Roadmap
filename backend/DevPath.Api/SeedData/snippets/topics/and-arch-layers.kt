// UI layer: renders state, sends events.
@Composable
fun ArticlesScreen(vm: ArticlesViewModel = hiltViewModel()) {
    val state by vm.state.collectAsStateWithLifecycle()
    ArticlesContent(state, onBookmark = vm::onBookmark, onRefresh = vm::onRefresh)
}

// UI layer: turns data into screen state.
@HiltViewModel
class ArticlesViewModel @Inject constructor(private val getFeed: GetFeedUseCase, private val articles: ArticlesRepository) : ViewModel() {
    val state = getFeed().map { ArticlesUiState(it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ArticlesUiState(loading = true))
    fun onBookmark(id: String) = viewModelScope.launch { articles.toggleBookmark(id) }
    fun onRefresh() = viewModelScope.launch { articles.refresh() }
}

// Domain layer (optional): a rule shared by several screens.
class GetFeedUseCase @Inject constructor(private val articles: ArticlesRepository, private val bookmarks: BookmarksRepository) {
    operator fun invoke(): Flow<List<FeedItem>> =
        combine(articles.observeArticles(), bookmarks.observeIds()) { list, saved -> list.map { FeedItem(it, it.id in saved) } }
}

// Data layer: hides where data comes from.
interface ArticlesRepository {
    fun observeArticles(): Flow<List<Article>>
    suspend fun refresh()
    suspend fun toggleBookmark(id: String)
}
