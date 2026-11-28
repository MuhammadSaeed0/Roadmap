@OptIn(ExperimentalCoroutinesApi::class)
class MainDispatcherRule(val dispatcher: TestDispatcher = UnconfinedTestDispatcher()) : TestWatcher() {
    override fun starting(description: Description) = Dispatchers.setMain(dispatcher)
    override fun finished(description: Description) = Dispatchers.resetMain()
}

class CheckoutViewModelTest {
    @get:Rule val main = MainDispatcherRule()
    private val cart = FakeCartRepository(items = listOf(item("Mug", 1200, qty = 2)))
    private val payments = FakePaymentApi()

    @Test fun totalIncludesQuantities() = runTest {
        val vm = CheckoutViewModel(cart, payments)
        assertEquals(2400, vm.state.value.totalCents)
    }

    @Test fun doubleTapSendsOnePayment() = runTest {
        payments.delayMs = 1_000
        val vm = CheckoutViewModel(cart, payments)
        vm.onPay(); vm.onPay()
        advanceUntilIdle()
        assertEquals(1, payments.calls)
    }

    @Test fun failureShowsRetryAndKeepsCart() = runTest {
        payments.failWith = IOException()
        val vm = CheckoutViewModel(cart, payments)
        vm.state.test {
            skipItems(1)
            vm.onPay()
            assertTrue(awaitItem().paying)
            val failed = awaitItem()
            assertEquals(CheckoutError.Network, failed.error)
            assertEquals(1, failed.items.size)
        }
    }
}
