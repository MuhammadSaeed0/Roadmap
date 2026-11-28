@Composable
fun MailApp(viewModel: MailViewModel = hiltViewModel()) {
    var destination by rememberSaveable { mutableStateOf(Destination.Inbox) }
    NavigationSuiteScaffold(                                 // bottom bar, rail or drawer from the window size
        navigationSuiteItems = {
            Destination.entries.forEach { d ->
                item(selected = d == destination, onClick = { destination = d },
                    icon = { Icon(d.icon, null) }, label = { Text(stringResource(d.label)) })
            }
        }
    ) {
        val navigator = rememberListDetailPaneScaffoldNavigator<Long>()
        val scope = rememberCoroutineScope()
        ListDetailPaneScaffold(                              // one pane on phones, two on wide windows
            directive = navigator.scaffoldDirective,
            value = navigator.scaffoldValue,
            listPane = { AnimatedPane { Inbox(onOpen = { id -> scope.launch { navigator.navigateTo(ListDetailPaneScaffoldRole.Detail, id) } }) } },
            detailPane = { AnimatedPane { navigator.currentDestination?.contentKey?.let { MessageScreen(it) } ?: EmptyDetail() } }
        )
    }
}

// Keyboard shortcuts for large screens and desktop windows
Modifier.onPreviewKeyEvent { e ->
    if (e.type == KeyEventType.KeyDown && e.isCtrlPressed && e.key == Key.N) { onCompose(); true } else false
}
