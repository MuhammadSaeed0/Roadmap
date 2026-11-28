@Composable
fun OrderScreen(orderId: Int, onTimeout: () -> Unit, vm: OrderViewModel = viewModel()) {
    val state by vm.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current

    analytics.log("order_opened", orderId)
    LaunchedEffect(Unit) { vm.load(orderId) }
    val scope = CoroutineScope(Dispatchers.Main)
    sensorManager(context).registerListener(vm.shakeListener, accelerometer, SENSOR_DELAY_UI)
    LaunchedEffect(Unit) { delay(60_000); onTimeout() }
    if (state.message != null) LaunchedEffect(state.message) { snackbar.showSnackbar(state.message!!) }

    Button(onClick = { scope.launch { vm.cancel() } }) { Text("Cancel order") }
}
