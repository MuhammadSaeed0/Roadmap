@Composable
fun PaymentScreen(vm: PaymentViewModel = viewModel()) {
    val state by vm.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }

    // One-off events: collected once per screen, not repeated on recomposition or rotation.
    LaunchedEffect(Unit) {
        vm.events.collect { event -> if (event is PaymentEvent.Failed) snackbar.showSnackbar(event.message) }
    }

    // Register and clean up a listener with the screen's lifetime.
    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, e -> if (e == Lifecycle.Event.ON_RESUME) vm.refreshBalance() }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    val total by animateFloatAsState(state.total.toFloat(), label = "total")
    Scaffold(snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        Column(Modifier.padding(padding)) {
            Text("Total: %.2f EGP".format(total))
            AnimatedVisibility(visible = state.canRetry) { Button(onClick = vm::retry) { Text("Try again") } }
        }
    }
}
