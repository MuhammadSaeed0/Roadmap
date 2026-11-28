@Composable
fun ProductScreen(productId: Int, onShare: (String) -> Unit, vm: ProductViewModel = viewModel()) {
    // Challenge: what is wrong with each effect below? Fix them.
    LaunchedEffect(Unit) { vm.load(productId) }              // productId can change
    vm.trackView(productId)                                   // runs on every recomposition
    val scope = CoroutineScope(Dispatchers.Main)              // never cancelled
    Button(onClick = { scope.launch { vm.share()?.let(onShare) } }) { Text("Share") }
}
