class MainActivity : ComponentActivity() {
    private val tag = "Lifecycle"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(tag, "onCreate (restored: ${savedInstanceState != null})")
        setContent { CounterScreen() }
    }

    override fun onStart() { super.onStart(); Log.d(tag, "onStart") }
    override fun onResume() { super.onResume(); Log.d(tag, "onResume") }
    override fun onPause() { Log.d(tag, "onPause"); super.onPause() }
    override fun onStop() { Log.d(tag, "onStop"); super.onStop() }
    override fun onDestroy() { Log.d(tag, "onDestroy (finishing: $isFinishing)"); super.onDestroy() }
}

class CounterViewModel(private val saved: SavedStateHandle) : ViewModel() {
    // Survives rotation (ViewModel) and process death (SavedStateHandle).
    val count: StateFlow<Int> = saved.getStateFlow("count", 0)
    fun increment() { saved["count"] = count.value + 1 }
}

@Composable
fun CounterScreen(vm: CounterViewModel = viewModel()) {
    val count by vm.count.collectAsStateWithLifecycle()
    var note by rememberSaveable { mutableStateOf("") }      // small UI state, saved in the Bundle
    Column {
        Text("Count: $count")
        Button(onClick = vm::increment) { Text("Add") }
        TextField(value = note, onValueChange = { note = it })
    }
}
