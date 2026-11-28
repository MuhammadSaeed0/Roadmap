class CheckoutViewModel(
    private val saved: SavedStateHandle,
    private val cart: CartRepository,          // survives in Room, reloaded after process death
) : ViewModel() {
    val couponCode = saved.getStateFlow("coupon", "")       // small UI state, restored from the Bundle
    val items = cart.observeItems().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun onCouponChange(code: String) { saved["coupon"] = code }
}
