data class OrdersUiState(
    val orders: List<Order> = emptyList(),
    val filter: OrderFilter = OrderFilter.ALL,
    val isRefreshing: Boolean = false,
    val errorMessage: String? = null,
)

@HiltViewModel
class OrdersViewModel @Inject constructor(private val repo: OrdersRepository) : ViewModel() {
    private val filter = MutableStateFlow(OrderFilter.ALL)
    private val refreshing = MutableStateFlow(false)
    private val error = MutableStateFlow<String?>(null)

    val state: StateFlow<OrdersUiState> = combine(repo.observeOrders(), filter, refreshing, error) { orders, f, r, e ->
        OrdersUiState(orders.filter(f::matches), f, r, e)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), OrdersUiState(isRefreshing = true))

    fun onFilterChange(f: OrderFilter) { filter.value = f }
    fun onErrorShown() { error.value = null }
    fun onRefresh() = viewModelScope.launch {
        refreshing.value = true
        repo.refresh().onFailure { error.value = "Couldn't refresh. Check your connection." }
        refreshing.value = false
    }
}
