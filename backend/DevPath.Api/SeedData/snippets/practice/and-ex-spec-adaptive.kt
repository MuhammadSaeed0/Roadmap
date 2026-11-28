@Composable
fun NotesApp(viewModel: NotesViewModel) {
    val notes by viewModel.notes.collectAsStateWithLifecycle()
    var openId by remember { mutableStateOf<Long?>(null) }        // lost on resize
    Scaffold(bottomBar = { NotesBottomBar() }) { padding ->          // bottom bar even on tablets
        if (openId == null) NoteList(notes, onOpen = { openId = it }, Modifier.padding(padding))
        else NoteEditor(openId!!, onBack = { openId = null }, Modifier.padding(padding))
    }
}
