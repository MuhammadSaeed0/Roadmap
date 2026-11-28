@Composable
fun NotesApp(viewModel: NotesViewModel) {
    val notes by viewModel.notes.collectAsStateWithLifecycle()
    val navigator = rememberListDetailPaneScaffoldNavigator<Long>()
    val scope = rememberCoroutineScope()
    fun open(id: Long) { viewModel.select(id); scope.launch { navigator.navigateTo(ListDetailPaneScaffoldRole.Detail, id) } }

    BackHandler(navigator.canNavigateBack()) { scope.launch { navigator.navigateBack() } }
    NavigationSuiteScaffold(
        navigationSuiteItems = { NotesDestinations.forEach { d -> item(selected = d.selected, onClick = d.onClick, icon = { Icon(d.icon, null) }, label = { Text(d.label) }) } },
        modifier = Modifier.onPreviewKeyEvent { e ->
            if (e.type == KeyEventType.KeyDown && e.isCtrlPressed && e.key == Key.N) { open(viewModel.createNote()); true } else false
        }
    ) {
        ListDetailPaneScaffold(
            directive = navigator.scaffoldDirective,
            value = navigator.scaffoldValue,
            listPane = { AnimatedPane { NoteList(notes, onOpen = ::open) } },
            detailPane = { AnimatedPane { navigator.currentDestination?.contentKey?.let { NoteEditor(it) } ?: EmptyEditor() } }
        )
    }
}

class NotesViewModel(private val repo: NotesRepository, private val handle: SavedStateHandle) : ViewModel() {
    val notes = repo.notes().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
    val selectedId = handle.getStateFlow<Long?>("selected", null)
    fun select(id: Long) { handle["selected"] = id }
    fun createNote(): Long = repo.createBlocking()
}
