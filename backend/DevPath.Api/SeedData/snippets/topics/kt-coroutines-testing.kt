@OptIn(ExperimentalCoroutinesApi::class)
class SearchViewModelTest {
    @get:Rule val main = MainDispatcherRule()          // Dispatchers.setMain(test dispatcher)

    @Test fun searchesOnceAfterTheUserStopsTyping() = runTest {
        val repo = FakeProductRepository()
        val vm = SearchViewModel(repo)
        backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { vm.results.collect {} }

        vm.onQueryChange("k"); advanceTimeBy(100)
        vm.onQueryChange("ko"); advanceTimeBy(100)
        vm.onQueryChange("kot"); advanceTimeBy(299)
        assertEquals(emptyList<String>(), repo.queries)   // still debouncing

        advanceTimeBy(2); runCurrent()
        assertEquals(listOf("kot"), repo.queries)
    }

    @Test fun statesArriveInOrder() = runTest {
        val vm = OrdersViewModel(FakeOrdersRepository(listOf(order(1))))
        vm.state.test {                                   // Turbine
            assertTrue(awaitItem().isRefreshing)
            assertEquals(1, awaitItem().orders.size)
            cancelAndIgnoreRemainingEvents()
        }
    }
}
