class CheckoutViewModelTest {
    @get:Rule val main = MainDispatcherRule(StandardTestDispatcher())

    @Test fun doubleTapSendsOnePayment() = runTest {
        val api = FakePaymentApi().apply { delayMs = 2_000 }
        val vm = CheckoutViewModel(FakeCartRepository(items = listOf(item("Mug", 1200))), api)

        vm.onPay()
        vm.onPay()                       // second tap while the first is running
        advanceUntilIdle()

        assertEquals(1, api.calls)
        assertEquals(CheckoutStatus.Paid, vm.state.value.status)
    }
}

// In the ViewModel
private var payJob: Job? = null
fun onPay() {
    if (payJob?.isActive == true) return
    payJob = viewModelScope.launch {
        _state.update { it.copy(paying = true) }
        val result = runCatchingNonCancellation { payments.pay(_state.value.toRequest()) }
        _state.update { it.copy(paying = false, status = if (result.isSuccess) CheckoutStatus.Paid else CheckoutStatus.Failed) }
    }
}
