class FeedbackViewModel(private val saved: SavedStateHandle) : ViewModel() {
    val name = saved.getStateFlow("name", "")
    val message = saved.getStateFlow("message", "")
    fun onName(v: String) { saved["name"] = v }
    fun onMessage(v: String) { saved["message"] = v }
}

@Composable
fun FeedbackForm(onSend: (String, String) -> Unit, vm: FeedbackViewModel = viewModel()) {
    val name by vm.name.collectAsStateWithLifecycle()
    val message by vm.message.collectAsStateWithLifecycle()
    Column {
        TextField(value = name, onValueChange = vm::onName, label = { Text("Name") })
        TextField(value = message, onValueChange = vm::onMessage, label = { Text("Message") })
        Button(onClick = { onSend(name, message) }) { Text("Send") }
    }
}
